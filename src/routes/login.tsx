import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const site = useSiteSettings();
  const nav = useNavigate();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo de volta!"); nav({ to: "/dashboard" });
  };
  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-premium">
        <div className="text-center"><Logo size={40} name={site.name}/></div>
        <h1 className="text-2xl font-bold text-center mt-6">Bem-vindo de volta</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">Entre para continuar comprando</p>
        <form onSubmit={submit} className="space-y-3 mt-6">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11"/>
          <Input type="password" placeholder="Senha" value={pw} onChange={(e) => setPw(e.target.value)} required className="h-11"/>
          <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-hero shadow-glow">{loading ? "Entrando..." : "Entrar"}</Button>
        </form>
        <p className="text-sm text-center text-muted-foreground mt-5">
          Não tem conta? <Link to="/register" className="text-primary font-medium hover:underline">Criar agora</Link>
        </p>
      </div>
    </div>
  );
}
