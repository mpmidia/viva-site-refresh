import { useQuery } from "@tanstack/react-query";
import { siteImagesQuery, slotFallback } from "@/lib/site-content";

/** Devolve uma função que resolve a imagem cadastrada pela equipe, com fallback do layout. */
export function useSiteImage() {
  const { data } = useQuery(siteImagesQuery());
  return (key: string) => data?.[key] ?? slotFallback(key);
}
