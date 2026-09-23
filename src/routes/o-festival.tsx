import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { useSiteImage } from "@/hooks/useSiteImage";

export const Route = createFileRoute("/o-festival")({
  head: () => ({ meta: [
    { title: "O Festival — Festival Aviva Cultura" },
    { name: "description", content: "Conheça o encontro que transforma espaços públicos em territórios de arte, afeto, diálogo e cidadania." },
    { property: "og:title", content: "O Festival — Festival Aviva Cultura" },
    { property: "og:description", content: "Mais do que um festival: arte, cidade, pessoas e transformação sociocultural." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: FestivalPage,
});

const results = [
  { number: "+174", title: "Artistas Incentivados", text: "fomento à economia criativa e apoio a talentos regionais" },
  { number: "+7.713", title: "Espectadores Alcançados", text: "participação popular, acesso livre e gratuito" },
  { number: "+4", title: "Cidades Beneficiadas", text: "presença regional contínua e descentralização" },
  { number: "+10", title: "Anos de Trajetória", text: "solidez e compromisso da ACRIART" },
];

function FestivalPage() {
  const image = useSiteImage();
  const hero = image("festival-hero");
  const quemFaz = image("festival-quem-faz");
  return (
    <SiteShell>
      <div className="w-full overflow-x-hidden">
      <section className="relative overflow-hidden bg-brand-purple text-primary-foreground md:min-h-[72svh]">
        {hero && <div className="relative aspect-[4/3] md:absolute md:inset-0 md:aspect-auto"><img src={hero} alt="Artistas do Festival Aviva Cultura em apresentação na cidade" className="size-full object-cover" /></div>}
        <div className="hidden md:absolute md:inset-0 md:block md:bg-gradient-to-r md:from-brand-purple md:via-brand-purple/75 md:to-brand-purple/10" />
        <div className="relative mx-auto flex max-w-7xl items-center px-5 py-12 md:min-h-[72svh] md:px-8 md:py-20"><div className="max-w-4xl"><p className="text-sm font-bold uppercase text-brand-yellow">O Festival</p><h1 className="mt-4 font-display text-3xl uppercase leading-tight sm:text-4xl md:text-6xl lg:text-7xl">Mais do que um festival: um momento para desacelerar, emocionar-se e movimentar a cidade com o que ela tem de melhor.</h1></div></div>
      </section>

      <section className="py-20 md:py-28"><div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-12 md:px-8"><h2 className="font-display text-4xl uppercase text-brand-pink md:col-span-4 md:text-5xl">A surpresa de um encontro espontâneo.</h2><p className="text-xl leading-relaxed text-foreground/80 md:col-span-7 md:col-start-6">Sabe aquela sensação de andar pela cidade e ser surpreendido por uma música, uma cor ou uma performance que nos faz parar, sorrir e esquecer a pressa do dia? O Festival Aviva Cultura nasce exatamente desse encontro espontâneo, transformando diversos locais em espaços de pura vida, afeto e inspiração.</p></div></section>

      <section className="bg-brand-teal py-20 md:py-28"><div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-2 md:items-center md:px-8">{quemFaz && <img src={quemFaz} alt="Público participando de apresentação do Festival Aviva Cultura" className="aspect-[4/5] w-full object-cover" />}<div className="text-foreground"><p className="text-sm font-bold uppercase">Quem faz</p><h2 className="mt-4 font-display text-4xl uppercase leading-tight md:text-6xl">Gente da nossa terra, arte no coração da cidade</h2><p className="mt-6 text-lg leading-relaxed">Feito com a dedicação da ACRIART, que há mais de 10 anos acredita e prova que a arte tem o poder de mudar vidas, o Festival Aviva Cultura é uma mostra artística projetada para fortalecer a identidade regional e ressignificar a ocupação dos espaços públicos. Concebido como uma experiência de relevante impacto social e educativo, o projeto atua na democratização do acesso às artes, transformando praças e locais de grande circulação em territórios de efervescência criativa, diálogo e cidadania. O Aviva Cultura não é só um evento no calendário. É um abraço coletivo, um convite para desacelerar, emocionar e valorizar o que é nosso.</p></div></div></section>

      <section className="bg-brand-purple py-20 text-primary-foreground md:py-28"><div className="mx-auto max-w-7xl px-5 md:px-8"><p className="text-sm font-bold uppercase text-brand-yellow">Resultados e impacto consolidado</p><h2 className="mt-4 max-w-4xl font-display text-4xl uppercase leading-tight md:text-6xl">Cultura que deixa marcas reais.</h2><div className="mt-12 grid border-l border-t border-primary-foreground/25 md:grid-cols-2 lg:grid-cols-4">{results.map((item) => <article key={item.title} className="border-b border-r border-primary-foreground/25 p-7"><p className="font-display text-5xl text-brand-yellow md:text-6xl">{item.number}</p><h3 className="mt-4 font-display text-xl uppercase">{item.title}</h3><p className="mt-3 text-primary-foreground/70">{item.text}</p></article>)}</div></div></section>

      <section className="bg-brand-yellow py-20 md:py-28"><div className="mx-auto max-w-6xl px-5 text-center md:px-8"><p className="font-display text-4xl uppercase leading-tight md:text-7xl">A arte como vetor de transformação: integrando talentos locais e fortalecendo a comunidade.</p></div></section>
      </div>
    </SiteShell>
  );
}