import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, FileText, MapPin, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { CoverSlideshow } from "@/components/cover-slideshow";
import { LogosBar } from "@/components/logos-bar";
import { useSiteImage } from "@/hooks/useSiteImage";
import {
  categoriesQuery,
  formatDate,
  formatMoney,
  formatPeriod,
  hasAnnouncement,
  nextEditionQuery,
  paymentMethodsQuery,
  registrationStatus,
} from "@/lib/site-content";

export const Route = createFileRoute("/proxima-edicao")({
  head: () => ({ meta: [
    { title: "Próxima Edição — Festival Aviva Cultura" },
    { name: "description", content: "Cidade, locais, período e inscrições da próxima edição do Festival Aviva Cultura." },
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
  const { data: categories = [] } = useQuery(categoriesQuery());
  const { data: payments = [] } = useQuery(paymentMethodsQuery(true));

  const covers = next?.capasUrls ?? [];
  const heroFallback = image("proxima-hero");
  const announced = hasAnnouncement(next);
  const status = registrationStatus(next);
  const periodo = formatPeriod(next?.data_evento, next?.data_fim);
  const periodoInscricoes = formatPeriod(next?.inscricoes_abertura, next?.inscricoes_encerramento);

  return (
    <SiteShell>
      {/* Capa */}
      <section className="relative overflow-hidden bg-brand-purple text-primary-foreground">
        {hasCover && (
          <div className="relative aspect-[4/3] md:absolute md:inset-0 md:aspect-auto">
            {covers.length > 0 ? (
              <CoverSlideshow images={covers} alt="Imagem da próxima edição do Festival Aviva Cultura" className="absolute inset-0 size-full" />
            ) : (
              <img src={heroFallback!} alt="Apresentação do Festival Aviva Cultura" className="size-full object-cover" />
            )}
          </div>
        )}
        {hasCover && <div className="hidden md:absolute md:inset-0 md:block md:bg-gradient-to-r md:from-brand-purple md:via-brand-purple/80 md:to-brand-purple/10" />}
        <div className={`relative mx-auto flex max-w-7xl items-end px-5 py-14 md:px-8 md:py-24 ${hasCover ? "md:min-h-[78svh]" : ""}`}>
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-yellow">Próxima edição</p>
            {announced ? (
              <>
                <h1 className="mt-4 font-display text-4xl uppercase leading-none sm:text-5xl md:text-7xl lg:text-8xl">
                  {next?.cidade ?? "Festival Aviva Cultura"}
                </h1>
                {(next?.locais.length ?? 0) > 0 && (
                  <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-lg text-primary-foreground/90 md:text-xl">
                    <MapPin className="size-5 text-brand-yellow" />
                    {next!.locais.join(" · ")}
                  </p>
                )}
                {periodo && (
                  <p className="mt-3 inline-flex items-center gap-3 bg-brand-yellow px-5 py-3 font-display text-lg uppercase text-foreground md:text-2xl">
                    <CalendarClock className="size-5" /> {periodo}
                  </p>
                )}
              </>
            ) : (
              <h1 className="mt-4 font-display text-5xl uppercase leading-none md:text-8xl">Em breve</h1>
            )}
          </div>
        </div>
      </section>

      {!announced ? (
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
            <Sparkles className="mx-auto size-10 text-brand-pink" />
            <p className="mt-6 text-lg text-muted-foreground">
              A próxima edição do Festival Aviva Cultura está sendo preparada. Em breve anunciamos aqui a cidade, os locais e o período.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Inscrições */}
          <section className="bg-brand-cream py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-5 md:px-8">
              <p className="text-sm font-bold uppercase text-brand-pink">Inscrições</p>

              {status === "encerradas" ? (
                <h2 className="mt-3 font-display text-3xl uppercase sm:text-4xl md:text-6xl">Inscrições encerradas</h2>
              ) : (
                <h2 className="mt-3 font-display text-3xl uppercase sm:text-4xl md:text-6xl">
                  {status === "abertas" ? "Inscrições abertas" : "Participe da próxima edição"}
                </h2>
              )}

              {periodoInscricoes && (
                <p className="mt-5 text-lg text-foreground/80">
                  <span className="font-bold uppercase text-brand-teal">Período de inscrições:</span> {periodoInscricoes}
                </p>
              )}

              {categories.length > 0 && (
                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((c) => (
                    <div key={c.id} className="border border-border bg-background p-5">
                      <p className="font-display text-lg uppercase leading-tight">{c.nome}</p>
                      {formatMoney(c.valor) && <p className="mt-3 font-display text-2xl text-brand-pink">{formatMoney(c.valor)}</p>}
                    </div>
                  ))}
                </div>
              )}

              {status === "abertas" && payments.length > 0 && (
                <p className="mt-6 text-base text-foreground/80">
                  <span className="font-bold uppercase text-brand-teal">Formas de pagamento:</span> {payments.map((p) => p.nome).join(" · ")}
                </p>
              )}

              <div className="mt-9 flex flex-wrap items-center gap-4">
                {status === "abertas" && (
                  <Link to="/inscricao" className="inline-flex items-center gap-2 bg-brand-pink px-6 py-4 text-sm font-bold uppercase text-primary-foreground">
                    Inscreva-se
                  </Link>
                )}
                {next?.regulamentoUrl && (
                  <a href={next.regulamentoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b-2 border-brand-purple pb-1 text-sm font-bold uppercase text-brand-purple">
                    <FileText className="size-4" /> Ver regulamento
                  </a>
                )}
              </div>

              {next?.possui_oficinas && (
                <p className="mt-8 border-l-4 border-brand-teal pl-5 text-lg text-foreground/80">
                  Esta edição também recebe propostas de <strong>oficinas</strong>.
                </p>
              )}
            </div>
          </section>

          {/* Programação */}
          <section className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-5 md:px-8">
              <p className="text-sm font-bold uppercase text-brand-pink">Programação</p>
              {next?.programacao_data && new Date(`${next.programacao_data}T00:00:00`) <= new Date(new Date().setHours(0, 0, 0, 0)) ? (
                <>
                  <h2 className="mt-3 font-display text-3xl uppercase sm:text-4xl md:text-6xl">A programação está no ar</h2>
                  <Link to="/programacao" className="mt-8 inline-flex items-center gap-2 bg-brand-yellow px-6 py-4 text-sm font-bold uppercase text-foreground">
                    Ver programação completa
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="mt-3 font-display text-3xl uppercase sm:text-4xl md:text-6xl">Aguarde.</h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    {next?.programacao_data
                      ? `A programação completa será divulgada em ${formatDate(next.programacao_data)}.`
                      : "A programação completa será divulgada em breve."}
                  </p>
                </>
              )}
            </div>
          </section>
        </>
      )}

      <LogosBar url={next?.logosUrl} />
    </SiteShell>
  );
}
