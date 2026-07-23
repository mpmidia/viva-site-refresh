import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menu = [
  { label: "Home", to: "/" },
  { label: "O Festival", to: "/o-festival" },
  { label: "Edições Anteriores", to: "/edicoes-anteriores" },
  { label: "Confira a Próxima Edição", to: "/proxima-edicao" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Logo />
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-xl font-bold text-brand-pink">Aviva Cultura</span>
            <span className="text-xs text-muted-foreground">Uma experiência cultural transformadora</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {menu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent/40 hover:text-brand-pink data-[status=active]:bg-brand-pink data-[status=active]:text-primary-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="rounded-md p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <div className={cn("md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 pb-4">
          {menu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-lg px-4 py-3 text-base font-medium text-foreground/80 hover:bg-accent/40 data-[status=active]:bg-brand-pink data-[status=active]:text-primary-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand-pink via-brand-orange to-brand-yellow shadow-md">
      <span className="font-display text-lg font-black text-white">A</span>
    </div>
  );
}
