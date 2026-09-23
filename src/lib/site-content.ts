import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SITE_BUCKET, signPath, signPaths } from "@/lib/storage";

/* ---------- Imagens do projeto ---------- */

export type ImageSlot = { key: string; rotulo: string };

export const IMAGE_SLOTS: ImageSlot[] = [
  { key: "home-hero", rotulo: "Home — banner principal" },
  { key: "home-patrocinio", rotulo: "Home — chamada de patrocínio" },
  { key: "festival-hero", rotulo: "O Festival — banner principal" },
  { key: "festival-quem-faz", rotulo: "O Festival — bloco “Gente da nossa terra”" },
  { key: "patrocinio-hero", rotulo: "Patrocínio — banner principal" },
  { key: "patrocinio-cta", rotulo: "Patrocínio — chamada final" },
  { key: "proxima-hero", rotulo: "Próxima Edição — capa padrão" },
  { key: "programacao-hero", rotulo: "Programação — banner" },
  { key: "inscricao-hero", rotulo: "Inscrição — banner do formulário" },
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

/* ---------- Próxima edição ---------- */

export type NextEditionRow = {
  id: string;
  cidade: string | null;
  data_evento: string | null;
  data_fim: string | null;
  locais: string[];
  capas: string[];
  inscricoes_abertura: string | null;
  inscricoes_encerramento: string | null;
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

const NEXT_FIELDS =
  "id, cidade, data_evento, data_fim, locais, capas, inscricoes_abertura, inscricoes_encerramento, regulamento_url, programacao_data, possui_oficinas, logos_url";

async function hydrateNextEdition(row: NextEditionRow): Promise<NextEdition> {
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

export async function fetchNextEditions(): Promise<NextEdition[]> {
  const { data, error } = await supabase
    .from("next_edition")
    .select(NEXT_FIELDS)
    .order("data_evento", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return Promise.all(((data ?? []) as unknown as NextEditionRow[]).map(hydrateNextEdition));
}

export async function fetchNextEdition(id?: string): Promise<NextEdition | null> {
  if (!id) return (await fetchNextEditions())[0] ?? null;
  const { data, error } = await supabase.from("next_edition").select(NEXT_FIELDS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? hydrateNextEdition(data as unknown as NextEditionRow) : null;
}

export const nextEditionsQuery = () => queryOptions({ queryKey: ["next-editions"], queryFn: fetchNextEditions, staleTime: 15_000 });
export const nextEditionQuery = (id?: string) => queryOptions({ queryKey: ["next-edition", id ?? "first"], queryFn: () => fetchNextEdition(id), staleTime: 15_000 });

/** A próxima edição só é considerada anunciada quando tem cidade ou período. */
export function hasAnnouncement(next: NextEdition | null | undefined) {
  return Boolean(next && (next.cidade || next.data_evento || next.locais.length > 0));
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDate(value: string | null | undefined) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

/** true quando a data já chegou (comparação por dia, fuso local). */
export function dateReached(value: string | null | undefined) {
  const d = toDate(value);
  return d ? d <= startOfToday() : false;
}

/** true quando a data já passou completamente. */
export function datePassed(value: string | null | undefined) {
  const d = toDate(value);
  return d ? d < startOfToday() : false;
}

export type RegistrationStatus = "sem-edicao" | "sem-datas" | "antes" | "abertas" | "encerradas";

export function registrationStatus(next: NextEdition | null | undefined): RegistrationStatus {
  if (!hasAnnouncement(next)) return "sem-edicao";
  if (!next?.inscricoes_abertura && !next?.inscricoes_encerramento) return "sem-datas";
  if (next?.inscricoes_encerramento && datePassed(next.inscricoes_encerramento)) return "encerradas";
  if (next?.inscricoes_abertura && !dateReached(next.inscricoes_abertura)) return "antes";
  return "abertas";
}

export function formatDate(value: string | null | undefined) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

/** "10 a 15 de outubro de 2026", "28 de setembro a 3 de outubro de 2026" ou só a data única. */
export function formatPeriod(start: string | null | undefined, end: string | null | undefined) {
  if (!start && !end) return null;
  if (!start) return formatDate(end);
  if (!end || end === start) return formatDate(start);
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  const month = (d: Date) => d.toLocaleDateString("pt-BR", { month: "long" });
  if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) {
    return `${a.getDate()} a ${b.getDate()} de ${month(b)} de ${b.getFullYear()}`;
  }
  if (a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()} de ${month(a)} a ${b.getDate()} de ${month(b)} de ${b.getFullYear()}`;
  }
  return `${formatDate(start)} a ${formatDate(end)}`;
}

/* ---------- Programação ---------- */

export type Attraction = {
  id: string;
  nome: string;
  descricao: string;
  data: string | null;
  local: string | null;
  horario: string | null;
  imagem_url: string | null;
  publicado: boolean;
  next_edition_id: string;
};

export type AttractionView = Attraction & { imagemUrl: string | null };

async function withImages(rows: Attraction[]): Promise<AttractionView[]> {
  const signed = await signPaths(SITE_BUCKET, rows.map((r) => r.imagem_url).filter(Boolean) as string[]);
  return rows.map((r) => ({ ...r, imagemUrl: r.imagem_url ? signed[r.imagem_url] ?? null : null }));
}

export async function fetchPublishedAttractions(editionId: string): Promise<AttractionView[]> {
  const { data, error } = await supabase
    .from("program_attractions")
    .select("*")
    .eq("next_edition_id", editionId)
    .eq("publicado", true)
    .order("data", { ascending: true })
    .order("horario", { ascending: true });
  if (error) throw error;
  return withImages((data ?? []) as unknown as Attraction[]);
}

export async function fetchAllAttractions(editionId: string): Promise<AttractionView[]> {
  const { data, error } = await supabase
    .from("program_attractions")
    .select("*")
    .eq("next_edition_id", editionId)
    .order("data", { ascending: true })
    .order("horario", { ascending: true });
  if (error) throw error;
  return withImages((data ?? []) as unknown as Attraction[]);
}

export const attractionsQuery = (editionId: string) => queryOptions({ queryKey: ["attractions", editionId], queryFn: () => fetchPublishedAttractions(editionId), enabled: Boolean(editionId), staleTime: 15_000 });

/* ---------- Cidades do formulário ---------- */

export type RegistrationCity = { id: string; nome: string; ordem: number; next_edition_id: string };

export async function fetchCities(editionId: string): Promise<RegistrationCity[]> {
  const { data, error } = await supabase.from("registration_cities").select("*").eq("next_edition_id", editionId).order("ordem", { ascending: true });
  if (error) throw error;
  return (data ?? []) as RegistrationCity[];
}

export const citiesQuery = (editionId: string) => queryOptions({ queryKey: ["registration-cities", editionId], queryFn: () => fetchCities(editionId), enabled: Boolean(editionId), staleTime: 30_000 });

/* ---------- Categorias e formas de recebimento do cachê ---------- */

export type RegistrationCategory = { id: string; nome: string; valor: number | null; ordem: number; next_edition_id: string };

export async function fetchCategories(editionId: string): Promise<RegistrationCategory[]> {
  const { data, error } = await supabase.from("registration_categories").select("id, nome, valor, ordem, next_edition_id").eq("next_edition_id", editionId).order("ordem", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as Array<{ id: string; nome: string; valor: number | string | null; ordem: number; next_edition_id: string }>).map((c) => ({
    ...c,
    valor: c.valor === null ? null : Number(c.valor),
  }));
}

export const categoriesQuery = (editionId: string) => queryOptions({ queryKey: ["registration-categories", editionId], queryFn: () => fetchCategories(editionId), enabled: Boolean(editionId), staleTime: 30_000 });

export type PaymentMethod = { id: string; nome: string; ativo: boolean; ordem: number; next_edition_id: string };

export async function fetchPaymentMethods(editionId: string, activeOnly = false): Promise<PaymentMethod[]> {
  let q = supabase.from("payment_methods").select("id, nome, ativo, ordem, next_edition_id").eq("next_edition_id", editionId).order("ordem", { ascending: true });
  if (activeOnly) q = q.eq("ativo", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as PaymentMethod[];
}

export const paymentMethodsQuery = (editionId: string, activeOnly = false) =>
  queryOptions({ queryKey: ["payment-methods", editionId, activeOnly], queryFn: () => fetchPaymentMethods(editionId, activeOnly), enabled: Boolean(editionId), staleTime: 30_000 });

export function formatMoney(value: number | null) {
  if (value === null || Number.isNaN(value)) return null;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const WHATSAPP_GROUP = "https://chat.whatsapp.com/BgMF0qUvr37HW5Gd8sLK9x";
