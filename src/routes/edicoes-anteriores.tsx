import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { EditionCard } from "@/components/edition-card";
import { editionsQuery } from "@/lib/editions";
import { festivalMedia } from "@/lib/festival-media";

export const Route = createFileRoute("/edicoes-anteriores")({
  head: () => ({ meta: [
    { title: "Edições Anteriores — Festival Aviva Cultura" },
    { name: "description", content: "Reviva as edições do Festival Aviva Cultura e conheça suas histórias, cidades, artistas e públicos." },
    { property: "og:title", content: "Edições Anteriores — Festival Aviva Cultura" },
    { property: "og:description", content: "Registros e histórias das edições que movimentaram cidades através da arte." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(editionsQuery()); },
  component: PreviousPage,
});

function PreviousPage() {
  const { data: editions } = useSuspenseQuery(editionsQuery());
  return (
    <SiteShell>
      <section className="relative min-h-[58svh] overflow-hidden bg-brand-purple text-primary-foreground"><img src={festivalMedia.performerStage} alt="Artista em apresentação do Festival Aviva Cultura" className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-brand-purple/55" /><div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-brand-purple to-transparent" /><div className="relative mx-auto flex min-h-[58svh] max-w-7xl items-end px-5 py-14 md:px-8 md:py-20"><div><p className="text-sm font-bold uppercase text-brand-yellow">Nossa trajetória</p><h1 className="mt-3 font-display text-5xl uppercase leading-none md:text-8xl">Edições anteriores</h1><p className="mt-5 max-w-2xl text-lg text-primary-foreground/85">Cada cidade, cada palco e cada encontro fazem parte desta história viva.</p></div></div></section>
      <section className="py-20 md:py-28"><div className="mx-auto max-w-7xl px-5 md:px-8">{editions.length === 0 ? <p className="border border-dashed border-border p-10 text-center text-muted-foreground">Ainda não há edições disponíveis.</p> : <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">{editions.map((edition) => <EditionCard key={edition.id} edition={edition} />)}</div>}</div></section>
    </SiteShell>
  );
}