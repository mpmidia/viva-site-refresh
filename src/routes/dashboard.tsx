import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, User as UserIcon, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EditionsPanel } from "@/components/dashboard/editions-panel";
import { NextEditionPanel } from "@/components/dashboard/next-edition-panel";
import { ProgramPanel } from "@/components/dashboard/program-panel";
import { RegistrationsPanel } from "@/components/dashboard/registrations-panel";
import { ImagesPanel } from "@/components/dashboard/images-panel";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Painel da Equipe — Festival Aviva Cultura" },
    { name: "description", content: "Gerenciamento restrito das edições do Festival Aviva Cultura." },
    { property: "og:title", content: "Painel da Equipe — Festival Aviva Cultura" },
    { property: "og:description", content: "Gerenciamento restrito das edições do Festival Aviva Cultura." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: DashboardPage,
});

type Tab = "editions" | "next" | "program" | "registrations" | "images" | "profile";

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
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-3">
          <TabButton active={tab === "editions"} onClick={() => setTab("editions")}>Edições</TabButton>
          <TabButton active={tab === "next"} onClick={() => setTab("next")}>Próxima Edição</TabButton>
          <TabButton active={tab === "program"} onClick={() => setTab("program")}>Programação</TabButton>
          <TabButton active={tab === "registrations"} onClick={() => setTab("registrations")}>Inscrições</TabButton>
          <TabButton active={tab === "images"} onClick={() => setTab("images")}>Imagens</TabButton>
          <TabButton active={tab === "profile"} onClick={() => setTab("profile")}><UserIcon className="mr-1 inline size-4" />Perfil</TabButton>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === "editions" && <EditionsPanel />}
        {tab === "next" && <NextEditionPanel />}
        {tab === "program" && <ProgramPanel />}
        {tab === "registrations" && <RegistrationsPanel />}
        {tab === "images" && <ImagesPanel />}
        {tab === "profile" && <ProfilePanel userId={user.id} email={user.email ?? ""} />}
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
