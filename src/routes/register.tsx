import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const site = useSiteSettings();
  const nav = useNavigate();
  const [username, setU] = useState(""); const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) return toast.error("Senha mínima de 6 caracteres");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password: pw,
      options: { emailRedirectTo: window.location.origin, data: { username } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Verifique seu email."); nav({ to: "/login" });
  };
  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-premium">
        <div className="text-center"><Logo size={40} name={site.name}/></div>
        <h1 className="text-2xl font-bold text-center mt-6">Criar conta grátis</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">Ganhe 50 pontos de boas-vindas</p>
        <form onSubmit={submit} className="space-y-3 mt-6">
          <Input placeholder="Nome de usuário" value={username} onChange={(e) => setU(e.target.value)} required className="h-11"/>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11"/>
          <Input type="password" placeholder="Senha (mín 6)" value={pw} onChange={(e) => setPw(e.target.value)} required className="h-11"/>
          <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-hero shadow-glow">{loading ? "Criando..." : "Criar conta"}</Button>
        </form>
        <p className="text-sm text-center text-muted-foreground mt-5">
          Já tem conta? <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
