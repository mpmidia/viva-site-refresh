import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SITE_BUCKET, signPath, signPaths } from "@/lib/storage";
import { festivalMedia } from "@/lib/festival-media";

/* ---------- Imagens do projeto ---------- */

export type ImageSlot = { key: string; rotulo: string; fallback: string };

export const IMAGE_SLOTS: ImageSlot[] = [
  { key: "home-hero", rotulo: "Home — banner principal", fallback: festivalMedia.heroCrowd },
  { key: "home-patrocinio", rotulo: "Home — chamada de patrocínio", fallback: festivalMedia.artistTalk },
  { key: "festival-hero", rotulo: "O Festival — banner principal", fallback: festivalMedia.brassCity },
  { key: "festival-quem-faz", rotulo: "O Festival — bloco “Gente da nossa terra”", fallback: festivalMedia.audienceTheater },
  { key: "patrocinio-hero", rotulo: "Patrocínio — banner principal", fallback: festivalMedia.heroCrowd },
  { key: "patrocinio-cta", rotulo: "Patrocínio — chamada final", fallback: festivalMedia.audienceTheater },
  { key: "proxima-hero", rotulo: "Próxima Edição — capa padrão", fallback: festivalMedia.liveShow },
  { key: "programacao-hero", rotulo: "Programação — banner", fallback: festivalMedia.cityPerformance },
  { key: "inscricao-hero", rotulo: "Inscrição — banner do formulário", fallback: festivalMedia.performerStage },
];

export type SiteImage = { id: string; chave: string; rotulo: string; url: string };

export async function fetchSiteImages(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("site_images").select("id, chave, rotulo, url");
  if (error) throw error;
  const rows = (data ?? []) as SiteImage[];
  const signed = await signPaths(SITE_BUCKET, rows.map((r) => r.url));
  const map: Record<string, string> = {};
  for (const row of rows) {
    const url = signed[row.url];
    if (url) map[row.chave] = url;
  }
  return map;
}

export const siteImagesQuery = () => queryOptions({ queryKey: ["site-images"], queryFn: fetchSiteImages, staleTime: 60_000 });

export function slotFallback(key: string) {
  return IMAGE_SLOTS.find((s) => s.key === key)?.fallback ?? festivalMedia.heroCrowd;
}

/* ---------- Próxima edição ---------- */

export type NextEditionRow = {
  id: string;
  cidade: string | null;
  data_evento: string | null;
  locais: string[];
  video_url: string | null;
  capas: string[];
  inscricoes_abertura: string | null;
  regulamento_url: string | null;
  programacao_data: string | null;
  possui_oficinas: boolean;
  logos_url: string | null;
};

export type NextEdition = NextEditionRow & {
  capasUrls: string[];
  logosUrl: string | null;
  regulamentoUrl: string | null;
};

export async function fetchNextEdition(): Promise<NextEdition | null> {
  const { data, error } = await supabase
    .from("next_edition")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as NextEditionRow;
  const signed = await signPaths(SITE_BUCKET, row.capas ?? []);
  return {
    ...row,
    locais: row.locais ?? [],
    capas: row.capas ?? [],
    capasUrls: (row.capas ?? []).map((p) => signed[p]).filter(Boolean),
    logosUrl: await signPath(SITE_BUCKET, row.logos_url),
    regulamentoUrl: await signPath(SITE_BUCKET, row.regulamento_url),
  };
}

export const nextEditionQuery = () => queryOptions({ queryKey: ["next-edition"], queryFn: fetchNextEdition, staleTime: 30_000 });

/** true quando a data já chegou (comparação por dia, fuso local). */
export function dateReached(value: string | null | undefined) {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${value}T00:00:00`) <= today;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

/* ---------- Programação ---------- */

export type Attraction = {
  id: string;
  nome: string;
  descricao: string;
  data: string | null;
  local: string | null;
  horario: string | null;
  publicado: boolean;
};

export async function fetchPublishedAttractions(): Promise<Attraction[]> {
  const { data, error } = await supabase
    .from("program_attractions")
    .select("*")
    .eq("publicado", true)
    .order("data", { ascending: true })
    .order("horario", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Attraction[];
}

export async function fetchAllAttractions(): Promise<Attraction[]> {
  const { data, error } = await supabase
    .from("program_attractions")
    .select("*")
    .order("data", { ascending: true })
    .order("horario", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Attraction[];
}

export const attractionsQuery = () => queryOptions({ queryKey: ["attractions"], queryFn: fetchPublishedAttractions, staleTime: 30_000 });

/* ---------- Cidades do formulário ---------- */

export type RegistrationCity = { id: string; nome: string; ordem: number };

export async function fetchCities(): Promise<RegistrationCity[]> {
  const { data, error } = await supabase.from("registration_cities").select("*").order("ordem", { ascending: true });
  if (error) throw error;
  return (data ?? []) as RegistrationCity[];
}

export const citiesQuery = () => queryOptions({ queryKey: ["registration-cities"], queryFn: fetchCities, staleTime: 60_000 });

/* ---------- Categorias da inscrição ---------- */

export const CATEGORIES = [
  { id: "A", label: "A. Grupos teatrais, shows musicais e espetáculos de dança — R$ 2.500,00" },
  { id: "B", label: "B. Performances, duetos, apresentações solo e propostas experimentais — R$ 1.500,00" },
  { id: "C", label: "C. Artesanato, moda, pintura e linguagens similares — R$ 1.000,00" },
] as const;

export const WHATSAPP_GROUP = "https://chat.whatsapp.com/BgMF0qUvr37HW5Gd8sLK9x";
