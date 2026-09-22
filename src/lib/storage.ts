import { supabase } from "@/integrations/supabase/client";

export const SITE_BUCKET = "site-media";
export const FORM_BUCKET = "inscricoes";
const ONE_YEAR = 60 * 60 * 24 * 365;

function safeName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "-")
    .slice(-60);
}

export async function uploadFile(bucket: string, folder: string, file: File): Promise<string> {
  const path = `${folder}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) throw error;
  return path;
}

export async function removeFile(bucket: string, path: string) {
  await supabase.storage.from(bucket).remove([path]);
}

export async function signPath(bucket: string, path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, ONE_YEAR);
  return data?.signedUrl ?? null;
}

export async function signPaths(bucket: string, paths: string[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  const remote = paths.filter((p) => p && !p.startsWith("http"));
  for (const p of paths) if (p?.startsWith("http")) map[p] = p;
  if (remote.length) {
    const { data } = await supabase.storage.from(bucket).createSignedUrls(remote, ONE_YEAR);
    for (const item of data ?? []) if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}
