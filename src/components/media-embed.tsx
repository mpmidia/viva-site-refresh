import { toEmbedUrl } from "@/lib/validators";

/** Player de vídeo. Não renderiza nada quando não existe vídeo cadastrado. */
export function VideoEmbed({ url, title }: { url: string | null | undefined; title: string }) {
  const video = toEmbedUrl(url);
  if (!video) return null;
  return (
    <div className="aspect-video w-full overflow-hidden bg-foreground">
      {video.type === "iframe" ? (
        <iframe
          src={video.src}
          title={title}
          className="size-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <video controls preload="metadata" className="size-full object-cover" title={title}>
          <source src={video.src} />
        </video>
      )}
    </div>
  );
}
