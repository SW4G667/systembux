import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { brl, relative } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Users, ShoppingBag, DollarSign, Megaphone, Package } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0, pending: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [announce, setAnnounce] = useState({ title: "", body: "" });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) { toast.error("Acesso restrito"); nav({ to: "/" }); }
  }, [loading, user, isAdmin, nav]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [{ data: paid }, { count: oc }, { count: uc }, { count: pc }, { data: rec }] = await Promise.all([
        supabase.from("orders").select("total_amount").in("status", ["paid","delivered"]),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
      ]);
      setStats({
        revenue: (paid || []).reduce((a, b: any) => a + Number(b.total_amount), 0),
        orders: oc || 0, users: uc || 0, pending: pc || 0,
      });
      setRecent(rec || []);
    })();
  }, [isAdmin]);

  const updateStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === "delivered") patch.delivered_at = new Date().toISOString();
    if (status === "paid") patch.paid_at = new Date().toISOString();
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status atualizado");
    setRecent((r) => r.map((o) => o.id === id ? { ...o, status } : o));
  };

  const sendAnnouncement = async () => {
    if (!announce.title) return;
    const { error } = await supabase.from("announcements").insert({ title: announce.title, body: announce.body, variant: "promo" });
    if (error) return toast.error(error.message);
    toast.success("Anúncio publicado!"); setAnnounce({ title: "", body: "" });
  };

  if (loading || !isAdmin) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Verificando acesso...</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold font-semibold">Painel Administrativo</div>
          <h1 className="text-3xl font-bold mt-1">Dashboard</h1>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <AdminStat icon={DollarSign} label="Receita total" value={brl(stats.revenue)}/>
        <AdminStat icon={ShoppingBag} label="Pedidos" value={stats.orders}/>
        <AdminStat icon={Users} label="Usuários" value={stats.users}/>
        <AdminStat icon={Package} label="Pendentes" value={stats.pending}/>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5 mt-6">
        <div className="glass-strong rounded-3xl p-6">
          <h3 className="font-semibold mb-4">Pedidos recentes</h3>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground border-b">
                <tr><th className="text-left py-2">Pedido</th><th className="text-left">Produto</th><th>Valor</th><th>Status</th><th>Ação</th></tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b border-border/40">
                    <td className="py-3"><div className="font-mono text-xs">{o.order_number}</div><div className="text-[10px] text-muted-foreground">{relative(o.created_at)}</div></td>
                    <td>{o.product_name}</td>
                    <td className="text-center font-bold">{brl(o.total_amount)}</td>
                    <td className="text-center"><span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-secondary">{o.status}</span></td>
                    <td className="text-right">
                      <select onChange={(e) => updateStatus(o.id, e.target.value)} defaultValue={o.status} className="bg-secondary rounded px-2 py-1 text-xs">
                        {["pending","paid","processing","delivered","cancelled","refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4"><Megaphone className="text-primary"/><h3 className="font-semibold">Anúncio global</h3></div>
          <input placeholder="Título" value={announce.title} onChange={(e) => setAnnounce({...announce, title: e.target.value})} className="w-full h-10 px-3 rounded-lg bg-secondary mb-2"/>
          <textarea placeholder="Mensagem" value={announce.body} onChange={(e) => setAnnounce({...announce, body: e.target.value})} className="w-full h-24 px-3 py-2 rounded-lg bg-secondary text-sm"/>
          <Button onClick={sendAnnouncement} className="w-full mt-3 bg-gradient-hero shadow-glow">Publicar anúncio</Button>
        </div>
      </div>
    </div>
  );
}

function AdminStat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl bg-gradient-hero grid place-items-center shadow-glow"><Icon className="text-white" size={18}/></div>
      <div className="text-2xl font-black mt-3">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}
