import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, FileText, Plus, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchNextEdition, type NextEdition, type NextEditionRow } from "@/lib/site-content";
import { SITE_BUCKET, removeFile, signPaths, uploadFile } from "@/lib/storage";
import { Card, FField, ghostBtn, inputCls, primaryBtn } from "./ui";

export function NextEditionPanel() {
  const [row, setRow] = useState<NextEdition | null>(null);
  const [cidade, setCidade] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [locais, setLocais] = useState<string[]>([]);
  const [novoLocal, setNovoLocal] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [capas, setCapas] = useState<string[]>([]);
  const [capasUrls, setCapasUrls] = useState<Record<string, string>>({});
  const [abertura, setAbertura] = useState("");
  const [programacaoData, setProgramacaoData] = useState("");
  const [oficinas, setOficinas] = useState(false);
  const [regulamento, setRegulamento] = useState<string | null>(null);
  const [regulamentoUrl, setRegulamentoUrl] = useState<string | null>(null);
  const [logos, setLogos] = useState<string | null>(null);
  const [logosUrl, setLogosUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await fetchNextEdition();
    if (!data) return;
    setRow(data);
    setCidade(data.cidade ?? "");
    setDataEvento(data.data_evento ?? "");
    setLocais(data.locais ?? []);
    setVideoUrl(data.video_url ?? "");
    setCapas(data.capas ?? []);
    setCapasUrls(await signPaths(SITE_BUCKET, data.capas ?? []));
    setAbertura(data.inscricoes_abertura ?? "");
    setProgramacaoData(data.programacao_data ?? "");
    setOficinas(data.possui_oficinas);
    setRegulamento(data.regulamento_url);
    setRegulamentoUrl(data.regulamentoUrl);
    setLogos(data.logos_url);
    setLogosUrl(data.logosUrl);
  };
  useEffect(() => { void load(); }, []);

  const persist = async (patch: Partial<NextEditionRow>) => {
    if (!row) return;
    const { error } = await supabase.from("next_edition").update(patch).eq("id", row.id);
    if (error) { toast.error(error.message); return false; }
    return true;
  };

  const saveAll = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const ok = await persist({
      cidade: cidade || null,
      data_evento: dataEvento || null,
      locais,
      video_url: videoUrl || null,
      inscricoes_abertura: abertura || null,
      programacao_data: programacaoData || null,
      possui_oficinas: oficinas,
    });
    setSaving(false);
    if (ok) { toast.success("Próxima edição atualizada."); await load(); }
  };

  const addCapas = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const paths = [...capas];
      for (const file of Array.from(files)) paths.push(await uploadFile(SITE_BUCKET, "capas", file));
      if (await persist({ capas: paths })) { toast.success("Imagens adicionadas."); await load(); }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload.");
    }
  };

  const removeCapa = async (path: string) => {
    const paths = capas.filter((p) => p !== path);
    if (await persist({ capas: paths })) { await removeFile(SITE_BUCKET, path); await load(); }
  };

  const moveCapa = async (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= capas.length) return;
    const paths = [...capas];
    [paths[index], paths[target]] = [paths[target], paths[index]];
    if (await persist({ capas: paths })) await load();
  };

  const uploadSingle = async (file: File, field: "regulamento_url" | "logos_url", current: string | null) => {
    try {
      const path = await uploadFile(SITE_BUCKET, field === "logos_url" ? "logos" : "regulamento", file);
      if (await persist({ [field]: path })) {
        if (current) await removeFile(SITE_BUCKET, current);
        toast.success("Arquivo enviado.");
        await load();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload.");
    }
  };

  const removeSingle = async (field: "regulamento_url" | "logos_url", current: string | null) => {
    if (!current) return;
    if (await persist({ [field]: null })) { await removeFile(SITE_BUCKET, current); await load(); }
  };

  if (!row) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Próxima edição</h2>
        <p className="text-sm text-muted-foreground">As datas ligam e desligam sozinhas os botões de inscrição e programação no site.</p>
      </div>

      <form onSubmit={saveAll} className="space-y-6">
        <Card title="Fase 1 — O Anúncio">
          <div className="grid gap-4 md:grid-cols-2">
            <FField label="Cidade"><input value={cidade} onChange={(e) => setCidade(e.target.value)} className={inputCls} /></FField>
            <FField label="Data da edição"><input type="date" value={dataEvento} onChange={(e) => setDataEvento(e.target.value)} className={inputCls} /></FField>
          </div>
          <div className="mt-4">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Locais</span>
            <div className="space-y-2">
              {locais.map((local, i) => (
                <div key={`${local}-${i}`} className="flex items-center gap-2">
                  <input value={local} onChange={(e) => setLocais(locais.map((l, idx) => (idx === i ? e.target.value : l)))} className={inputCls} />
                  <button type="button" onClick={() => setLocais(locais.filter((_, idx) => idx !== i))} className="rounded-full border border-destructive/30 p-2 text-destructive"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input value={novoLocal} onChange={(e) => setNovoLocal(e.target.value)} placeholder="Novo local" className={inputCls} />
              <button type="button" onClick={() => { if (novoLocal.trim()) { setLocais([...locais, novoLocal.trim()]); setNovoLocal(""); } }} className={ghostBtn}><Plus className="size-4" /></button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Estes locais alimentam automaticamente o campo “Local” da programação.</p>
          </div>
        </Card>

        <Card title="Fase 2 — Inscrições">
          <FField label="Data de abertura das inscrições" hint="Antes desta data o botão fica desativado; a partir dela, é liberado automaticamente.">
            <input type="date" value={abertura} onChange={(e) => setAbertura(e.target.value)} className={inputCls} />
          </FField>
        </Card>

        <Card title="Fase 3 — Programação">
          <FField label="Data de divulgação da programação" hint="A partir desta data o botão para a página da programação é liberado.">
            <input type="date" value={programacaoData} onChange={(e) => setProgramacaoData(e.target.value)} className={inputCls} />
          </FField>
        </Card>

        <Card title="Vídeo e oficinas">
          <FField label="Link do vídeo da edição" hint="Cole o link do YouTube, Vimeo ou de um arquivo de vídeo. O vídeo aparece incorporado na página.">
            <input type="url" placeholder="https://..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={inputCls} />
          </FField>
          <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={oficinas} onChange={(e) => setOficinas(e.target.checked)} /> Esta edição possui oficinas
          </label>
          <p className="text-xs text-muted-foreground">Quando marcado, o bloco de oficina aparece no formulário de inscrição.</p>
        </Card>

        <button disabled={saving} className={primaryBtn}>{saving ? "Salvando..." : "Salvar informações"}</button>
      </form>

      <Card title="Imagens de capa" description="Aparecem em revezamento automático na capa da página Próxima Edição.">
        <label className={ghostBtn + " inline-flex cursor-pointer items-center gap-2"}>
          <Upload className="size-4" /> Adicionar imagens
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const f = e.target.files; e.target.value = ""; void addCapas(f); }} />
        </label>
        {capas.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capas.map((path, i) => (
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
        {regulamentoUrl && <a href={regulamentoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-pink underline"><FileText className="size-4" /> Ver regulamento atual</a>}
        <div className="mt-3 flex flex-wrap gap-2">
          <label className={ghostBtn + " inline-flex cursor-pointer items-center gap-2"}>
            <Upload className="size-4" /> {regulamento ? "Substituir PDF" : "Enviar PDF"}
            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadSingle(f, "regulamento_url", regulamento); }} />
          </label>
          {regulamento && <button onClick={() => void removeSingle("regulamento_url", regulamento)} className="rounded-full border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive">Remover</button>}
        </div>
      </Card>

      <Card title="Barra de logos" description="Imagem com os logos dos parceiros. Aparece nas páginas Próxima Edição e Programação.">
        {logosUrl && <img src={logosUrl} alt="Barra de logos" className="w-full rounded-xl border bg-background object-contain p-3" />}
        <div className="mt-3 flex flex-wrap gap-2">
          <label className={ghostBtn + " inline-flex cursor-pointer items-center gap-2"}>
            <Upload className="size-4" /> {logos ? "Substituir barra" : "Enviar barra de logos"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadSingle(f, "logos_url", logos); }} />
          </label>
          {logos && <button onClick={() => void removeSingle("logos_url", logos)} className="rounded-full border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive">Remover</button>}
        </div>
      </Card>
    </div>
  );
}
