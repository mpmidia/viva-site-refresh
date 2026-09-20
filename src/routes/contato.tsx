import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { festivalMedia } from "@/lib/festival-media";

export const Route = createFileRoute("/contato")({
  head: () => ({ meta: [
    { title: "Contato — Festival Aviva Cultura" },
    { name: "description", content: "Entre em contato com a equipe do Festival Aviva Cultura." },
    { property: "og:title", content: "Contato — Festival Aviva Cultura" },
    { property: "og:description", content: "Fale com a equipe do Festival Aviva Cultura." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }), component: ContactPage,
});

function ContactPage() { return <SiteShell><section className="relative min-h-[62svh] overflow-hidden bg-brand-purple text-primary-foreground"><img src={festivalMedia.cityPerformance} alt="Performance artística do Festival Aviva Cultura" className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-brand-purple/70" /><div className="relative mx-auto flex min-h-[62svh] max-w-7xl items-end px-5 py-16 md:px-8"><div><p className="text-sm font-bold uppercase text-brand-yellow">Contato</p><h1 className="mt-4 max-w-4xl font-display text-5xl uppercase leading-tight md:text-8xl">Vamos movimentar a cultura juntos.</h1></div></div></section><section className="py-20"><div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-2 md:px-8"><h2 className="font-display text-4xl uppercase md:text-6xl">Fale com a equipe do Aviva Cultura.</h2><div><p className="text-xl leading-relaxed text-muted-foreground">Os canais oficiais de contato serão publicados aqui assim que forem disponibilizados pela organização.</p><Link to="/patrocinio" className="mt-8 inline-flex items-center gap-2 bg-brand-yellow px-6 py-4 text-sm font-bold uppercase text-foreground">Conheça a página de patrocínio <ArrowRight className="size-5" /></Link></div></div></section></SiteShell>; }