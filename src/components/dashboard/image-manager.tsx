import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Star, Trash2, Upload } from "lucide-react";
import { SITE_BUCKET, removeFile, signPaths, uploadFile } from "@/lib/storage";
import { ghostBtn } from "./ui";

/**
 * Gerenciador de imagens por upload: envia, visualiza, define a capa e exclui.
 * Trabalha sempre com caminhos de arquivo no armazenamento — nunca com URLs digitadas.
 */
export function ImageManager({
  folder,
  paths,
  cover,
  multiple = true,
  onChange,
}: {
  folder: string;
  paths: string[];
  cover?: string | null;
  multiple?: boolean;
  onChange: (paths: string[], cover: string | null) => void;
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void signPaths(SITE_BUCKET, paths).then((map) => { if (active) setUrls(map); });
    return () => { active = false; };
  }, [paths.join("|")]);

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const list = multiple ? Array.from(files) : [files[0]];
      const added: string[] = [];
      for (const file of list) added.push(await uploadFile(SITE_BUCKET, folder, file));
      if (multiple) {
        const all = [...paths, ...added];
        onChange(all, cover ?? all[0] ?? null);
      } else {
        for (const old of paths) await removeFile(SITE_BUCKET, old);
        onChange(added, added[0] ?? null);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload da imagem.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (path: string) => {
    const rest = paths.filter((p) => p !== path);
    onChange(rest, cover === path ? rest[0] ?? null : cover ?? null);
    await removeFile(SITE_BUCKET, path);
  };

  return (
    <div>
      <label className={ghostBtn + " inline-flex cursor-pointer items-center gap-2"}>
        <Upload className="size-4" /> {busy ? "Enviando..." : multiple ? "Enviar imagens" : paths.length ? "Substituir imagem" : "Enviar imagem"}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => { const f = e.target.files; e.target.value = ""; void add(f); }}
        />
      </label>

      {paths.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((path) => (
            <div key={path} className={`overflow-hidden rounded-2xl border p-2 ${cover === path ? "border-brand-pink" : ""}`}>
              {urls[path] ? (
                <img src={urls[path]} alt="Imagem cadastrada" className="aspect-video w-full rounded-xl object-cover" />
              ) : (
                <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />
              )}
              <div className="mt-2 flex items-center justify-between gap-2">
                {multiple ? (
                  <button
                    type="button"
                    onClick={() => onChange(paths, path)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${cover === path ? "text-brand-pink" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Star className={`size-3.5 ${cover === path ? "fill-current" : ""}`} /> {cover === path ? "Capa" : "Usar como capa"}
                  </button>
                ) : <span />}
                <button type="button" onClick={() => void remove(path)} className="rounded-full border border-destructive/30 p-1.5 text-destructive">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
