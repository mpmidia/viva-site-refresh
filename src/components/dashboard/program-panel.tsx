import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllAttractions, fetchNextEdition, type Attraction } from "@/lib/site-content";
import { FField, ghostBtn, inputCls, primaryBtn } from "./ui";

const empty = { id: "", nome: "", descricao: "", data: "", local: "", horario: "", publicado: false };

export function ProgramPanel() {
  const [items, setItems] = useState<Attraction[]>([]);
  const [locais, setLocais] = useState<string[]>([]);
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [list, next] = await Promise.all([fetchAllAttractions(), fetchNextEdition()]);
      setItems(list);
      setLocais(next?.locais ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar atrações.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const payload = {
      nome: editing.nome,
      descricao: editing.descricao,
      data: editing.data || null,
      local: editing.local || null,
      horario: editing.horario || null,
      publicado: editing.publicado,
    };
    const { error } = editing.id
      ? await supabase.from("program_attractions").update(payload).eq("id", editing.id)
      : await supabase.from("program_attractions").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Atração salva.");
    setEditing(null);
    await load();
  };

  const togglePublish = async (item: Attraction) => {
    const { error } = await supabase.from("program_attractions").update({ publicado: !item.publicado }).eq("id", item.id);
    if (error) return toast.error(error.message);
    await load();
  };

  const remove = async (item: Attraction) => {
    if (!confirm("Remover esta atração da programação?")) return;
    const { error } = await supabase.from("program_attractions").delete().eq("id", item.id);
    if (error) return toast.error(error.message);
    toast.success("Atração removida.");
    await load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Programação</h2>
          <p className="text-sm text-muted-foreground">Só atrações publicadas aparecem no site. Sem nenhuma publicada, a página mostra “Em breve”.</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className={primaryBtn}><Plus className="mr-1 inline size-4" />Nova atração</button>
      </div>

      {locais.length === 0 && <p className="mt-4 rounded-2xl bg-brand-yellow/30 p-4 text-sm">Cadastre os locais na aba “Próxima Edição” para poder selecioná-los aqui.</p>}

      {loading ? <p className="mt-6 text-muted-foreground">Carregando...</p> : items.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-dashed bg-card p-10 text-center text-muted-foreground">Nenhuma atração cadastrada.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border bg-card p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg">{item.nome}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.publicado ? "bg-brand-teal/30" : "bg-muted text-muted-foreground"}`}>{item.publicado ? "PUBLICADA" : "NÃO PUBLICADA"}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{[item.data && new Date(item.data + "T00:00:00").toLocaleDateString("pt-BR"), item.horario, item.local].filter(Boolean).join(" · ")}</p>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{item.descricao}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => void togglePublish(item)} className={ghostBtn} title={item.publicado ? "Despublicar" : "Publicar"}>{item.publicado ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
                <button onClick={() => setEditing({ ...item, descricao: item.descricao ?? "", data: item.data ?? "", local: item.local ?? "", horario: item.horario ?? "" })} className={ghostBtn}><Pencil className="size-4" /></button>
                <button onClick={() => void remove(item)} className="rounded-full border border-destructive/30 px-4 py-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-card p-8">
            <h3 className="font-display text-2xl text-brand-pink">{editing.id ? "Editar atração" : "Nova atração"}</h3>
            <div className="mt-5 grid gap-4">
              <FField label="Nome da atração"><input required value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} className={inputCls} /></FField>
              <FField label="Breve descrição"><textarea rows={4} value={editing.descricao} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} className={inputCls} /></FField>
              <div className="grid gap-4 md:grid-cols-2">
                <FField label="Data"><input type="date" value={editing.data} onChange={(e) => setEditing({ ...editing, data: e.target.value })} className={inputCls} /></FField>
                <FField label="Horário"><input type="time" value={editing.horario} onChange={(e) => setEditing({ ...editing, horario: e.target.value })} className={inputCls} /></FField>
              </div>
              <FField label="Local" hint="Locais cadastrados na Fase 1 — O Anúncio.">
                <select value={editing.local} onChange={(e) => setEditing({ ...editing, local: e.target.value })} className={inputCls}>
                  <option value="">Selecione</option>
                  {locais.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </FField>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={editing.publicado} onChange={(e) => setEditing({ ...editing, publicado: e.target.checked })} /> Publicar na página da programação
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className={ghostBtn}>Cancelar</button>
              <button className={primaryBtn}>Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
