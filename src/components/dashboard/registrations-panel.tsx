import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchCategories,
  fetchCities,
  fetchNextEditions,
  fetchPaymentMethods,
  type NextEdition,
  type PaymentMethod,
  type RegistrationCategory,
  type RegistrationCity,
} from "@/lib/site-content";
import { FORM_BUCKET, signPaths } from "@/lib/storage";
import { Card, ghostBtn, inputCls, primaryBtn } from "./ui";

type Registration = {
  id: string; created_at: string; nome_artistico: string; responsavel: string; cpf: string; email: string;
  whatsapp: string; cidade: string; forma_cache: string; categoria: string; titulo_trabalho: string;
  descricao_trabalho: string; fotos: string[]; video_url: string | null; redes_sociais: string | null;
  duracao_minutos: number | null; classificacao: string; oficina_titulo: string | null; oficina_descricao: string | null;
  oficina_faixas: string[]; oficina_participantes: number | null; oficina_materiais: string | null;
  next_edition_id: string;
};

export function RegistrationsPanel() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Registration[]>([]);
  const [open, setOpen] = useState<Registration | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [cities, setCities] = useState<RegistrationCity[]>([]);
  const [categories, setCategories] = useState<RegistrationCategory[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [novaCidade, setNovaCidade] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [novaForma, setNovaForma] = useState("");
  const [editions, setEditions] = useState<NextEdition[]>([]);
  const [editionId, setEditionId] = useState("");

  const load = async (selectedId = editionId) => {
    const nextEditions = await fetchNextEditions();
    const activeId = selectedId || nextEditions[0]?.id || "";
    setEditions(nextEditions); setEditionId(activeId);
    if (!activeId) { setItems([]); setCities([]); setCategories([]); setPayments([]); return; }
    const { data, error } = await supabase.from("registrations").select("*").eq("next_edition_id", activeId).order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as Registration[]);
    const [c, cat, pay] = await Promise.all([fetchCities(activeId), fetchCategories(activeId), fetchPaymentMethods(activeId)]);
    setCities(c); setCategories(cat); setPayments(pay);
    await queryClient.invalidateQueries({ queryKey: ["registration-cities"] });
    await queryClient.invalidateQueries({ queryKey: ["registration-categories"] });
    await queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
  };
  useEffect(() => { void load(""); }, []);

  const openDetails = async (item: Registration) => {
    setOpen(item);
    setPhotoUrls(await signPaths(FORM_BUCKET, item.fotos ?? []));
  };

  /* Cidades */
  const addCity = async () => {
    if (!novaCidade.trim()) return;
    const { error } = await supabase.from("registration_cities").insert({ nome: novaCidade.trim(), ordem: cities.length + 1, next_edition_id: editionId });
    if (error) return toast.error(error.message);
    setNovaCidade("");
    await load();
  };
  const renameCity = async (id: string, nome: string) => {
    const { error } = await supabase.from("registration_cities").update({ nome }).eq("id", id);
    if (error) return toast.error(error.message);
    await load();
  };
  const removeCity = async (id: string) => {
    const { error } = await supabase.from("registration_cities").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await load();
  };

  /* Categorias */
  const addCategory = async () => {
    if (!novaCategoria.trim()) return;
    const valor = novoValor.trim() ? Number(novoValor.replace(",", ".")) : null;
    const { error } = await supabase.from("registration_categories").insert({ nome: novaCategoria.trim(), valor, ordem: categories.length + 1, next_edition_id: editionId });
    if (error) return toast.error(error.message);
    setNovaCategoria(""); setNovoValor("");
    await load();
  };
  const updateCategory = async (id: string, patch: { nome?: string; valor?: number | null }) => {
    const { error } = await supabase.from("registration_categories").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    await load();
  };
  const removeCategory = async (id: string) => {
    if (!confirm("Excluir esta categoria?")) return;
    const { error } = await supabase.from("registration_categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await load();
  };

  /* Formas de recebimento do cachê */
  const addPayment = async () => {
    if (!novaForma.trim()) return;
    const { error } = await supabase.from("payment_methods").insert({ nome: novaForma.trim(), ativo: true, ordem: payments.length + 1, next_edition_id: editionId });
    if (error) return toast.error(error.message);
    setNovaForma("");
    await load();
  };
  const togglePayment = async (id: string, ativo: boolean) => {
    const { error } = await supabase.from("payment_methods").update({ ativo }).eq("id", id);
    if (error) return toast.error(error.message);
    await load();
  };
  const removePayment = async (id: string) => {
    const { error } = await supabase.from("payment_methods").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Inscrições</h2>
        <p className="text-sm text-muted-foreground">Configuração do formulário e inscrições recebidas pelo site.</p>
      </div>

      <label className="block max-w-md">
        <span className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Edição das inscrições</span>
        <select value={editionId} onChange={(e) => void load(e.target.value)} className={inputCls}>
          <option value="">Selecione uma edição</option>
          {editions.map((edition) => <option key={edition.id} value={edition.id}>{edition.cidade || "Edição sem cidade"}</option>)}
        </select>
      </label>

      <Card title="Cidades do formulário" description="As alterações aparecem imediatamente na lista de cidades do formulário.">
        <div className="space-y-2">
          {cities.map((city) => (
            <div key={city.id} className="flex items-center gap-2">
              <input defaultValue={city.nome} onBlur={(e) => { if (e.target.value !== city.nome) void renameCity(city.id, e.target.value); }} className={inputCls} />
              <button onClick={() => void removeCity(city.id)} className="rounded-full border border-destructive/30 p-2 text-destructive"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={novaCidade} onChange={(e) => setNovaCidade(e.target.value)} placeholder="Nova cidade" className={inputCls} />
          <button onClick={() => void addCity()} className={ghostBtn}><Plus className="size-4" /></button>
        </div>
      </Card>

      <Card title="Categorias e valores" description="Aparecem como opções de categoria no formulário público de inscrição.">
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-wrap items-center gap-2">
              <input defaultValue={cat.nome} onBlur={(e) => { if (e.target.value !== cat.nome) void updateCategory(cat.id, { nome: e.target.value }); }} className={inputCls + " min-w-[200px] flex-1"} />
              <input
                defaultValue={cat.valor ?? ""}
                type="number"
                step="0.01"
                placeholder="Valor"
                onBlur={(e) => { const v = e.target.value.trim() ? Number(e.target.value) : null; if (v !== cat.valor) void updateCategory(cat.id, { valor: v }); }}
                className={inputCls + " w-36"}
              />
              <button onClick={() => void removeCategory(cat.id)} className="rounded-full border border-destructive/30 p-2 text-destructive"><Trash2 className="size-4" /></button>
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} placeholder="Nova categoria" className={inputCls + " min-w-[200px] flex-1"} />
          <input value={novoValor} onChange={(e) => setNovoValor(e.target.value)} type="number" step="0.01" placeholder="Valor" className={inputCls + " w-36"} />
          <button onClick={() => void addCategory()} className={ghostBtn}><Plus className="size-4" /></button>
        </div>
      </Card>

      <Card title="Formas de recebimento do cachê" description="Marque as opções aceitas para responder como o artista pretende receber o cachê.">
        <div className="space-y-2">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2 rounded-2xl border px-4 py-2">
              <label className="flex items-center gap-3 text-sm font-semibold">
                <input type="checkbox" checked={p.ativo} onChange={(e) => void togglePayment(p.id, e.target.checked)} /> {p.nome}
              </label>
              <button onClick={() => void removePayment(p.id)} className="rounded-full border border-destructive/30 p-2 text-destructive"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={novaForma} onChange={(e) => setNovaForma(e.target.value)} placeholder="Nova forma de recebimento" className={inputCls} />
          <button onClick={() => void addPayment()} className={ghostBtn}><Plus className="size-4" /></button>
        </div>
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
                  <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-xs font-bold">{item.categoria}</span>
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
