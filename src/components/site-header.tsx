import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/logo.png";

const menu = [
  { label: "Início", to: "/" },
  { label: "O Festival", to: "/o-festival" },
  { label: "Edições Anteriores", to: "/edicoes-anteriores" },
  { label: "Patrocínio", to: "/patrocinio" },
  { label: "Contato", to: "/contato" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link to="/" onClick={() => setOpen(false)}><img src={logoUrl} alt="Festival Aviva Cultura" className="h-11 w-auto" /></Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {menu.map((item) => <Link key={item.to} to={item.to} activeOptions={{ exact: item.to === "/" }} className="text-sm font-bold uppercase text-foreground/70 transition hover:text-brand-pink data-[status=active]:text-brand-pink">{item.label}</Link>)}
          <Link to="/proxima-edicao" className="inline-flex items-center gap-2 bg-brand-yellow px-4 py-3 text-xs font-bold uppercase text-foreground transition hover:bg-brand-pink hover:text-primary-foreground">Confira a próxima edição <ArrowUpRight className="size-4" /></Link>
        </nav>
        <button className="grid size-11 place-items-center border border-border lg:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? "Fechar menu" : "Abrir menu"}>{open ? <X /> : <Menu />}</button>
      </div>
      <div className={cn("border-t border-border bg-background lg:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-7xl flex-col p-5">
          {menu.map((item) => <Link key={item.to} to={item.to} onClick={() => setOpen(false)} activeOptions={{ exact: item.to === "/" }} className="border-b border-border py-4 text-base font-bold uppercase data-[status=active]:text-brand-pink">{item.label}</Link>)}
          <Link to="/proxima-edicao" onClick={() => setOpen(false)} className="mt-5 bg-brand-yellow px-4 py-4 text-center text-sm font-bold uppercase">Confira a próxima edição</Link>
        </nav>
      </div>
    </header>
  );
}