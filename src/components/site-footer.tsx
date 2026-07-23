import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-brand-purple text-white">
      <div className="absolute inset-0 opacity-10" aria-hidden>
        <div className="absolute -left-16 top-8 size-48 rounded-full bg-brand-pink blur-3xl" />
        <div className="absolute right-0 top-24 size-40 rounded-full bg-brand-yellow blur-3xl" />
      </div>
      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold">Aviva Cultura</p>
          <p className="mt-2 text-sm text-white/80">
            Uma mostra de artes que dá espaço aos artistas locais, incentivando e valorizando a criatividade através de ações culturais em espaços públicos.
          </p>
        </div>
        <div>
          <p className="mb-3 font-display text-lg font-semibold">Navegação</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-brand-yellow">Home</Link></li>
            <li><Link to="/o-festival" className="hover:text-brand-yellow">O Festival</Link></li>
            <li><Link to="/edicoes-anteriores" className="hover:text-brand-yellow">Edições Anteriores</Link></li>
            <li><Link to="/proxima-edicao" className="hover:text-brand-yellow">Confira a Próxima Edição</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-display text-lg font-semibold">Realização</p>
          <p className="text-sm text-white/80">
            Realizado pela ACRIART, instituição sem fins lucrativos que há mais de 10 anos acredita no poder da arte como agente de transformação sociocultural.
          </p>
        </div>
      </div>
      <div className="relative border-t border-white/15 py-4 text-center text-xs text-white/70">
        © {new Date().getFullYear()} Festival Aviva Cultura. Todos os direitos reservados.
      </div>
    </footer>
  );
}
