import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Users, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { editionsQuery, type Edition } from "@/lib/editions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Festival Aviva Cultura — Home" },
      { name: "description", content: "Mais do que arte. Uma experiência cultural transformadora. Conheça a próxima edição do Festival Aviva Cultura." },
      { property: "og:title", content: "Festival Aviva Cultura — Home" },
      { property: "og:description", content: "Mais do que arte. Uma experiência cultural transformadora. Conheça a próxima edição do Festival Aviva Cultura." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(editionsQuery());
  },
  component: HomePage,
});

function HomePage() {
  const { data: editions } = useSuspenseQuery(editionsQuery());
  const current = editions[0];

  return (
    <SiteShell>
      <Hero current={current} />
      <Stats />
      <FestivalIntro />
      {editions.length > 1 && <PreviousEditionsTeaser editions={editions.slice(1, 4)} />}
    </SiteShell>
  );
}

function Hero({ current }: { current?: Edition }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-yellow/40 via-background to-background">
      <div className="absolute -left-24 -top-24 size-96 rounded-full bg-brand-pink/20 blur-3xl" aria-hidden />
      <div className="absolute -right-32 top-40 size-96 rounded-full bg-brand-purple/20 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24 md:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-pink/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-pink">
            Festival Aviva Cultura
          </span>
          <h1 className="mt-4 font-display text-5xl leading-tight text-foreground md:text-6xl">
            Mais do que <span className="text-brand-pink">arte.</span>
            <br />
            <span className="text-brand-purple">Uma experiência cultural</span>{" "}
            <span className="italic text-brand-orange">transformadora.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Uma mostra que dá espaço aos artistas locais, incentivando e valorizando a criatividade através de ações culturais em espaços públicos.
          </p>

          {current ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/proxima-edicao"
                className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand-pink/30 hover:opacity-90"
              >
                Confira a próxima edição <ArrowRight className="size-4" />
              </Link>
              {current.inscricao_url && (
                <a
                  href={current.inscricao_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-6 py-3 text-sm font-semibold text-foreground hover:opacity-90"
                >
                  Faça sua inscrição
                </a>
              )}
            </div>
          ) : (
            <div className="mt-8">
              <Link
                to="/o-festival"
                className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Conheça o festival <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>

        {current && <CurrentEditionCard edition={current} />}
      </div>
    </section>
  );
}

function CurrentEditionCard({ edition }: { edition: Edition }) {
  const date = new Date(edition.data + "T00:00:00");
  return (
    <div className="relative rounded-3xl border border-border/60 bg-card p-6 shadow-xl shadow-brand-purple/10">
      {edition.imagem_url && (
        <img
          src={edition.imagem_url}
          alt={edition.titulo}
          className="mb-5 aspect-video w-full rounded-2xl object-cover"
        />
      )}
      <span className="inline-block rounded-full bg-brand-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-purple">
        Próxima edição
      </span>
      <h2 className="mt-3 font-display text-3xl text-foreground">{edition.titulo}</h2>
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2"><CalendarDays className="size-4 text-brand-pink" />{date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</div>
        <div className="flex items-center gap-2"><MapPin className="size-4 text-brand-pink" />{edition.local}</div>
        <div className="flex items-center gap-2"><Users className="size-4 text-brand-pink" />{edition.participantes} participantes</div>
      </div>
      <p className="mt-4 line-clamp-4 text-sm text-foreground/80">{edition.descricao}</p>
      {edition.inscricao_url && (
        <a
          href={edition.inscricao_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brand-pink px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Faça sua inscrição
        </a>
      )}
    </div>
  );
}

function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-center text-sm font-semibold uppercase tracking-widest text-brand-purple">
        Desde a sua primeira edição, em 2019, o
      </p>
      <h2 className="mt-3 text-center font-display text-4xl text-brand-pink md:text-5xl">
        FESTIVAL AVIVA CULTURA
      </h2>
      <p className="mt-3 text-center text-lg text-muted-foreground">já impactou muita gente!</p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { n: "+174", label: "Artistas Incentivados", color: "bg-brand-pink" },
          { n: "+7.713", label: "Espectadores Alcançados", color: "bg-brand-yellow" },
          { n: "+4", label: "Cidades Beneficiadas", color: "bg-brand-purple" },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl border border-border/60 bg-card p-8 text-center shadow-sm">
            <div className={`mx-auto mb-4 h-2 w-16 rounded-full ${s.color}`} />
            <p className="font-display text-5xl font-bold text-foreground">{s.n}</p>
            <p className="mt-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FestivalIntro() {
  return (
    <section className="bg-gradient-to-b from-background to-brand-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
        <article className="rounded-3xl bg-card p-8 shadow-sm">
          <h3 className="font-display text-3xl text-brand-pink">O Festival</h3>
          <p className="mt-4 text-foreground/80">
            Aviva Cultura é uma mostra de artes feita especialmente para dar espaço aos artistas locais, incentivando e valorizando a criatividade através de ações culturais em espaços públicos, difundindo valores e educando através da arte.
          </p>
        </article>
        <article className="rounded-3xl bg-card p-8 shadow-sm">
          <h3 className="font-display text-3xl text-brand-purple">Quem faz</h3>
          <p className="mt-4 text-foreground/80">
            O festival é realizado pela ACRIART, uma instituição sem fins lucrativos que — há mais de 10 anos — acredita no poder da arte como agente de transformação sociocultural.
          </p>
        </article>
      </div>
    </section>
  );
}

function PreviousEditionsTeaser({ editions }: { editions: Edition[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-3xl text-foreground md:text-4xl">Confira as edições anteriores</h2>
        <Link to="/edicoes-anteriores" className="text-sm font-semibold text-brand-pink hover:underline">
          Conheça todas as edições →
        </Link>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {editions.map((e) => (
          <EditionCard key={e.id} edition={e} />
        ))}
      </div>
    </section>
  );
}

export function EditionCard({ edition }: { edition: Edition }) {
  const date = new Date(edition.data + "T00:00:00");
  return (
    <Link
      to="/edicoes/$id"
      params={{ id: edition.id }}
      className="group block overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      {edition.imagem_url ? (
        <img src={edition.imagem_url} alt={edition.titulo} className="aspect-video w-full object-cover transition group-hover:scale-[1.02]" />
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-brand-pink via-brand-orange to-brand-yellow" />
      )}
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-purple">
          {date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
        <h3 className="mt-2 font-display text-2xl text-foreground group-hover:text-brand-pink">{edition.titulo}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{edition.local}</p>
        <p className="mt-3 line-clamp-3 text-sm text-foreground/80">{edition.descricao}</p>
      </div>
    </Link>
  );
}
