import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Edition } from "@/lib/editions";

export function EditionCard({ edition, showFullText = false }: { edition: Edition; showFullText?: boolean }) {
  const date = new Date(edition.data + "T00:00:00");
  return (
    <article className="group overflow-hidden border-b border-border bg-card">
      <Link to="/edicoes/$id" params={{ id: edition.id }} className="block overflow-hidden">
        {edition.imagem_url ? (
          <img src={edition.imagem_url} alt={edition.titulo} className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="aspect-[4/3] w-full bg-brand-pink" />
        )}
      </Link>
      <div className="py-6">
        <p className="text-xs font-bold uppercase text-brand-teal">
          {date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl uppercase leading-tight text-foreground">{edition.titulo}</h3>
          <Link to="/edicoes/$id" params={{ id: edition.id }} aria-label={`Conhecer ${edition.titulo}`} className="grid size-10 shrink-0 place-items-center bg-brand-yellow text-foreground transition group-hover:bg-brand-pink group-hover:text-primary-foreground">
            <ArrowUpRight className="size-5" />
          </Link>
        </div>
        <p className="mt-2 text-sm font-medium text-muted-foreground">{edition.local}</p>
        <p className={`mt-4 text-base leading-relaxed text-foreground/75 ${showFullText ? "" : "line-clamp-4"}`}>{edition.descricao}</p>
        <Link to="/edicoes/$id" params={{ id: edition.id }} className="mt-5 inline-flex border-b-2 border-brand-pink pb-1 text-sm font-bold uppercase text-foreground transition hover:text-brand-pink">
          Conheça esta edição
        </Link>
      </div>
    </article>
  );
}