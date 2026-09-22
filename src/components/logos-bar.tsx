export function LogosBar({ url }: { url: string | null | undefined }) {
  if (!url) return null;
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Realização e apoio</p>
        <img src={url} alt="Logos dos parceiros e apoiadores do Festival Aviva Cultura" className="mx-auto mt-6 w-full max-w-5xl object-contain md:mt-8" />
      </div>
    </section>
  );
}
