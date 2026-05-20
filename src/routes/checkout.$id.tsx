import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/checkout/$id")({ component: Checkout });

function Checkout() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    const [{ data: o }, { data: p }] = await Promise.all([
      supabase.from("orders").select("*").eq("id", id).maybeSingle(),
      supabase.from("payments").select("*").eq("order_id", id).maybeSingle(),
    ]);
    setOrder(o); setPayment(p); setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  // realtime listen for payment status
  useEffect(() => {
    const ch = supabase
      .channel(`pay:${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments", filter: `order_id=eq.${id}` }, (p) => {
        setPayment(p.new);
        if ((p.new as any)?.status === "approved") {
          toast.success("Pagamento aprovado! 🎉");
          setTimeout(() => nav({ to: "/dashboard/orders" }), 1500);
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, (p) => setOrder(p.new))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, nav]);

  const generatePix = async () => {
    if (!order) return;
    setGenerating(true);
    // Simulated PIX (VexoPay integration would be a server fn). Insert payment row directly.
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136systembux-${id}-${Math.random().toString(36).slice(2,8)}5204000053039865802BR5910SystemBux6009Sao Paulo62070503***6304ABCD`;
    const { data, error } = await supabase.from("payments").insert({
      order_id: id, user_id: order.user_id, provider: "vexopay",
      amount: order.total_amount, status: "pending",
      pix_qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`,
      pix_copy_paste: pixCode, expires_at: expires,
    }).select().single();
    setGenerating(false);
    if (error) return toast.error(error.message);
    setPayment(data);
  };

  if (loading) return <div className="container mx-auto px-4 py-20 text-center"><Loader2 className="animate-spin mx-auto"/></div>;
  if (!order) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Pedido não encontrado</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">Pedido #{order.order_number}</div>
      <h1 className="text-3xl font-bold mt-1">Checkout PIX</h1>

      <div className="grid md:grid-cols-2 gap-5 mt-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 shadow-premium">
          <h3 className="font-semibold">Resumo</h3>
          <div className="mt-4 space-y-2 text-sm">
            <Row k="Produto" v={order.product_name}/>
            {order.roblox_nick && <Row k="Nick" v={order.roblox_nick}/>}
            {order.robux_amount && <Row k="Robux" v={order.robux_amount.toLocaleString("pt-BR")}/>}
            <div className="border-t my-3"/>
            <Row k="Total" v={<span className="text-2xl font-black text-gradient">{brl(order.total_amount)}</span>}/>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-strong rounded-3xl p-6 shadow-premium">
          {payment?.status === "approved" ? (
            <div className="text-center py-6">
              <CheckCircle2 className="mx-auto text-success" size={64}/>
              <div className="text-xl font-bold mt-3">Pagamento aprovado!</div>
              <p className="text-sm text-muted-foreground mt-1">Seu pedido está sendo processado.</p>
            </div>
          ) : payment ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Pague com PIX</h3>
                <span className="inline-flex items-center gap-1 text-xs text-warning"><Clock size={12}/> 15 min</span>
              </div>
              <div className="grid place-items-center mt-4">
                <img src={payment.pix_qr_code} alt="QR" className="rounded-xl bg-white p-3 w-56 h-56"/>
              </div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-1">PIX Copia e Cola</div>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs glass rounded-lg p-2 truncate">{payment.pix_copy_paste}</code>
                  <Button size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(payment.pix_copy_paste); toast.success("Copiado!"); }}>
                    <Copy size={15}/>
                  </Button>
                </div>
              </div>
              <div className="mt-5 text-center text-xs text-muted-foreground flex items-center gap-2 justify-center">
                <Loader2 className="animate-spin" size={14}/> Aguardando pagamento...
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">Gere o código PIX para pagar.</p>
              <Button onClick={generatePix} disabled={generating} className="bg-gradient-hero shadow-glow">
                {generating ? "Gerando..." : "Gerar PIX"}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}
