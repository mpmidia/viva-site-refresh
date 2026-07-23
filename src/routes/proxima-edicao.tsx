import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { editionsQuery } from "@/lib/editions";

export const Route = createFileRoute("/proxima-edicao")({
  head: () => ({
    meta: [
      { title: "Confira a Próxima Edição — Aviva Cultura" },
      { name: "description", content: "Detalhes completos da próxima edição do Festival Aviva Cultura — data, local, participantes e como se inscrever." },
      { property: "og:title", content: "Próxima Edição — Aviva Cultura" },
      { property: "og:description", content: "Detalhes da próxima edição e como se inscrever." },
    ],
  }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(editionsQuery()); },
  component: NextPage,
});

function NextPage() {
  const { data: editions } = useSuspenseQuery(editionsQuery());
  const current = editions[0];

  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-16 md:py-24">
        {!current ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-card p-12 text-center">
            <p className="font-display text-3xl text-brand-pink">Em breve!</p>
            <p className="mt-3 text-muted-foreground">
              A próxima edição do Festival Aviva Cultura ainda será anunciada. Fique de olho por aqui.
            </p>
          </div>
        ) : (
          <article className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg">
            {current.imagem_url && (
              <img src={current.imagem_url} alt={current.titulo} className="aspect-[21/9] w-full object-cover" />
            )}
            <div className="p-8 md:p-12">
              <span className="inline-block rounded-full bg-brand-pink/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-pink">
                Próxima edição
              </span>
              <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">{current.titulo}</h1>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <InfoBox icon={<CalendarDays className="size-5" />} label="Data" value={new Date(current.data + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })} />
                <InfoBox icon={<MapPin className="size-5" />} label="Local" value={current.local} />
                <InfoBox icon={<Users className="size-5" />} label="Participantes" value={String(current.participantes)} />
              </div>

              <div className="mt-8">
                <h2 className="font-display text-2xl text-brand-purple">Sobre esta edição</h2>
                <p className="mt-3 whitespace-pre-line text-foreground/85">{current.descricao}</p>
              </div>

              {current.inscricao_url && (
                <a
                  href={current.inscricao_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-pink px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-brand-pink/30 hover:opacity-90"
                >
                  Faça sua inscrição
                </a>
              )}
            </div>
          </article>
        )}
      </section>
    </SiteShell>
  );
}

function InfoBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-brand-cream p-4">
      <div className="flex items-center gap-2 text-brand-pink">{icon}<span className="text-xs font-semibold uppercase tracking-wider">{label}</span></div>
      <p className="mt-2 font-display text-lg text-foreground">{value}</p>
    </div>
  );
}
