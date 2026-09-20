import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import logoUrl from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer id="contato" className="bg-brand-purple text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.2fr_.8fr_.8fr] md:px-8 md:py-20">
        <div><img src={logoUrl} alt="Festival Aviva Cultura" className="h-16 w-auto" /><p className="mt-6 max-w-md text-lg leading-relaxed text-primary-foreground/70">Uma mostra de artes que dá espaço aos artistas locais e transforma espaços públicos através da cultura.</p></div>
        <div><p className="font-display text-lg uppercase text-brand-yellow">Navegação</p><ul className="mt-5 space-y-3 text-sm font-bold uppercase"><li><Link to="/">Início</Link></li><li><Link to="/o-festival">O Festival</Link></li><li><Link to="/edicoes-anteriores">Edições anteriores</Link></li><li><Link to="/patrocinio">Patrocínio</Link></li><li><Link to="/contato">Contato</Link></li></ul></div>
        <div><p className="font-display text-lg uppercase text-brand-yellow">Realização</p><p className="mt-5 text-primary-foreground/70">Realizado pela ACRIART, instituição sem fins lucrativos que há mais de 10 anos acredita no poder da arte como agente de transformação sociocultural.</p><Link to="/dashboard" className="mt-7 inline-flex items-center gap-2 border border-primary-foreground/35 px-4 py-3 text-xs font-bold uppercase transition hover:bg-brand-yellow hover:text-foreground">Área da Equipe <ArrowUpRight className="size-4" /></Link></div>
      </div>
      <div className="border-t border-primary-foreground/15 px-5 py-5 text-center text-xs text-primary-foreground/55">© {new Date().getFullYear()} Festival Aviva Cultura. Todos os direitos reservados.</div>
    </footer>
  );
}