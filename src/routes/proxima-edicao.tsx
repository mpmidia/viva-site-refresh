import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Megaphone, TicketCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { festivalMedia } from "@/lib/festival-media";

export const Route = createFileRoute("/proxima-edicao")({
  head: () => ({ meta: [
    { title: "Próxima Edição — Festival Aviva Cultura" },
    { name: "description", content: "Acompanhe as futuras fases de anúncio, programação e inscrições da próxima edição do Festival Aviva Cultura." },
    { property: "og:title", content: "Próxima Edição — Festival Aviva Cultura" },
    { property: "og:description", content: "A próxima experiência Aviva Cultura será anunciada aqui." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: NextPage,
});

function NextPage() {
  const phases = [{ icon: Megaphone, title: "Anúncio", text: "Cidade, data e local" }, { icon: CalendarClock, title: "Programação", text: "Artistas e experiências" }, { icon: TicketCheck, title: "Inscrições", text: "Abertura e acesso" }];
  return <SiteShell><section className="relative min-h-[64svh] overflow-hidden bg-brand-purple text-primary-foreground"><img src={festivalMedia.liveShow} alt="Apresentação musical do Festival Aviva Cultura" className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-brand-purple/70" /><div className="relative mx-auto flex min-h-[64svh] max-w-7xl items-end px-5 py-16 md:px-8"><div><p className="text-sm font-bold uppercase text-brand-yellow">Próxima edição</p><h1 className="mt-4 max-w-4xl font-display text-5xl uppercase leading-tight md:text-8xl">Uma nova experiência está sendo preparada.</h1><p className="mt-5 max-w-2xl text-xl text-primary-foreground/80">As informações oficiais serão publicadas aqui no momento certo.</p></div></div></section><section className="py-20 md:py-28"><div className="mx-auto max-w-7xl px-5 md:px-8"><p className="text-sm font-bold uppercase text-brand-pink">Arquitetura preparada</p><h2 className="mt-3 max-w-3xl font-display text-4xl uppercase md:text-6xl">Acompanhe as três fases da próxima edição.</h2><div className="mt-12 grid border-l border-t border-border md:grid-cols-3">{phases.map(({ icon: Icon, title, text }, index) => <article key={title} className="border-b border-r border-border p-8"><Icon className="size-9 text-brand-pink" /><p className="mt-12 text-xs font-bold uppercase text-brand-teal">Fase 0{index + 1}</p><h3 className="mt-3 font-display text-2xl uppercase">{title}</h3><p className="mt-3 text-lg text-muted-foreground">{text}</p><span className="mt-8 inline-block bg-muted px-3 py-2 text-xs font-bold uppercase text-muted-foreground">Em breve</span></article>)}</div></div></section></SiteShell>;
}