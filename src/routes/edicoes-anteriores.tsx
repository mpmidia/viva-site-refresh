import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { editionsQuery } from "@/lib/editions";
import { EditionCard } from "./index";

export const Route = createFileRoute("/edicoes-anteriores")({
  head: () => ({
    meta: [
      { title: "Edições Anteriores — Aviva Cultura" },
      { name: "description", content: "Confira todas as edições passadas do Festival Aviva Cultura." },
      { property: "og:title", content: "Edições Anteriores — Aviva Cultura" },
      { property: "og:description", content: "Confira todas as edições passadas do Festival Aviva Cultura." },
    ],
  }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(editionsQuery()); },
  component: PreviousPage,
});

function PreviousPage() {
  const { data: editions } = useSuspenseQuery(editionsQuery());
  const previous = editions.slice(1);

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-pink via-brand-purple to-brand-purple text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="font-display text-2xl md:text-3xl">Confira as edições do</p>
          <h1 className="font-display text-6xl font-bold text-brand-yellow md:text-7xl">Aviva Cultura</h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        {previous.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-card p-12 text-center">
            <p className="font-display text-2xl text-foreground">Ainda não há edições anteriores</p>
            <p className="mt-2 text-muted-foreground">Assim que uma nova edição for cadastrada, as anteriores aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {previous.map((e) => <EditionCard key={e.id} edition={e} />)}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
