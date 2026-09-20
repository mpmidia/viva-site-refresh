import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Redefinir senha — Festival Aviva Cultura" },
    { name: "description", content: "Redefinição de senha da área restrita do Festival Aviva Cultura." },
    { property: "og:title", content: "Redefinir senha — Festival Aviva Cultura" },
    { property: "og:description", content: "Redefinição de senha da área restrita do Festival Aviva Cultura." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: ResetPage,
});

function ResetPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Senha atualizada!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-pink/10 via-background to-brand-yellow/20 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-8 shadow-xl">
        <h1 className="font-display text-3xl text-brand-pink">Nova senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">Escolha uma nova senha para sua conta.</p>
        <label className="mt-6 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nova senha</span>
          <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                 className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20" />
        </label>
        <button disabled={loading} className="mt-6 w-full rounded-full bg-brand-pink px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
