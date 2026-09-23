import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SITE_BUCKET, signPaths } from "@/lib/storage";

export type Edition = {
  id: string;
  titulo: string;
  data: string;
  local: string;
  participantes: number;
  descricao: string;
  inscricao_url: string | null;
  imagem_url: string | null;
  imagens: string[];
  video_url: string | null;
  created_at: string;
  updated_at: string;
};

/** Edição com as imagens já resolvidas em URLs exibíveis. */
export type EditionView = Edition & { coverUrl: string | null; imagensUrls: string[] };

async function resolveMedia(rows: Edition[]): Promise<EditionView[]> {
  const paths = new Set<string>();
  for (const row of rows) {
    if (row.imagem_url) paths.add(row.imagem_url);
    for (const p of row.imagens ?? []) paths.add(p);
  }
  const signed = await signPaths(SITE_BUCKET, [...paths]);
  return rows.map((row) => {
    const imagensUrls = (row.imagens ?? []).map((p) => signed[p]).filter(Boolean);
    const cover = row.imagem_url ? signed[row.imagem_url] ?? null : null;
    return { ...row, imagens: row.imagens ?? [], coverUrl: cover ?? imagensUrls[0] ?? null, imagensUrls };
  });
}

export async function fetchEditions(): Promise<EditionView[]> {
  const { data, error } = await supabase.from("editions").select("*").order("data", { ascending: false });
  if (error) throw error;
  return resolveMedia((data ?? []) as unknown as Edition[]);
}

export async function fetchEditionById(id: string): Promise<EditionView | null> {
  const { data, error } = await supabase.from("editions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [view] = await resolveMedia([data as unknown as Edition]);
  return view ?? null;
}

export const editionsQuery = () =>
  queryOptions({ queryKey: ["editions"], queryFn: fetchEditions, staleTime: 15_000 });

export const editionByIdQuery = (id: string) =>
  queryOptions({ queryKey: ["editions", id], queryFn: () => fetchEditionById(id), staleTime: 15_000 });
