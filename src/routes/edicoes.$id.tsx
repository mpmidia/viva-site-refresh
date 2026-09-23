import { createFileRoute, Link, useRouter, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, MapPin, Play, Users } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { VideoEmbed } from "@/components/media-embed";
import { EditionGalleryCarousel } from "@/components/edition-gallery-carousel";
import { editionByIdQuery } from "@/lib/editions";
import { getEditionMedia } from "@/lib/edition-media";
import { toEmbedUrl } from "@/lib/validators";

export const Route = createFileRoute("/edicoes/$id")({
  loader: async ({ context, params }) => {
    const edition = await context.queryClient.ensureQueryData(editionByIdQuery(params.id));
    if (!edition) throw notFound();
    return { edition };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Edição não encontrada — Aviva Cultura" }, { name: "robots", content: "noindex" }] };
    }
    const { edition } = loaderData;
    const desc = edition.descricao.slice(0, 155);
    return { meta: [
      { title: `${edition.titulo} — Aviva Cultura` },
      { name: "description", content: desc },
      { property: "og:title", content: `${edition.titulo} — Aviva Cultura` },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: EditionDetailPage,
  errorComponent: EditionError,
  notFoundComponent: EditionNotFound,
});

function EditionDetailPage() {
  const { edition } = Route.useLoaderData();
  const { data } = useSuspenseQuery(editionByIdQuery(edition.id));
  const e = data ?? edition;

  const legacy = getEditionMedia(e.titulo);
  // Imagens enviadas pela equipe têm prioridade sobre o acervo histórico importado.
  const gallery = e.imagensUrls.length > 0 ? e.imagensUrls : legacy?.images ?? [];
  const cover = e.coverUrl ?? gallery[0] ?? legacy?.cover ?? null;
  const rest = gallery.filter((src) => src !== cover);

  // O vídeo só aparece quando foi explicitamente cadastrado pela equipe.
  const videoSrc = e.video_url?.trim() || null;
  const hasVideo = Boolean(toEmbedUrl(videoSrc));

  const dateStr = new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <SiteShell>
      {/* Capa */}
      <section className="relative overflow-hidden bg-brand-purple text-primary-foreground">
        {cover && <img src={cover} alt={`Registro da edição ${e.titulo}`} className="absolute inset-0 size-full object-cover" />}
        <div className={`absolute inset-0 ${cover ? "bg-brand-purple/70" : ""}`} />
        {cover && <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-brand-purple to-transparent" />}
        <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-5 py-14 md:min-h-[58svh] md:px-8 md:py-20">
          <Link to="/edicoes-anteriores" className="inline-flex w-fit items-center gap-2 text-sm font-bold uppercase text-primary-foreground/80 hover:text-brand-yellow">
            <ArrowLeft className="size-4" /> Todas as edições
          </Link>
          <h1 className="mt-8 max-w-4xl font-display text-3xl uppercase leading-tight sm:text-4xl md:text-6xl lg:text-7xl">{e.titulo}</h1>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-primary-foreground/90">
            <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-brand-yellow" />{dateStr}</span>
            <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-brand-yellow" />{e.local}</span>
            {e.participantes > 0 && <span className="inline-flex items-center gap-2"><Users className="size-4 text-brand-yellow" />{e.participantes} participantes</span>}
          </div>
        </div>
      </section>

      {/* Texto aberto */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-28">
        <article className="mx-auto max-w-5xl">
          <div className="grid gap-5 border-b border-border pb-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end md:pb-10">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase text-brand-teal">Sobre esta edição</p>
              <h2 className="mt-3 max-w-3xl font-display text-3xl uppercase leading-tight sm:text-4xl md:text-6xl">Arte que ocupa a cidade</h2>
            </div>
            {e.inscricao_url && (
              <a href={e.inscricao_url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center bg-brand-pink px-6 py-4 text-sm font-bold uppercase text-primary-foreground transition hover:opacity-90">
                Faça sua inscrição
              </a>
            )}
          </div>
          <p className="mt-8 whitespace-pre-line text-xl leading-relaxed text-foreground/80 md:mt-12 md:text-2xl md:leading-relaxed">{e.descricao}</p>
        </article>
      </section>

      {rest.length > 0 && (
        <section className="overflow-hidden bg-brand-cream py-16 md:py-24">
          <div className="mx-auto max-w-[100rem] px-5 md:px-8">
            <div className="mx-auto max-w-7xl">
              <p className="text-sm font-bold uppercase text-brand-pink">Registros da edição</p>
              <h2 className="mt-3 max-w-4xl font-display text-3xl uppercase leading-tight sm:text-4xl md:text-6xl">Momentos do festival</h2>
            </div>
            <EditionGalleryCarousel images={rest} title={e.titulo} />
          </div>
        </section>
      )}

      {hasVideo && (
        <section className="bg-brand-purple py-16 text-primary-foreground md:py-24">
          <div className="mx-auto max-w-5xl px-5 md:px-8">
            <div className="mb-8 flex items-center gap-3"><Play className="size-6 text-brand-yellow" /><h2 className="font-display text-2xl uppercase sm:text-3xl md:text-5xl">Assista à edição</h2></div>
            <VideoEmbed url={videoSrc} title={`Vídeo da edição ${e.titulo}`} />
          </div>
        </section>
      )}
    </SiteShell>
  );
}

function EditionNotFound() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-purple">Ops</p>
        <h1 className="mt-3 font-display text-4xl">Edição não encontrada</h1>
        <p className="mt-4 text-muted-foreground">A edição que você procura não existe ou foi removida.</p>
        <Link to="/edicoes-anteriores" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-pink px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Ver todas as edições
        </Link>
      </section>
    </SiteShell>
  );
}

function EditionError({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Não foi possível carregar esta edição</h1>
        <button
          onClick={() => { reset(); router.invalidate(); }}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-pink px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Tentar novamente
        </button>
      </section>
    </SiteShell>
  );
}
