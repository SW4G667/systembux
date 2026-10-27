import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Coins, AlertTriangle, ArrowRight } from "lucide-react";
import { brl, robuxToBRL } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/robux")({ component: RobuxPage });

function RobuxPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [amount, setAmount] = useState(1000);
  const [nick, setNick] = useState("");
  const [gp, setGp] = useState("");
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => robuxToBRL(amount), [amount]);
  const valid = Number.isInteger(amount) && amount >= 150 && amount <= 10000 && /^[A-Za-z0-9_]{3,20}$/.test(nick.trim()) && /^https:\/\/(?:www\.)?roblox\.com\/(?:[a-z]{2}\/)?game-pass\/\d+(?:\/[^\s]*)?$/i.test(gp.trim());

  const buy = async () => {
    if (!user) { toast.error("Faça login para comprar"); nav({ to: "/login" }); return; }
    if (!valid) return toast.error("Verifique os campos");
    setLoading(true);
    const { data, error } = await supabase.from("tickets").insert({
      user_id: user.id, subject: `Cotação de ${amount.toLocaleString("pt-BR")} Robux`,
    }).select("id").single();
    if (!error && data) {
      const message = `Quantidade: ${amount.toLocaleString("pt-BR")} Robux\nNick Roblox: ${nick.trim()}\nGame Pass: ${gp.trim()}\nEstimativa exibida: ${brl(total)}. Confirmar disponibilidade, preço final e pagamento com a equipe.`;
      const result = await supabase.from("ticket_messages").insert({ ticket_id: data.id, user_id: user.id, is_admin: false, message });
      if (result.error) {
        setLoading(false);
        toast.error("O atendimento foi aberto, mas os detalhes não foram enviados. Informe o nick e a Game Pass no ticket.");
        nav({ to: "/support" });
        return;
      }
    }
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Solicitação enviada. Acompanhe o atendimento na sua conta.");
    nav({ to: "/support" });
  };

  return (
    <div className="container mx-auto px-4 py-10 lg:py-16">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <div className="glass-strong rounded-3xl p-8 shadow-premium">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-hero grid place-items-center shadow-glow"><Coins className="text-white"/></div>
            <div>
              <h1 className="text-2xl font-bold">Cotação de Robux</h1>
              <p className="text-sm text-muted-foreground">Estimativa de R$3,80 por 100 Robux · mínimo 150</p>
            </div>
          </div>

          <div className="mt-8">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Quantidade de Robux</label>
            <div className="mt-3 flex items-center gap-4">
              <Input type="number" min={150} value={amount} onChange={(e) => setAmount(Math.max(0, +e.target.value))} className="h-14 text-2xl font-bold w-48"/>
              <div className="flex-1">
                <Slider value={[amount]} min={150} max={10000} step={50} onValueChange={(v) => setAmount(v[0])}/>
                <div className="flex justify-between text-[11px] text-muted-foreground mt-2"><span>150</span><span>10.000</span></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {[150, 500, 1000, 2500, 5000, 10000].map((v) => (
                <button key={v} onClick={() => setAmount(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${amount===v ? "bg-gradient-hero text-white border-transparent shadow-glow" : "glass hover:bg-secondary"}`}>
                  {v.toLocaleString("pt-BR")}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Nick Roblox</label>
              <Input placeholder="seu_nick" value={nick} onChange={(e) => setNick(e.target.value)} className="h-11 mt-2"/>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Link da Gamepass</label>
              <Input placeholder="https://www.roblox.com/game-pass/..." value={gp} onChange={(e) => setGp(e.target.value)} className="h-11 mt-2"/>
            </div>
          </div>

          <div className="mt-5 flex gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
            <AlertTriangle className="text-warning shrink-0" size={20}/>
            <div className="text-sm">
              <strong>Antes de solicitar:</strong> desative <em>preços regionais</em> da Game Pass. A equipe confirmará disponibilidade, preço final e forma de pagamento no atendimento.
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-8 shadow-premium h-fit lg:sticky lg:top-24">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Prévia da cotação</div>
          <div className="mt-3 flex justify-between"><span>Robux</span><strong>{amount.toLocaleString("pt-BR")}</strong></div>
          <div className="mt-2 flex justify-between text-sm text-muted-foreground"><span>Preço unitário</span><span>R$ 3,80 / 100</span></div>
          <div className="my-5 border-t"/>
          <div className="flex justify-between items-end">
            <span className="text-muted-foreground">Valor estimado</span>
            <span className="text-3xl font-black text-gradient">{brl(total)}</span>
          </div>
          <Button onClick={buy} disabled={!valid || loading} className="w-full h-12 mt-6 bg-gradient-hero shadow-glow text-base">
            {loading ? "Abrindo atendimento..." : <>Solicitar cotação <ArrowRight className="ml-1" size={18}/></>}
          </Button>
          <div className="text-[11px] text-muted-foreground text-center mt-3">Esta etapa não cria pedido nem cobrança.</div>
        </div>
      </div>
    </div>
  );
}
