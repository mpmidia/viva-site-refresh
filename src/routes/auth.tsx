import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Acessar painel — Aviva Cultura" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "forgot";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo!");
        navigate({ to: "/dashboard" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { nome, telefone },
          },
        });
        if (error) throw error;
        // save phone in profile after signup (profile is auto-created)
        toast.success("Conta criada! Você já pode entrar.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Enviamos um e-mail para redefinir sua senha.");
        setMode("login");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-pink/10 via-background to-brand-yellow/20 px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-xl">
        <Link to="/" className="text-sm text-muted-foreground hover:text-brand-pink">← Voltar ao site</Link>
        <h1 className="mt-4 font-display text-3xl text-brand-pink">
          {mode === "login" ? "Acessar painel" : mode === "signup" ? "Criar conta" : "Recuperar senha"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login" && "Entre com seu e-mail e senha."}
          {mode === "signup" && "Cadastre-se para gerenciar as edições."}
          {mode === "forgot" && "Enviaremos um link para redefinir sua senha."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <>
              <Field label="Nome">
                <input required value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Telefone">
                <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className={inputCls} />
              </Field>
            </>
          )}
          <Field label="E-mail">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </Field>
          {mode !== "forgot" && (
            <Field label="Senha">
              <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            </Field>
          )}

          <button
            disabled={loading}
            className="mt-2 w-full rounded-full bg-brand-pink px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : mode === "signup" ? "Cadastrar" : "Enviar link"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center text-sm">
          {mode !== "login" && <button onClick={() => setMode("login")} className="text-brand-purple hover:underline">Já tenho conta — entrar</button>}
          {mode === "login" && <>
            <button onClick={() => setMode("forgot")} className="text-brand-purple hover:underline">Esqueci minha senha</button>
            <button onClick={() => setMode("signup")} className="text-muted-foreground hover:text-brand-pink">Criar nova conta</button>
          </>}
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
