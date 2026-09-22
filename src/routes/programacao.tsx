import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { LogosBar } from "@/components/logos-bar";
import { useSiteImage } from "@/hooks/useSiteImage";
import { attractionsQuery, formatDate, nextEditionQuery, type Attraction } from "@/lib/site-content";

export const Route = createFileRoute("/programacao")({
  head: () => ({ meta: [
    { title: "Programação — Festival Aviva Cultura" },
    { name: "description", content: "Atrações, horários e locais da programação do Festival Aviva Cultura." },
    { property: "og:title", content: "Programação — Festival Aviva Cultura" },
    { property: "og:description", content: "Confira as atrações da próxima edição do Festival Aviva Cultura." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ProgramPage,
});

function ProgramPage() {
  const image = useSiteImage();
  const { data: attractions = [], isLoading } = useQuery(attractionsQuery());
  const { data: next } = useQuery(nextEditionQuery());

  const byDay = attractions.reduce<Record<string, Attraction[]>>((acc, item) => {
    const key = item.data ?? "sem-data";
    (acc[key] ??= []).push(item);
    return acc;
  }, {});
  const days = Object.keys(byDay).sort();

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-brand-purple text-primary-foreground md:min-h-[52svh]">
        <div className="relative aspect-[4/3] md:absolute md:inset-0 md:aspect-auto"><img src={image("programacao-hero")} alt="Apresentação do Festival Aviva Cultura" className="size-full object-cover" /></div>
        <div className="hidden md:absolute md:inset-0 md:block md:bg-gradient-to-r md:from-brand-purple md:via-brand-purple/75 md:to-brand-purple/10" />
        <div className="relative mx-auto flex max-w-7xl items-center px-5 py-12 md:min-h-[52svh] md:px-8 md:py-20">
          <div>
            <p className="text-sm font-bold uppercase text-brand-yellow">Programação</p>
            <h1 className="mt-4 font-display text-3xl uppercase leading-tight sm:text-4xl md:text-6xl">{next?.cidade ? `Aviva Cultura em ${next.cidade}` : "Programação do festival"}</h1>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          {isLoading ? (
            <p className="text-muted-foreground">Carregando programação...</p>
          ) : attractions.length === 0 ? (
            <div className="border border-dashed border-border p-12 text-center">
              <p className="font-display text-4xl uppercase text-brand-pink md:text-6xl">Em breve</p>
              <p className="mt-4 text-lg text-muted-foreground">A programação desta edição será publicada aqui.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {days.map((day) => (
                <div key={day}>
                  <h2 className="font-display text-2xl uppercase text-brand-pink md:text-3xl">{day === "sem-data" ? "Datas a confirmar" : formatDate(day)}</h2>
                  <div className="mt-6 divide-y divide-border border-t border-border">
                    {byDay[day].map((item) => (
                      <article key={item.id} className="flex flex-col gap-2 py-6 md:flex-row md:gap-8">
                        <p className="shrink-0 font-display text-xl text-brand-teal md:w-28">{item.horario ?? "--:--"}</p>
                        <div>
                          <h3 className="font-display text-xl uppercase md:text-2xl">{item.nome}</h3>
                          {item.local && <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" /> {item.local}</p>}
                          {item.descricao && <p className="mt-3 text-lg leading-relaxed text-foreground/80">{item.descricao}</p>}
                          {!item.horario && <p className="mt-2 flex items-center gap-2 text-xs uppercase text-muted-foreground"><Clock className="size-3" /> horário a confirmar</p>}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <LogosBar url={next?.logosUrl} />
    </SiteShell>
  );
}
