import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchEditions, type EditionView } from "@/lib/editions";
import { SITE_BUCKET, removeFile } from "@/lib/storage";
import { ImageManager } from "./image-manager";
import { FField, ghostBtn, inputCls, primaryBtn } from "./ui";

type Draft = {
  id: string; titulo: string; data: string; local: string; participantes: number;
  descricao: string; inscricao_url: string; video_url: string; imagens: string[]; imagem_url: string | null;
};

const emptyDraft = (): Draft => ({
  id: "", titulo: "", data: new Date().toISOString().slice(0, 10), local: "", participantes: 0,
  descricao: "", inscricao_url: "", video_url: "", imagens: [], imagem_url: null,
});

export function EditionsPanel() {
  const queryClient = useQueryClient();
  const [editions, setEditions] = useState<EditionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setEditions(await fetchEditions());
      await queryClient.invalidateQueries({ queryKey: ["editions"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar edições.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const onDelete = async (item: EditionView) => {
    if (!confirm("Excluir esta edição?")) return;
    const { error } = await supabase.from("editions").delete().eq("id", item.id);
    if (error) return toast.error(error.message);
    for (const path of item.imagens ?? []) await removeFile(SITE_BUCKET, path);
    toast.success("Edição excluída.");
    await load();
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const payload = {
      titulo: editing.titulo,
      data: editing.data,
      local: editing.local,
      participantes: editing.participantes,
      descricao: editing.descricao,
      inscricao_url: editing.inscricao_url.trim() || null,
      video_url: editing.video_url.trim() || null,
      imagens: editing.imagens,
      imagem_url: editing.imagem_url,
    };
    const { error } = editing.id
      ? await supabase.from("editions").update(payload).eq("id", editing.id)
      : await supabase.from("editions").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Edição atualizada!" : "Edição criada!");
    setEditing(null);
    await load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Edições</h2>
          <p className="text-sm text-muted-foreground">Edições já realizadas. A próxima edição é cadastrada na aba “Próxima Edição”.</p>
        </div>
        <button onClick={() => setEditing(emptyDraft())} className={primaryBtn}><Plus className="mr-1 inline size-4" />Nova edição</button>
      </div>

      {loading ? (
        <p className="mt-8 text-muted-foreground">Carregando edições...</p>
      ) : editions.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed bg-card p-10 text-center">
          <p className="text-muted-foreground">Nenhuma edição cadastrada ainda. Clique em “Nova edição” para começar.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {editions.map((e) => (
            <div key={e.id} className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border bg-card p-5">
              {e.coverUrl && <img src={e.coverUrl} alt={e.titulo} className="size-24 shrink-0 rounded-xl object-cover" />}
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl">{e.titulo}</h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="size-4" />{new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  <span className="flex items-center gap-1"><MapPin className="size-4" />{e.local}</span>
                  <span className="flex items-center gap-1"><Users className="size-4" />{e.participantes}</span>
                  <span>{e.imagens.length} imagem(ns){e.video_url ? " · com vídeo" : ""}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{e.descricao}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing({
                    id: e.id, titulo: e.titulo, data: e.data, local: e.local, participantes: e.participantes,
                    descricao: e.descricao, inscricao_url: e.inscricao_url ?? "", video_url: e.video_url ?? "",
                    imagens: e.imagens ?? [], imagem_url: e.imagem_url,
                  })}
                  className="rounded-full border p-2 hover:bg-accent/40"
                ><Pencil className="size-4" /></button>
                <button onClick={() => void onDelete(e)} className="rounded-full border border-destructive/30 p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-card p-8 shadow-2xl">
            <h3 className="font-display text-2xl text-brand-pink">{editing.id ? "Editar edição" : "Nova edição"}</h3>
            <div className="mt-6 grid gap-4">
              <FField label="Título"><input required value={editing.titulo} onChange={(e) => setEditing({ ...editing, titulo: e.target.value })} className={inputCls} /></FField>
              <div className="grid gap-4 md:grid-cols-2">
                <FField label="Data"><input required type="date" value={editing.data} onChange={(e) => setEditing({ ...editing, data: e.target.value })} className={inputCls} /></FField>
                <FField label="Nº de participantes"><input required type="number" min={0} value={editing.participantes} onChange={(e) => setEditing({ ...editing, participantes: parseInt(e.target.value) || 0 })} className={inputCls} /></FField>
              </div>
              <FField label="Local"><input required value={editing.local} onChange={(e) => setEditing({ ...editing, local: e.target.value })} className={inputCls} /></FField>
              <FField label="Descritivo"><textarea required rows={6} value={editing.descricao} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} className={inputCls} /></FField>
              <FField label="Link do vídeo da edição (opcional)" hint="YouTube, Vimeo ou arquivo de vídeo. Sem link, a página não mostra player.">
                <input type="url" placeholder="https://..." value={editing.video_url} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })} className={inputCls} />
              </FField>
              <FField label="Link do botão de inscrição (opcional)">
                <input type="url" placeholder="https://..." value={editing.inscricao_url} onChange={(e) => setEditing({ ...editing, inscricao_url: e.target.value })} className={inputCls} />
              </FField>
              <div>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Imagens da edição</span>
                <p className="mb-2 text-xs text-muted-foreground">Envie quantas quiser. Escolha uma delas como capa.</p>
                <ImageManager
                  folder="edicoes"
                  paths={editing.imagens}
                  cover={editing.imagem_url}
                  onChange={(paths, cover) => setEditing((d) => (d ? { ...d, imagens: paths, imagem_url: cover } : d))}
                />
              </div>
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
