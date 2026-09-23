import { useQuery } from "@tanstack/react-query";
import { siteImagesQuery } from "@/lib/site-content";

/**
 * Devolve a imagem cadastrada pela equipe para cada espaço do site.
 * Se não houver imagem cadastrada, devolve null — a área simplesmente não exibe imagem.
 */
export function useSiteImage() {
  const { data } = useQuery(siteImagesQuery());
  return (key: string): string | null => data?.[key] ?? null;
}
