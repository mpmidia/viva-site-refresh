import { createFileRoute, Link, useRouter, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { editionByIdQuery } from "@/lib/editions";

export const Route = createFileRoute("/edicoes/$id")({
  loader: async ({ context, params }) => {
    const edition = await context.queryClient.ensureQueryData(editionByIdQuery(params.id));
    if (!edition) throw notFound();
    return { edition };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Edição não encontrada — Aviva Cultura" }, { name: "robots", content: "noindex" }] };
    }
    const { edition } = loaderData;
    const desc = edition.descricao.slice(0, 155);
    const meta: Array<Record<string, string>> = [
      { title: `${edition.titulo} — Aviva Cultura` },
      { name: "description", content: desc },
      { property: "og:title", content: `${edition.titulo} — Aviva Cultura` },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (edition.imagem_url) {
      meta.push({ property: "og:image", content: edition.imagem_url });
      meta.push({ name: "twitter:image", content: edition.imagem_url });
    }
    return { meta };
  },
  component: EditionDetailPage,
  errorComponent: EditionError,
  notFoundComponent: EditionNotFound,
});

function EditionDetailPage() {
  const { edition } = Route.useLoaderData();
  const { data } = useSuspenseQuery(editionByIdQuery(edition.id));
  const e = data ?? edition;
  const date = new Date(e.data + "T00:00:00");
  const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-purple via-brand-purple to-brand-pink text-white">
        <div className="absolute -left-32 -top-24 size-96 rounded-full bg-brand-yellow/25 blur-3xl" aria-hidden />
        <div className="absolute -right-24 bottom-0 size-96 rounded-full bg-brand-pink/40 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <Link
            to="/edicoes-anteriores"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-brand-yellow"
          >
            <ArrowLeft className="size-4" /> Todas as edições
          </Link>
          <p className="mt-6 font-display text-xl text-brand-yellow md:text-2xl">Edição</p>
          <h1 className="mt-1 font-display text-5xl font-bold leading-tight md:text-6xl">{e.titulo}</h1>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
            <span className="inline-flex items-center gap-2"><CalendarDays className="size-4" />{dateStr}</span>
            <span className="inline-flex items-center gap-2"><MapPin className="size-4" />{e.local}</span>
            <span className="inline-flex items-center gap-2"><Users className="size-4" />{e.participantes} participantes</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-start">
          <article className="space-y-5">
            {e.imagem_url && (
              <img
                src={e.imagem_url}
                alt={e.titulo}
                className="aspect-video w-full rounded-3xl object-cover shadow-lg"
              />
            )}
            <div className="rounded-3xl border border-border/60 bg-card p-8">
              <h2 className="font-display text-2xl text-brand-pink">Sobre esta edição</h2>
              <p className="mt-4 whitespace-pre-line text-foreground/85 leading-relaxed">
                {e.descricao}
              </p>
            </div>
          </article>

          <aside className="space-y-4 rounded-3xl border border-border/60 bg-card p-8 shadow-sm md:sticky md:top-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-purple">Informações</p>
            <InfoRow label="Data" value={dateStr} />
            <InfoRow label="Local" value={e.local} />
            <InfoRow label="Participantes" value={String(e.participantes)} />
            {e.inscricao_url && (
              <a
                href={e.inscricao_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brand-pink px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-brand-pink/30 hover:opacity-90"
              >
                Faça sua inscrição
              </a>
            )}
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function EditionNotFound() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-purple">Ops</p>
        <h1 className="mt-3 font-display text-4xl">Edição não encontrada</h1>
        <p className="mt-4 text-muted-foreground">A edição que você procura não existe ou foi removida.</p>
        <Link to="/edicoes-anteriores" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-pink px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Ver todas as edições
        </Link>
      </section>
    </SiteShell>
  );
}

function EditionError({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Não foi possível carregar esta edição</h1>
        <button
          onClick={() => { reset(); router.invalidate(); }}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-pink px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Tentar novamente
        </button>
      </section>
    </SiteShell>
  );
}
