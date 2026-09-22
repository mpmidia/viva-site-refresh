import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { IMAGE_SLOTS } from "@/lib/site-content";
import { SITE_BUCKET, removeFile, signPaths, uploadFile } from "@/lib/storage";
import { ghostBtn } from "./ui";

type Row = { id: string; chave: string; url: string };

export function ImagesPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("site_images").select("id, chave, url");
    if (error) return toast.error(error.message);
    const list = (data ?? []) as Row[];
    setRows(list);
    setUrls(await signPaths(SITE_BUCKET, list.map((r) => r.url)));
  };
  useEffect(() => { void load(); }, []);

  const upload = async (chave: string, rotulo: string, file: File) => {
    setBusy(chave);
    try {
      const path = await uploadFile(SITE_BUCKET, "site", file);
      const existing = rows.find((r) => r.chave === chave);
      const { error } = await supabase.from("site_images").upsert({ chave, rotulo, url: path }, { onConflict: "chave" });
      if (error) throw error;
      if (existing) await removeFile(SITE_BUCKET, existing.url);
      toast.success("Imagem atualizada.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setBusy(null);
    }
  };

  const reset = async (chave: string) => {
    const existing = rows.find((r) => r.chave === chave);
    if (!existing) return;
    if (!confirm("Remover esta imagem e voltar à imagem padrão?")) return;
    const { error } = await supabase.from("site_images").delete().eq("id", existing.id);
    if (error) return toast.error(error.message);
    await removeFile(SITE_BUCKET, existing.url);
    toast.success("Imagem removida.");
    await load();
  };

  return (
    <div>
      <h2 className="font-display text-2xl">Imagens do projeto</h2>
      <p className="text-sm text-muted-foreground">Cada espaço abaixo indica onde a imagem aparece no site. Ao enviar uma nova imagem, ela passa a ser usada automaticamente.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {IMAGE_SLOTS.map((slot) => {
          const row = rows.find((r) => r.chave === slot.key);
          const preview = row ? urls[row.url] : slot.fallback;
          return (
            <div key={slot.key} className="rounded-2xl border bg-card p-4">
              <p className="text-sm font-semibold">{slot.rotulo}</p>
              <p className="text-xs text-muted-foreground">{row ? "Imagem enviada pela equipe" : "Imagem padrão do layout"}</p>
              {preview && <img src={preview} alt={slot.rotulo} className="mt-3 aspect-video w-full rounded-xl object-cover" />}
              <div className="mt-3 flex flex-wrap gap-2">
                <label className={ghostBtn + " inline-flex cursor-pointer items-center gap-2"}>
                  <Upload className="size-4" /> {busy === slot.key ? "Enviando..." : row ? "Substituir" : "Enviar imagem"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void upload(slot.key, slot.rotulo, f); }} />
                </label>
                {row && <button onClick={() => void reset(slot.key)} className="rounded-full border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"><Trash2 className="mr-1 inline size-4" />Remover</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
