import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, FileText, MapPin, Megaphone, TicketCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { CoverSlideshow } from "@/components/cover-slideshow";
import { LogosBar } from "@/components/logos-bar";
import { useSiteImage } from "@/hooks/useSiteImage";
import { dateReached, formatDate, nextEditionQuery } from "@/lib/site-content";
import { toEmbedUrl } from "@/lib/validators";

export const Route = createFileRoute("/proxima-edicao")({
  head: () => ({ meta: [
    { title: "Próxima Edição — Festival Aviva Cultura" },
    { name: "description", content: "Anúncio, inscrições e programação da próxima edição do Festival Aviva Cultura." },
    { property: "og:title", content: "Próxima Edição — Festival Aviva Cultura" },
    { property: "og:description", content: "A próxima experiência Aviva Cultura será anunciada aqui." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: NextPage,
});

function NextPage() {
  const image = useSiteImage();
  const { data: next } = useQuery(nextEditionQuery());
  const covers = next?.capasUrls ?? [];
  const video = toEmbedUrl(next?.video_url);
  const inscricoesAbertas = dateReached(next?.inscricoes_abertura);
  const programacaoLiberada = dateReached(next?.programacao_data);

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-brand-purple text-primary-foreground md:min-h-[72svh]">
        <div className="relative aspect-[4/3] md:absolute md:inset-0 md:aspect-auto">
          {covers.length > 0 ? (
            <CoverSlideshow images={covers} alt="Imagem da próxima edição do Festival Aviva Cultura" className="absolute inset-0 size-full" />
          ) : (
            <img src={image("proxima-hero")} alt="Apresentação do Festival Aviva Cultura" className="size-full object-cover" />
          )}
        </div>
        <div className="hidden md:absolute md:inset-0 md:block md:bg-gradient-to-r md:from-brand-purple md:via-brand-purple/75 md:to-brand-purple/10" />
        <div className="relative mx-auto flex max-w-7xl items-center px-5 py-12 md:min-h-[72svh] md:px-8 md:py-20">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase text-brand-yellow">Próxima edição</p>
            <h1 className="mt-4 font-display text-3xl uppercase leading-tight sm:text-4xl md:text-6xl lg:text-7xl">
              {next?.cidade ? `Aviva Cultura em ${next.cidade}` : "Uma nova experiência está sendo preparada."}
            </h1>
            {next?.data_evento && <p className="mt-5 text-xl text-primary-foreground/85">{formatDate(next.data_evento)}</p>}
          </div>
        </div>
      </section>

      {video && (
        <section className="bg-background py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-5 md:px-8">
            <h2 className="font-display text-3xl uppercase md:text-5xl">Vídeo da edição</h2>
            <div className="mt-6 aspect-video w-full overflow-hidden bg-brand-purple">
              {video.type === "iframe" ? (
                <iframe src={video.src} title="Vídeo da próxima edição" className="size-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <video controls preload="metadata" className="size-full object-cover"><source src={video.src} /></video>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="text-sm font-bold uppercase text-brand-pink">As três fases</p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl uppercase sm:text-4xl md:text-6xl">Acompanhe a próxima edição.</h2>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {/* Fase 1 */}
            <article className="border border-border p-7">
              <Megaphone className="size-9 text-brand-pink" />
              <p className="mt-8 text-xs font-bold uppercase text-brand-teal">Fase 01</p>
              <h3 className="mt-2 font-display text-2xl uppercase">O Anúncio</h3>
              {next?.cidade || next?.data_evento || (next?.locais.length ?? 0) > 0 ? (
                <div className="mt-5 space-y-3 text-lg text-foreground/80">
                  {next?.cidade && <p className="flex items-center gap-2"><MapPin className="size-5 text-brand-pink" /> {next.cidade}</p>}
                  {next?.data_evento && <p className="flex items-center gap-2"><CalendarClock className="size-5 text-brand-pink" /> {formatDate(next.data_evento)}</p>}
                  {(next?.locais ?? []).length > 0 && (
                    <ul className="space-y-1 border-t border-border pt-3">
                      {next!.locais.map((local) => <li key={local} className="text-base">• {local}</li>)}
                    </ul>
                  )}
                </div>
              ) : (
                <span className="mt-6 inline-block bg-muted px-3 py-2 text-xs font-bold uppercase text-muted-foreground">Em breve</span>
              )}
            </article>

            {/* Fase 2 */}
            <article className="border border-border p-7">
              <TicketCheck className="size-9 text-brand-pink" />
              <p className="mt-8 text-xs font-bold uppercase text-brand-teal">Fase 02</p>
              <h3 className="mt-2 font-display text-2xl uppercase">Inscrições</h3>
              {next?.inscricoes_abertura && (
                <p className="mt-4 text-base text-muted-foreground">
                  {inscricoesAbertas ? "Inscrições abertas." : `As inscrições abrem em ${formatDate(next.inscricoes_abertura)}.`}
                </p>
              )}
              <div className="mt-6 space-y-3">
                {inscricoesAbertas ? (
                  <Link to="/inscricao" className="inline-flex items-center gap-2 bg-brand-pink px-5 py-3 text-sm font-bold uppercase text-primary-foreground">Inscreva-se</Link>
                ) : (
                  <span aria-disabled="true" className="inline-flex cursor-not-allowed items-center gap-2 bg-muted px-5 py-3 text-sm font-bold uppercase text-muted-foreground">Inscrições ainda não abertas</span>
                )}
                {next?.regulamentoUrl && (
                  <a href={next.regulamentoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold uppercase text-brand-purple underline"><FileText className="size-4" /> Ver regulamento</a>
                )}
              </div>
            </article>

            {/* Fase 3 */}
            <article className="border border-border p-7">
              <CalendarClock className="size-9 text-brand-pink" />
              <p className="mt-8 text-xs font-bold uppercase text-brand-teal">Fase 03</p>
              <h3 className="mt-2 font-display text-2xl uppercase">Programação</h3>
              {programacaoLiberada ? (
                <Link to="/programacao" className="mt-6 inline-flex items-center gap-2 bg-brand-yellow px-5 py-3 text-sm font-bold uppercase text-foreground">Ver programação</Link>
              ) : (
                <>
                  {next?.programacao_data && <p className="mt-4 text-base text-muted-foreground">Divulgação em {formatDate(next.programacao_data)}.</p>}
                  <span className="mt-6 inline-block bg-muted px-3 py-2 text-xs font-bold uppercase text-muted-foreground">Em breve</span>
                </>
              )}
            </article>
          </div>
        </div>
      </section>

      <LogosBar url={next?.logosUrl} />
    </SiteShell>
  );
}
