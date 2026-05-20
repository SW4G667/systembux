import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { brl, relative } from "@/lib/format";
import { AdminBadge } from "@/components/AdminBadge";
import { Coins, TrendingUp, Gift, Users, ShoppingBag, Award, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user, profile, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10).then(({ data }) => setOrders(data || []));
  }, [user?.id]);

  if (loading || !profile) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Carregando...</div>;

  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${profile.affiliate_code}`;

  return (
    <div className="container mx-auto px-4 py-10">
      {/* HEADER */}
      <div className="glass-strong rounded-3xl p-6 shadow-premium relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"/>
        <div className="relative flex flex-wrap items-center gap-5">
          <img src={profile.avatar_url || ""} className="w-20 h-20 rounded-2xl object-cover bg-secondary ring-2 ring-primary/40"/>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
              {isAdmin && <AdminBadge size={14}/>}
              <span className="px-2 py-0.5 rounded-md bg-gradient-gold text-yellow-950 text-xs font-bold uppercase">{profile.vip_tier}</span>
            </div>
            <div className="text-sm text-muted-foreground">@{profile.username} · {profile.email}</div>
          </div>
          {isAdmin && <Link to="/admin"><Button variant="outline">Painel Admin</Button></Link>}
        </div>
      </div>

      {/* STATS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard icon={Coins} label="Pontos" value={profile.points} color="primary"/>
        <StatCard icon={Gift} label="Cashback" value={brl(profile.cashback_balance)} color="accent"/>
        <StatCard icon={ShoppingBag} label="Total gasto" value={brl(profile.total_spent)} color="success"/>
        <StatCard icon={Award} label="VIP" value={profile.vip_tier} color="warning"/>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        {/* AFFILIATE */}
        <div className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2"><Users className="text-primary"/><h3 className="font-semibold">Programa de Afiliados</h3></div>
          <p className="text-sm text-muted-foreground mt-2">Convide amigos e ganhe pontos a cada compra.</p>
          <div className="mt-4 rounded-xl glass p-3">
            <div className="text-[10px] uppercase text-muted-foreground">Seu código</div>
            <div className="font-mono font-bold text-lg text-gradient">{profile.affiliate_code}</div>
          </div>
          <div className="mt-3 flex gap-2">
            <input readOnly value={inviteUrl} className="flex-1 h-10 px-3 rounded-lg bg-secondary text-xs"/>
            <Button size="icon" onClick={() => { navigator.clipboard.writeText(inviteUrl); toast.success("Link copiado!"); }}><Copy size={15}/></Button>
          </div>
        </div>

        {/* ORDERS */}
        <div className="lg:col-span-2 glass-strong rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><TrendingUp className="text-primary"/><h3 className="font-semibold">Pedidos recentes</h3></div>
          </div>
          <div className="mt-4 divide-y divide-border/40">
            {orders.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">Nenhum pedido ainda. <Link to="/robux" className="text-primary">Comprar Robux →</Link></div>
            ) : orders.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{o.product_name}</div>
                  <div className="text-xs text-muted-foreground">#{o.order_number} · {relative(o.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{brl(o.total_amount)}</div>
                  <StatusPill status={o.status}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl grid place-items-center bg-${color}/20`}>
          <Icon className={`text-${color}`} size={18}/>
        </div>
      </div>
      <div className="text-2xl font-black mt-3 capitalize">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-warning/20 text-warning", paid: "bg-primary/20 text-primary",
    processing: "bg-accent/20 text-accent", delivered: "bg-success/20 text-success",
    cancelled: "bg-destructive/20 text-destructive", refunded: "bg-muted text-muted-foreground",
  };
  return <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${map[status] || ""}`}>{status}</span>;
}
