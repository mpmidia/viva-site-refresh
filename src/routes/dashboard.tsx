import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, MapPin, Users, Pencil, Trash2, Plus, LogOut, User as UserIcon, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchEditions, type Edition } from "@/lib/editions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Painel — Aviva Cultura" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

type Tab = "editions" | "profile";

function DashboardPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("editions");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  if (!isAdmin) return (
    <div className="mx-auto max-w-md p-8 text-center">
      <h1 className="font-display text-2xl">Acesso restrito</h1>
      <p className="mt-2 text-muted-foreground">Sua conta não tem permissão de administrador.</p>
      <button onClick={() => supabase.auth.signOut()} className="mt-4 rounded-full bg-brand-pink px-5 py-2 text-sm font-semibold text-primary-foreground">Sair</button>
    </div>
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-brand-cream/50">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-brand-pink"><ArrowLeft className="inline size-4" /> Site</Link>
            <span className="text-muted-foreground">|</span>
            <h1 className="font-display text-xl text-brand-pink">Painel Aviva Cultura</h1>
          </div>
          <button onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-accent/40">
            <LogOut className="size-4" /> Sair
          </button>
        </div>
        <div className="mx-auto flex max-w-6xl gap-2 px-4 pb-3">
          <TabButton active={tab === "editions"} onClick={() => setTab("editions")}>Edições</TabButton>
          <TabButton active={tab === "profile"} onClick={() => setTab("profile")}><UserIcon className="mr-1 inline size-4" />Perfil</TabButton>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === "editions" ? <EditionsPanel /> : <ProfilePanel userId={user.id} email={user.email ?? ""} />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-brand-pink text-primary-foreground" : "text-foreground/70 hover:bg-accent/40"}`}>
      {children}
    </button>
  );
}

/* --- Editions --- */

const emptyEdition: Omit<Edition, "id" | "created_at" | "updated_at"> = {
  titulo: "", data: new Date().toISOString().slice(0, 10), local: "", participantes: 0,
  descricao: "", inscricao_url: "", imagem_url: "",
};

function EditionsPanel() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Edition | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    fetchEditions().then((d) => { setEditions(d); setLoading(false); }).catch((e) => toast.error(e.message));
  };
  useEffect(load, []);

  const onDelete = async (id: string) => {
    if (!confirm("Excluir esta edição?")) return;
    const { error } = await supabase.from("editions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Edição excluída.");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">Edições</h2>
          <p className="text-sm text-muted-foreground">A edição com a data mais recente vira automaticamente a home.</p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90">
          <Plus className="size-4" /> Nova edição
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-muted-foreground">Carregando edições...</p>
      ) : editions.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed bg-card p-10 text-center">
          <p className="text-muted-foreground">Nenhuma edição cadastrada ainda. Clique em "Nova edição" para começar.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {editions.map((e, i) => (
            <div key={e.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {i === 0 && <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-xs font-bold text-foreground">EDIÇÃO ATUAL</span>}
                    <h3 className="font-display text-xl">{e.titulo}</h3>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarDays className="size-4" />{new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                    <span className="flex items-center gap-1"><MapPin className="size-4" />{e.local}</span>
                    <span className="flex items-center gap-1"><Users className="size-4" />{e.participantes}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{e.descricao}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(e)} className="rounded-full border p-2 hover:bg-accent/40"><Pencil className="size-4" /></button>
                  <button onClick={() => onDelete(e.id)} className="rounded-full border border-destructive/30 p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <EditionForm
          initial={editing ?? { ...emptyEdition, id: "", created_at: "", updated_at: "" }}
          isNew={creating}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function EditionForm({ initial, isNew, onClose, onSaved }: { initial: Edition; isNew: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof Edition>(k: K, v: Edition[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      titulo: form.titulo,
      data: form.data,
      local: form.local,
      participantes: form.participantes,
      descricao: form.descricao,
      inscricao_url: form.inscricao_url || null,
      imagem_url: form.imagem_url || null,
    };
    const q = isNew
      ? supabase.from("editions").insert(payload)
      : supabase.from("editions").update(payload).eq("id", form.id);
    const { error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isNew ? "Edição criada!" : "Edição atualizada!");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-card p-8 shadow-2xl">
        <h3 className="font-display text-2xl text-brand-pink">{isNew ? "Nova edição" : "Editar edição"}</h3>
        <div className="mt-6 grid gap-4">
          <FField label="Título"><input required value={form.titulo} onChange={(e) => update("titulo", e.target.value)} className={inputCls} /></FField>
          <div className="grid gap-4 md:grid-cols-2">
            <FField label="Data"><input required type="date" value={form.data} onChange={(e) => update("data", e.target.value)} className={inputCls} /></FField>
            <FField label="Nº de participantes"><input required type="number" min={0} value={form.participantes} onChange={(e) => update("participantes", parseInt(e.target.value) || 0)} className={inputCls} /></FField>
          </div>
          <FField label="Local"><input required value={form.local} onChange={(e) => update("local", e.target.value)} className={inputCls} /></FField>
          <FField label="Descritivo"><textarea required rows={5} value={form.descricao} onChange={(e) => update("descricao", e.target.value)} className={inputCls} /></FField>
          <FField label="URL do botão de inscrição"><input type="url" placeholder="https://..." value={form.inscricao_url ?? ""} onChange={(e) => update("inscricao_url", e.target.value)} className={inputCls} /></FField>
          <FField label="URL da imagem de capa (opcional)"><input type="url" placeholder="https://..." value={form.imagem_url ?? ""} onChange={(e) => update("imagem_url", e.target.value)} className={inputCls} /></FField>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border px-5 py-2.5 text-sm font-semibold">Cancelar</button>
          <button disabled={saving} className="rounded-full bg-brand-pink px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* --- Profile --- */

function ProfilePanel({ userId, email }: { userId: string; email: string }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profiles").select("nome, telefone").eq("id", userId).maybeSingle()
      .then(({ data }) => {
        setNome(data?.nome ?? "");
        setTelefone(data?.telefone ?? "");
        setLoading(false);
      });
  }, [userId]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: userId, email, nome, telefone });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado!");
  };

  const savePassword = async () => {
    if (!password || password.length < 6) return toast.error("A senha deve ter ao menos 6 caracteres.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada!");
    setPassword("");
  };

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={saveProfile} className="rounded-3xl border bg-card p-6">
        <h2 className="font-display text-xl">Meus dados</h2>
        <div className="mt-4 space-y-4">
          <FField label="Nome"><input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} /></FField>
          <FField label="E-mail"><input value={email} disabled className={inputCls + " opacity-60"} /></FField>
          <FField label="Telefone"><input value={telefone} onChange={(e) => setTelefone(e.target.value)} className={inputCls} /></FField>
        </div>
        <button disabled={saving} className="mt-5 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">Salvar dados</button>
      </form>

      <div className="rounded-3xl border bg-card p-6">
        <h2 className="font-display text-xl">Alterar senha</h2>
        <div className="mt-4 space-y-4">
          <FField label="Nova senha"><input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} /></FField>
        </div>
        <button onClick={savePassword} className="mt-5 rounded-full bg-brand-purple px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Atualizar senha</button>
        <p className="mt-4 text-xs text-muted-foreground">Também é possível recuperar a senha pela tela de login usando "Esqueci minha senha".</p>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20";

function FField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
