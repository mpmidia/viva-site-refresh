import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, FileText, Plus, Trash2, Upload, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchNextEdition, type NextEdition, type NextEditionRow } from "@/lib/site-content";
import { SITE_BUCKET, removeFile, signPaths, uploadFile } from "@/lib/storage";
import { Card, FField, ghostBtn, inputCls, primaryBtn } from "./ui";

type FormState = {
  cidade: string;
  dataEvento: string;
  dataFim: string;
  locais: string[];
  inscricoesAbertura: string;
  inscricoesEncerramento: string;
  programacaoData: string;
  possuiOficinas: boolean;
};

const emptyForm: FormState = {
  cidade: "", dataEvento: "", dataFim: "", locais: [],
  inscricoesAbertura: "", inscricoesEncerramento: "", programacaoData: "", possuiOficinas: false,
};

export function NextEditionPanel() {
  const queryClient = useQueryClient();
  const [row, setRow] = useState<NextEdition | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [novoLocal, setNovoLocal] = useState("");
  const [capasUrls, setCapasUrls] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  // Evita que um carregamento em andamento sobrescreva o que a equipe já está digitando.
  const dirty = useRef(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => { dirty.current = true; setForm((f) => ({ ...f, [k]: v })); };

  const load = async (resetForm = true) => {
    const data = await fetchNextEdition();
    if (!data) return;
    setRow(data);
    setCapasUrls(await signPaths(SITE_BUCKET, data.capas ?? []));
    if (resetForm || !dirty.current) {
      setForm({
        cidade: data.cidade ?? "",
        dataEvento: data.data_evento ?? "",
        dataFim: data.data_fim ?? "",
        locais: data.locais ?? [],
        inscricoesAbertura: data.inscricoes_abertura ?? "",
        inscricoesEncerramento: data.inscricoes_encerramento ?? "",
        programacaoData: data.programacao_data ?? "",
        possuiOficinas: data.possui_oficinas,
      });
      dirty.current = false;
    }
  };
  useEffect(() => { void load(); }, []);

  const persist = async (patch: Partial<NextEditionRow>) => {
    if (!row) return false;
    const { error } = await supabase.from("next_edition").update(patch).eq("id", row.id);
    if (error) { toast.error(error.message); return false; }
    await queryClient.invalidateQueries({ queryKey: ["next-edition"] });
    return true;
  };

  const saveAll = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const ok = await persist({
      cidade: form.cidade.trim() || null,
      data_evento: form.dataEvento || null,
      data_fim: form.dataFim || null,
      locais: form.locais,
      inscricoes_abertura: form.inscricoesAbertura || null,
      inscricoes_encerramento: form.inscricoesEncerramento || null,
      programacao_data: form.programacaoData || null,
      possui_oficinas: form.possuiOficinas,
    });
    setSaving(false);
    if (ok) { toast.success("Próxima edição atualizada."); dirty.current = false; await load(true); }
  };

  const addCapas = async (files: FileList | null) => {
    if (!files?.length || !row) return;
    try {
      const paths = [...row.capas];
      for (const file of Array.from(files)) paths.push(await uploadFile(SITE_BUCKET, "capas", file));
      if (await persist({ capas: paths })) { toast.success("Imagens adicionadas."); await load(false); }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload.");
    }
  };

  const removeCapa = async (path: string) => {
    if (!row) return;
    const paths = row.capas.filter((p) => p !== path);
    if (await persist({ capas: paths })) { await removeFile(SITE_BUCKET, path); await load(false); }
  };

  const moveCapa = async (index: number, delta: number) => {
    if (!row) return;
    const target = index + delta;
    if (target < 0 || target >= row.capas.length) return;
    const paths = [...row.capas];
    [paths[index], paths[target]] = [paths[target], paths[index]];
    if (await persist({ capas: paths })) await load(false);
  };

  const uploadSingle = async (file: File, field: "regulamento_url" | "logos_url", current: string | null) => {
    try {
      const path = await uploadFile(SITE_BUCKET, field === "logos_url" ? "logos" : "regulamento", file);
      if (await persist({ [field]: path })) {
        if (current) await removeFile(SITE_BUCKET, current);
        toast.success("Arquivo enviado.");
        await load(false);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload.");
    }
  };

  const removeSingle = async (field: "regulamento_url" | "logos_url", current: string | null) => {
    if (!current) return;
    if (await persist({ [field]: null })) { await removeFile(SITE_BUCKET, current); await load(false); }
  };

  if (!row) return <p className="text-muted-foreground">Carregando...</p>;

  const addLocal = () => {
    const value = novoLocal.trim();
    if (!value) return;
    set("locais", [...form.locais, value]);
    setNovoLocal("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Próxima edição</h2>
        <p className="text-sm text-muted-foreground">As datas ligam e desligam sozinhas as inscrições e a programação no site. O vídeo só é cadastrado depois, na aba Edições.</p>
      </div>

      <form onSubmit={saveAll} className="space-y-6">
        <Card title="O anúncio" description="Cidade, locais e período da edição. É o que aparece em destaque na página pública.">
          <FField label="Cidade"><input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} className={inputCls} /></FField>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FField label="Início da edição"><input type="date" value={form.dataEvento} onChange={(e) => set("dataEvento", e.target.value)} className={inputCls} /></FField>
            <FField label="Término da edição"><input type="date" value={form.dataFim} onChange={(e) => set("dataFim", e.target.value)} className={inputCls} /></FField>
          </div>
          <div className="mt-4">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Locais</span>
            <div className="space-y-2">
              {form.locais.map((local, i) => (
                <div key={`local-${i}`} className="flex items-center gap-2">
                  <input value={local} onChange={(e) => set("locais", form.locais.map((l, idx) => (idx === i ? e.target.value : l)))} className={inputCls} />
                  <button type="button" onClick={() => set("locais", form.locais.filter((_, idx) => idx !== i))} className="rounded-full border border-destructive/30 p-2 text-destructive"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input value={novoLocal} onChange={(e) => setNovoLocal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLocal(); } }} placeholder="Novo local" className={inputCls} />
              <button type="button" onClick={addLocal} className={ghostBtn}><Plus className="size-4" /></button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Estes locais alimentam automaticamente o campo “Local” da programação.</p>
          </div>
        </Card>

        <Card title="Período de inscrições" description="Antes do início, o site não mostra o botão. Depois do término, mostra “Inscrições encerradas”.">
          <div className="grid gap-4 md:grid-cols-2">
            <FField label="Início das inscrições"><input type="date" value={form.inscricoesAbertura} onChange={(e) => set("inscricoesAbertura", e.target.value)} className={inputCls} /></FField>
            <FField label="Término das inscrições"><input type="date" value={form.inscricoesEncerramento} onChange={(e) => set("inscricoesEncerramento", e.target.value)} className={inputCls} /></FField>
          </div>
        </Card>

        <Card title="Programação" description="Antes desta data a página pública mostra apenas “Aguarde” com a data de divulgação.">
          <FField label="Data de divulgação da programação">
            <input type="date" value={form.programacaoData} onChange={(e) => set("programacaoData", e.target.value)} className={inputCls} />
          </FField>
        </Card>

        <Card title="Oficinas">
          <FField label="Haverá oficinas?">
            <select value={form.possuiOficinas ? "sim" : "nao"} onChange={(e) => set("possuiOficinas", e.target.value === "sim")} className={inputCls}>
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </select>
          </FField>
          <p className="mt-2 text-xs text-muted-foreground">Com “Sim”, o bloco de oficina aparece no formulário de inscrição e a informação aparece na página pública.</p>
        </Card>

        <button disabled={saving} className={primaryBtn}>{saving ? "Salvando..." : "Salvar informações"}</button>
      </form>

      <Card title="Imagens de capa" description="Aparecem em revezamento automático na capa da página Próxima Edição.">
        <label className={ghostBtn + " inline-flex cursor-pointer items-center gap-2"}>
          <Upload className="size-4" /> Adicionar imagens
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const f = Array.from(e.target.files ?? []); e.target.value = ""; void addCapas(f); }} />
        </label>
        {row.capas.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {row.capas.map((path, i) => (
              <div key={path} className="rounded-2xl border p-2">
                {capasUrls[path] && <img src={capasUrls[path]} alt={`Capa ${i + 1}`} className="aspect-video w-full rounded-xl object-cover" />}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">#{i + 1}</span>
                  <div className="flex gap-1">
                    <button onClick={() => void moveCapa(i, -1)} className="rounded-full border p-1.5"><ArrowUp className="size-3.5" /></button>
                    <button onClick={() => void moveCapa(i, 1)} className="rounded-full border p-1.5"><ArrowDown className="size-3.5" /></button>
                    <button onClick={() => void removeCapa(path)} className="rounded-full border border-destructive/30 p-1.5 text-destructive"><X className="size-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Regulamento (PDF)" description="Fica disponível na página da próxima edição e no formulário de inscrição.">
        {row.regulamentoUrl && <a href={row.regulamentoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-pink underline"><FileText className="size-4" /> Ver regulamento atual</a>}
        <div className="mt-3 flex flex-wrap gap-2">
          <label className={ghostBtn + " inline-flex cursor-pointer items-center gap-2"}>
            <Upload className="size-4" /> {row.regulamento_url ? "Substituir PDF" : "Enviar PDF"}
            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadSingle(f, "regulamento_url", row.regulamento_url); }} />
          </label>
          {row.regulamento_url && <button onClick={() => void removeSingle("regulamento_url", row.regulamento_url)} className="rounded-full border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive">Remover</button>}
        </div>
      </Card>

      <Card title="Barra de logos" description="Imagem com os logos dos parceiros. Aparece nas páginas Próxima Edição e Programação.">
        {row.logosUrl && <img src={row.logosUrl} alt="Barra de logos" className="w-full rounded-xl border bg-background object-contain p-3" />}
        <div className="mt-3 flex flex-wrap gap-2">
          <label className={ghostBtn + " inline-flex cursor-pointer items-center gap-2"}>
            <Upload className="size-4" /> {row.logos_url ? "Substituir barra" : "Enviar barra de logos"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadSingle(f, "logos_url", row.logos_url); }} />
          </label>
          {row.logos_url && <button onClick={() => void removeSingle("logos_url", row.logos_url)} className="rounded-full border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive">Remover</button>}
        </div>
      </Card>
    </div>
  );
}
