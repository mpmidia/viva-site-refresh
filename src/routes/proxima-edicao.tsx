import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { CalendarClock, FileText, MapPin, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { LogosBar } from "@/components/logos-bar";
import { categoriesQuery, formatDate, formatMoney, formatPeriod, hasAnnouncement, nextEditionsQuery, paymentMethodsQuery, registrationStatus } from "@/lib/site-content";

export const Route = createFileRoute("/proxima-edicao")({
  head: () => ({ meta: [
    { title: "Próximas Edições — Festival Aviva Cultura" },
    { name: "description", content: "Cidades, locais, períodos, programação e inscrições das próximas edições do Festival Aviva Cultura." },
    { property: "og:title", content: "Próximas Edições — Festival Aviva Cultura" },
    { property: "og:description", content: "Encontre a próxima edição do Festival Aviva Cultura e inscreva seu trabalho." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: NextPage,
});

function NextPage() {
  const { data: all = [] } = useQuery(nextEditionsQuery());
  const editions = all.filter(hasAnnouncement);
  const categories = useQueries({ queries: editions.map((edition) => categoriesQuery(edition.id)) });
  const methods = useQueries({ queries: editions.map((edition) => paymentMethodsQuery(edition.id, true)) });
  return <SiteShell>
    <section className="bg-brand-purple px-5 py-16 text-primary-foreground md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl"><p className="text-sm font-bold uppercase text-brand-yellow">Festival Aviva Cultura</p><h1 className="mt-4 max-w-5xl font-display text-4xl uppercase leading-none sm:text-5xl md:text-7xl">Próximas edições</h1><p className="mt-5 max-w-2xl text-lg text-primary-foreground/80">Escolha uma cidade, conheça as datas e prepare seu trabalho para participar.</p></div>
    </section>
    {editions.length === 0 ? <section className="px-5 py-24 text-center"><Sparkles className="mx-auto size-10 text-brand-pink"/><h2 className="mt-6 font-display text-5xl uppercase">Em breve</h2></section> : <div className="divide-y divide-border">{editions.map((edition, index) => {
      const status = registrationStatus(edition); const period = formatPeriod(edition.data_evento, edition.data_fim); const registrationPeriod = formatPeriod(edition.inscricoes_abertura, edition.inscricoes_encerramento); const cats = categories[index]?.data ?? []; const receives = methods[index]?.data ?? []; const cover = edition.capasUrls[0];
      return <article key={edition.id} className="overflow-hidden"><div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)]">{cover && <img src={cover} alt={`Identidade visual da edição em ${edition.cidade ?? "cidade a anunciar"}`} className="aspect-[4/3] size-full object-cover lg:min-h-[650px]"/>}<div className={`flex items-center bg-brand-cream px-5 py-14 md:px-10 lg:px-14 ${cover ? "" : "lg:col-span-2"}`}><div className="w-full max-w-2xl"><p className="text-sm font-bold uppercase text-brand-pink">Próxima edição</p><h2 className="mt-3 font-display text-4xl uppercase leading-none text-brand-purple md:text-6xl">{edition.cidade || "Cidade em breve"}</h2>{edition.locais.length > 0 && <p className="mt-6 flex items-start gap-3 text-lg"><MapPin className="mt-1 size-5 shrink-0 text-brand-teal"/>{edition.locais.join(" · ")}</p>}{period && <p className="mt-4 flex items-center gap-3 font-display text-xl uppercase"><CalendarClock className="size-5 text-brand-pink"/>{period}</p>}
      <div className="mt-9 border-l-4 border-brand-yellow bg-background p-6"><p className="text-xs font-bold uppercase text-brand-teal">Período de inscrições</p><p className="mt-2 font-display text-2xl uppercase leading-tight text-brand-purple md:text-3xl">{registrationPeriod || "Datas em breve"}</p><p className="mt-3 text-sm font-bold uppercase text-brand-pink">{status === "abertas" ? "Inscrições abertas" : status === "encerradas" ? "Inscrições encerradas" : "Prepare sua proposta"}</p></div>
      {cats.length > 0 && <div className="mt-7 grid gap-2 sm:grid-cols-2">{cats.map((cat) => <div key={cat.id} className="border border-border bg-background p-4"><p className="font-semibold">{cat.nome}</p>{formatMoney(cat.valor) && <p className="mt-1 font-display text-xl text-brand-pink">{formatMoney(cat.valor)}</p>}</div>)}</div>}
      {receives.length > 0 && <p className="mt-5 text-sm"><strong className="text-brand-teal">Recebimento do cachê:</strong> {receives.map((item) => item.nome).join(" · ")}</p>}
      <div className="mt-8 flex flex-wrap gap-4">{status === "abertas" && <Link to="/inscricao" search={{ edicao: edition.id }} className="bg-brand-pink px-6 py-4 text-sm font-bold uppercase text-primary-foreground">Inscreva seu trabalho</Link>}<Link to="/programacao" search={{ edicao: edition.id }} className="bg-brand-yellow px-6 py-4 text-sm font-bold uppercase text-foreground">Ver programação</Link>{edition.regulamentoUrl && <a href={edition.regulamentoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b-2 border-brand-purple py-3 text-sm font-bold uppercase text-brand-purple"><FileText className="size-4"/>Regulamento</a>}</div>
      {edition.programacao_data && <p className="mt-5 text-sm text-muted-foreground">Programação completa {new Date(`${edition.programacao_data}T00:00:00`) <= new Date(new Date().setHours(0,0,0,0)) ? "disponível" : `a partir de ${formatDate(edition.programacao_data)}`}.</p>}{edition.possui_oficinas && <p className="mt-4 border-l-4 border-brand-teal pl-4">Esta edição também recebe propostas de <strong>oficinas</strong>.</p>}</div></div></div><LogosBar url={edition.logosUrl}/></article>;
    })}</div>}
  </SiteShell>;
}
