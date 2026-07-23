import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/o-festival")({
  head: () => ({
    meta: [
      { title: "O Festival — Aviva Cultura" },
      { name: "description", content: "Conheça o Festival Aviva Cultura e a ACRIART, instituição realizadora com mais de 10 anos de história." },
      { property: "og:title", content: "O Festival — Aviva Cultura" },
      { property: "og:description", content: "Uma mostra que dá espaço aos artistas locais e valoriza a criatividade em espaços públicos." },
    ],
  }),
  component: FestivalPage,
});

function FestivalPage() {
  return (
    <SiteShell>
      <section className="bg-gradient-to-b from-brand-pink/10 via-background to-background">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
          <span className="inline-block rounded-full bg-brand-pink/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-pink">
            Sobre nós
          </span>
          <h1 className="mt-4 font-display text-5xl text-foreground md:text-6xl">O Festival</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Uma experiência cultural transformadora para artistas e público.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="space-y-10">
          <article className="rounded-3xl bg-card p-8 shadow-sm">
            <h2 className="font-display text-3xl text-brand-pink">O Festival</h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/85">
              Aviva Cultura é uma mostra de artes feita especialmente para dar espaço aos artistas locais, incentivando e valorizando a criatividade através de ações culturais em espaços públicos, difundindo valores e educando através da arte.
            </p>
          </article>

          <article className="rounded-3xl bg-card p-8 shadow-sm">
            <h2 className="font-display text-3xl text-brand-purple">Quem faz</h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/85">
              O festival é realizado pela ACRIART, uma instituição sem fins lucrativos que — há mais de 10 anos — acredita no poder da arte como agente de transformação sociocultural.
            </p>
          </article>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { n: "+174", label: "Artistas Incentivados" },
              { n: "+7.713", label: "Espectadores Alcançados" },
              { n: "+4", label: "Cidades Beneficiadas" },
            ].map((s) => (
              <div key={s.label} className="rounded-3xl border border-border/60 bg-card p-6 text-center">
                <p className="font-display text-4xl font-bold text-brand-pink">{s.n}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
