import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { brl } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/checkout/$id")({ component: Checkout });
type Order = Database["public"]["Tables"]["orders"]["Row"];
type Payment = Database["public"]["Tables"]["payments"]["Row"];

function Checkout() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = async () => {
    const [{ data: o, error: orderError }, { data: p, error: paymentError }] = await Promise.all([
      supabase.from("orders").select("*").eq("id", id).maybeSingle(),
      supabase.from("payments").select("*").eq("order_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setLoadError(Boolean(orderError || paymentError));
    setOrder(o); setPayment(p); setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  // realtime listen for payment status
  useEffect(() => {
    const ch = supabase
      .channel(`pay:${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments", filter: `order_id=eq.${id}` }, (p) => {
        const nextPayment = p.new as Payment;
        setPayment(nextPayment);
        if (nextPayment?.status === "approved" && nextPayment?.provider_payment_id) {
          toast.success("Pagamento aprovado! 🎉");
          setTimeout(() => nav({ to: "/dashboard" }), 1500);
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, (p) => setOrder(p.new as Order))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, nav]);

  if (loading) return <div className="container mx-auto px-4 py-20 text-center"><Loader2 className="animate-spin mx-auto"/></div>;
  if (loadError) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Não foi possível carregar o pedido. Atualize a página ou fale com o suporte.</div>;
  if (!order) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Pedido não encontrado</div>;
  const verifiedPayment = Boolean(payment?.provider_payment_id);

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
          {verifiedPayment && payment?.status === "approved" ? (
            <div className="text-center py-6">
              <CheckCircle2 className="mx-auto text-success" size={64}/>
              <div className="text-xl font-bold mt-3">Pagamento aprovado!</div>
              <p className="text-sm text-muted-foreground mt-1">Seu pedido está sendo processado.</p>
            </div>
          ) : verifiedPayment && payment?.pix_copy_paste ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Pague com PIX</h3>
                <span className="inline-flex items-center gap-1 text-xs text-warning"><Clock size={12}/> {payment.expires_at ? new Date(payment.expires_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Aguardando"}</span>
              </div>
              <div className="grid place-items-center mt-4">
                {payment.pix_qr_code && <img src={payment.pix_qr_code} alt="QR Code PIX" className="rounded-xl bg-white p-3 w-56 h-56"/>}
              </div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-1">PIX Copia e Cola</div>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs glass rounded-lg p-2 truncate">{payment.pix_copy_paste}</code>
                  <Button size="icon" variant="outline" onClick={() => { if (payment.pix_copy_paste) { navigator.clipboard.writeText(payment.pix_copy_paste); toast.success("Copiado!"); } }}>
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
              <h3 className="font-semibold">Pagamento pelo site indisponível</h3>
              <p className="text-sm text-muted-foreground my-4">Ainda não há um gateway PIX conectado a este checkout. Nenhuma cobrança foi gerada. Nossa equipe pode orientar você sobre este pedido.</p>
              <Link to="/support"><Button className="bg-gradient-hero shadow-glow">Falar com suporte</Button></Link>
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
