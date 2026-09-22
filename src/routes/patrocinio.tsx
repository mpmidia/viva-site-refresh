import { createFileRoute } from "@tanstack/react-router";
import { Building2, Eye, HeartHandshake, Leaf, MessageCircle, Download } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { festivalMedia } from "@/lib/festival-media";

export const Route = createFileRoute("/patrocinio")({
  head: () => ({ meta: [
    { title: "Patrocínio — Festival Aviva Cultura" },
    { name: "description", content: "Associe sua marca ao Festival Aviva Cultura e transforme impostos em impacto social, arte e economia criativa local." },
    { property: "og:title", content: "Seja um patrocinador — Festival Aviva Cultura" },
    { property: "og:description", content: "Sua marca tem o poder de levar arte, inspiração e vida para o coração das nossas cidades." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: SponsorPage,
});

const benefits = [
  { icon: Building2, title: "Custo Zero", text: "dedução integral do valor investido direto do imposto devido, para empresas em Lucro Real ou contribuintes de ICMS" },
  { icon: Leaf, title: "Posicionamento ESG na Prática", text: "ações reais de responsabilidade social, inclusão e valorização territorial" },
  { icon: Eye, title: "Visibilidade de Alta Circulação", text: "exposição contínua da marca em palcos, materiais gráficos, imprensa e campanhas digitais" },
  { icon: HeartHandshake, title: "Conexão Emocional", text: "empresa associada a momentos inesquecíveis de lazer e arte em espaços públicos" },
];

function SponsorPage() {
  return <SiteShell>
    <section className="relative overflow-hidden bg-brand-purple text-primary-foreground md:min-h-[80svh]"><div className="relative aspect-[4/3] md:absolute md:inset-0 md:aspect-auto"><img src={festivalMedia.heroCrowd} alt="Público e palco do Festival Aviva Cultura" className="size-full object-cover" /></div><div className="hidden md:absolute md:inset-0 md:block md:bg-gradient-to-r md:from-brand-purple md:via-brand-purple/80 md:to-brand-purple/10" /><div className="relative mx-auto flex max-w-7xl items-center px-5 py-12 md:min-h-[80svh] md:px-8 md:py-20"><div className="max-w-4xl"><p className="text-sm font-bold uppercase text-brand-yellow">Patrocínio</p><h1 className="mt-4 font-display text-4xl uppercase leading-tight md:text-6xl lg:text-7xl">Transforme impostos em impacto social: Seja um patrocinador do Festival Aviva Cultura</h1><p className="mt-6 max-w-3xl text-lg leading-relaxed text-primary-foreground/85 md:text-xl">Sua marca tem o poder de levar arte, inspiração e vida para o coração das nossas cidades. Ao patrocinar o Festival Aviva Cultura, você não apenas associa sua empresa a um projeto de sucesso consolidado, mas se torna um agente direto de transformação sociocultural, democratizando o acesso à cultura e fomentando a economia criativa local.</p></div></div></section>
    <section className="py-20 md:py-28"><div className="mx-auto max-w-7xl px-5 md:px-8"><p className="text-sm font-bold uppercase text-brand-pink">Parceria que transforma</p><h2 className="mt-3 max-w-4xl font-display text-4xl uppercase md:text-6xl">Por que ser um patrocinador oficial?</h2><div className="mt-12 grid border-l border-t border-border md:grid-cols-2">{benefits.map(({ icon: Icon, title, text }, index) => <article key={title} className="border-b border-r border-border p-7 md:p-10"><div className="flex items-start justify-between"><Icon className="size-9 text-brand-pink" /><span className="font-display text-4xl text-brand-yellow">0{index + 1}</span></div><h3 className="mt-12 font-display text-2xl uppercase">{title}</h3><p className="mt-4 text-lg leading-relaxed text-muted-foreground">{text}</p></article>)}</div></div></section>
    <section className="relative overflow-hidden py-24 text-primary-foreground"><img src={festivalMedia.audienceTheater} alt="Público vivendo uma experiência cultural no Festival Aviva Cultura" className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-brand-pink/90" /><div className="relative mx-auto max-w-7xl px-5 md:px-8"><h2 className="max-w-4xl font-display text-4xl uppercase md:text-7xl">Sua marca no centro da transformação cultural</h2><p className="mt-6 max-w-3xl text-xl">Temos cotas adaptadas ao porte da sua empresa para garantir o máximo de retorno de imagem e impacto socioambiental.</p><div className="mt-9 flex flex-wrap gap-3"><span aria-disabled="true" className="inline-flex cursor-not-allowed items-center gap-3 bg-brand-yellow px-6 py-4 text-sm font-bold uppercase text-foreground opacity-75"><MessageCircle className="size-5" /> Fale com a Nossa Equipe de Captação · Em breve</span><span aria-disabled="true" className="inline-flex cursor-not-allowed items-center gap-3 border border-primary-foreground px-6 py-4 text-sm font-bold uppercase opacity-75"><Download className="size-5" /> Baixe o Mídia Kit de Patrocínio · Em breve</span></div></div></section>
  </SiteShell>;
}