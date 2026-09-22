import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, fetchCities, type RegistrationCity } from "@/lib/site-content";
import { FORM_BUCKET, signPaths } from "@/lib/storage";
import { Card, ghostBtn, inputCls, primaryBtn } from "./ui";

type Registration = {
  id: string; created_at: string; nome_artistico: string; responsavel: string; cpf: string; email: string;
  whatsapp: string; cidade: string; forma_cache: string; categoria: string; titulo_trabalho: string;
  descricao_trabalho: string; fotos: string[]; video_url: string | null; redes_sociais: string | null;
  duracao_minutos: number | null; classificacao: string; oficina_titulo: string | null; oficina_descricao: string | null;
  oficina_faixas: string[]; oficina_participantes: number | null; oficina_materiais: string | null;
};

export function RegistrationsPanel() {
  const [items, setItems] = useState<Registration[]>([]);
  const [open, setOpen] = useState<Registration | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [cities, setCities] = useState<RegistrationCity[]>([]);
  const [novaCidade, setNovaCidade] = useState("");

  const load = async () => {
    const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as Registration[]);
    setCities(await fetchCities());
  };
  useEffect(() => { void load(); }, []);

  const openDetails = async (item: Registration) => {
    setOpen(item);
    setPhotoUrls(await signPaths(FORM_BUCKET, item.fotos ?? []));
  };

  const addCity = async () => {
    if (!novaCidade.trim()) return;
    const { error } = await supabase.from("registration_cities").insert({ nome: novaCidade.trim(), ordem: cities.length + 1 });
    if (error) return toast.error(error.message);
    setNovaCidade("");
    await load();
  };

  const renameCity = async (id: string, nome: string) => {
    const { error } = await supabase.from("registration_cities").update({ nome }).eq("id", id);
    if (error) toast.error(error.message);
  };

  const removeCity = async (id: string) => {
    const { error } = await supabase.from("registration_cities").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Inscrições</h2>
        <p className="text-sm text-muted-foreground">Inscrições recebidas pelo formulário do site e configuração das cidades disponíveis.</p>
      </div>

      <Card title="Cidades do formulário" description="As alterações aparecem imediatamente na lista de cidades do formulário.">
        <div className="space-y-2">
          {cities.map((city) => (
            <div key={city.id} className="flex items-center gap-2">
              <input defaultValue={city.nome} onBlur={(e) => void renameCity(city.id, e.target.value)} className={inputCls} />
              <button onClick={() => void removeCity(city.id)} className="rounded-full border border-destructive/30 p-2 text-destructive"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={novaCidade} onChange={(e) => setNovaCidade(e.target.value)} placeholder="Nova cidade" className={inputCls} />
          <button onClick={() => void addCity()} className={ghostBtn}><Plus className="size-4" /></button>
        </div>
      </Card>

      <Card title="Categorias e valores">
        <ul className="space-y-2 text-sm text-foreground/80">{CATEGORIES.map((c) => <li key={c.id}>• {c.label}</li>)}</ul>
      </Card>

      <div>
        <h3 className="font-display text-xl">Inscrições recebidas ({items.length})</h3>
        {items.length === 0 ? (
          <p className="mt-3 rounded-3xl border border-dashed bg-card p-10 text-center text-muted-foreground">Nenhuma inscrição recebida ainda.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {items.map((item) => (
              <button key={item.id} onClick={() => void openDetails(item)} className="block w-full rounded-2xl border bg-card p-5 text-left hover:border-brand-pink">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-display text-lg">{item.nome_artistico}</h4>
                  <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-xs font-bold">Categoria {item.categoria}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.titulo_trabalho} · {item.cidade} · {new Date(item.created_at).toLocaleDateString("pt-BR")}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-card p-8">
            <h3 className="font-display text-2xl text-brand-pink">{open.nome_artistico}</h3>
            <dl className="mt-5 space-y-2 text-sm">
              <Row k="Responsável" v={open.responsavel} />
              <Row k="CPF" v={open.cpf} />
              <Row k="E-mail" v={open.email} />
              <Row k="WhatsApp" v={open.whatsapp} />
              <Row k="Cidade" v={open.cidade} />
              <Row k="Cachê" v={open.forma_cache} />
              <Row k="Categoria" v={open.categoria} />
              <Row k="Título" v={open.titulo_trabalho} />
              <Row k="Descrição" v={open.descricao_trabalho} />
              <Row k="Vídeo" v={open.video_url} />
              <Row k="Redes" v={open.redes_sociais} />
              <Row k="Duração (min)" v={open.duracao_minutos?.toString() ?? null} />
              <Row k="Classificação" v={open.classificacao} />
              <Row k="Oficina" v={open.oficina_titulo} />
              <Row k="Sobre a oficina" v={open.oficina_descricao} />
              <Row k="Faixas etárias" v={(open.oficina_faixas ?? []).join(", ") || null} />
              <Row k="Participantes" v={open.oficina_participantes?.toString() ?? null} />
              <Row k="Materiais" v={open.oficina_materiais} />
            </dl>
            {(open.fotos ?? []).length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {open.fotos.map((p) => photoUrls[p] && <img key={p} src={photoUrls[p]} alt="Foto enviada na inscrição" className="aspect-square w-full rounded-xl object-cover" />)}
              </div>
            )}
            <button onClick={() => setOpen(null)} className={primaryBtn + " mt-6"}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | null }) {
  if (!v) return null;
  return (
    <div className="grid gap-1 border-b pb-2 md:grid-cols-[180px_1fr]">
      <dt className="text-xs font-semibold uppercase text-muted-foreground">{k}</dt>
      <dd className="whitespace-pre-wrap">{v}</dd>
    </div>
  );
}
