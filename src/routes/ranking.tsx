import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";
import { Trophy } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/ranking")({ component: Ranking });

function Ranking() {
  const site = useSiteSettings();
  const [top, setTop] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("profiles").select("username, avatar_url, total_spent, vip_tier, points").order("total_spent", { ascending: false }).limit(20).then(({ data }) => setTop(data || []));
  }, []);
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-gold grid place-items-center shadow-gold"><Trophy className="text-yellow-950"/></div>
        <h1 className="text-3xl lg:text-4xl font-bold mt-3">Ranking de Clientes</h1>
        <p className="text-muted-foreground mt-1">Top compradores de {site.name}</p>
      </div>
      <div className="mt-8 glass-strong rounded-3xl p-3 shadow-premium">
        {top.map((u, i) => (
          <div key={u.username} className={`flex items-center gap-3 p-3 rounded-2xl ${i<3?"bg-gradient-hero/10":""}`}>
            <div className={`w-10 h-10 rounded-xl grid place-items-center font-black ${i===0?"bg-gradient-gold text-yellow-950":i<3?"bg-gradient-hero text-white":"bg-secondary"}`}>{i+1}</div>
            <img src={u.avatar_url} className="w-10 h-10 rounded-xl bg-secondary"/>
            <div className="flex-1"><div className="font-semibold">{u.username}</div><div className="text-xs text-muted-foreground capitalize">{u.vip_tier} · {u.points} pts</div></div>
            <div className="font-bold text-gradient">{brl(u.total_spent)}</div>
          </div>
        ))}
        {top.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">Sem dados de ranking ainda.</div>}
      </div>
    </div>
  );
}
