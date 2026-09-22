import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { EditionCard } from "@/components/edition-card";
import { editionsQuery } from "@/lib/editions";
import { useSiteImage } from "@/hooks/useSiteImage";


export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Festival Aviva Cultura — Arte que movimenta a cidade" },
    { name: "description", content: "Entre no Festival Aviva Cultura: arte, cidade, pessoas e experiências culturais que transformam espaços públicos." },
    { property: "og:title", content: "Festival Aviva Cultura — Arte que movimenta a cidade" },
    { property: "og:description", content: "Uma experiência cultural viva que valoriza artistas regionais e aproxima a arte das pessoas." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(editionsQuery()); },
  component: HomePage,
});

function HomePage() {
  const { data: editions } = useSuspenseQuery(editionsQuery());
  return (
    <SiteShell>
      <Hero />
      <FestivalIntro />
      <LatestEditions editions={editions.slice(0, 3)} />
      <Invitation />
      <SponsorCall />
    </SiteShell>
  );
}

function Hero() {
  const image = useSiteImage();
  return (
    <section className="relative overflow-hidden bg-brand-purple text-primary-foreground md:min-h-[calc(100svh-81px)]">
      <div className="relative aspect-[4/3] overflow-hidden md:absolute md:inset-0 md:aspect-auto"><img src={image("home-hero")} alt="Público reunido em uma apresentação do Festival Aviva Cultura" className="festival-drift size-full object-cover object-center" /><div className="absolute inset-0 bg-brand-purple/10 md:bg-brand-purple/30" /></div>
      <div className="hidden md:absolute md:inset-0 md:block md:bg-gradient-to-r md:from-brand-purple md:via-brand-purple/60 md:to-transparent" />
      <div className="relative mx-auto flex max-w-7xl items-center px-5 py-12 md:min-h-[calc(100svh-81px)] md:px-8 md:py-16">
        <div className="max-w-5xl">
          <p className="mb-4 text-sm font-bold uppercase text-brand-yellow">Festival Aviva Cultura</p>
          <h1 className="max-w-4xl font-display text-5xl uppercase leading-none text-primary-foreground md:text-8xl lg:text-9xl">A cidade vira palco.</h1>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <p className="max-w-xl text-lg leading-relaxed text-primary-foreground/90 md:text-xl">Arte, pessoas e experiências culturais ocupando espaços públicos e movimentando a vida ao nosso redor.</p>
            <Link to="/o-festival" className="inline-flex items-center gap-3 bg-brand-yellow px-6 py-4 text-sm font-bold uppercase text-foreground transition hover:bg-brand-pink hover:text-primary-foreground">Conheça o festival <ArrowRight className="size-5" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}


function FestivalIntro() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-[.75fr_1.25fr] md:px-8">
        <p className="text-sm font-bold uppercase text-brand-pink">Uma experiência cultural transformadora</p>
        <div>
          <h2 className="font-display text-4xl uppercase leading-tight md:text-6xl">Um encontro entre arte, cidade e pessoas.</h2>
          <p className="mt-6 max-w-3xl text-xl leading-relaxed text-muted-foreground">Aviva Cultura é uma mostra de artes feita especialmente para dar espaço aos artistas locais, incentivando e valorizando a criatividade através de ações culturais em espaços públicos, difundindo valores e educando através da arte.</p>
        </div>
      </div>
    </section>
  );
}

function LatestEditions({ editions }: { editions: Awaited<ReturnType<typeof import("@/lib/editions").fetchEditions>> }) {
  return (
    <section className="bg-brand-cream py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><p className="text-sm font-bold uppercase text-brand-teal">Aconteceu no Aviva</p><h2 className="mt-3 font-display text-4xl uppercase md:text-6xl">Últimas edições</h2></div>
          <Link to="/edicoes-anteriores" className="inline-flex items-center gap-2 border-b-2 border-brand-pink pb-1 text-sm font-bold uppercase">Ver todas <ArrowRight className="size-4" /></Link>
        </div>
        <div className="mt-12 grid gap-10 md:grid-cols-3">{editions.map((edition) => <EditionCard key={edition.id} edition={edition} showFullText />)}</div>
      </div>
    </section>
  );
}


function Invitation() {
  return <section className="bg-brand-yellow py-20"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 md:flex-row md:items-end md:px-8"><h2 className="max-w-4xl font-display text-4xl uppercase leading-tight md:text-6xl">Mais do que um festival: um momento para desacelerar e se emocionar.</h2><Link to="/o-festival" className="inline-flex shrink-0 items-center gap-2 bg-foreground px-6 py-4 text-sm font-bold uppercase text-background">Conheça nossa história <ArrowRight className="size-5" /></Link></div></section>;
}

function SponsorCall() {
  return <section className="relative overflow-hidden py-24 text-primary-foreground"><img src={festivalMedia.artistTalk} alt="Encontro cultural realizado pelo Festival Aviva Cultura" className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-brand-pink/85" /><div className="relative mx-auto max-w-7xl px-5 md:px-8"><p className="text-sm font-bold uppercase text-brand-yellow">Patrocínio</p><h2 className="mt-4 max-w-4xl font-display text-4xl uppercase leading-tight md:text-6xl">Sua marca no centro da transformação cultural.</h2><Link to="/patrocinio" className="mt-8 inline-flex items-center gap-2 bg-brand-yellow px-6 py-4 text-sm font-bold uppercase text-foreground">Quero conhecer o projeto <ArrowRight className="size-5" /></Link></div></section>;
}