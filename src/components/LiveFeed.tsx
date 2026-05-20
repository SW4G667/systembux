import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { brl, relative } from "@/lib/format";

type Item = { id: string; username: string; product_name: string; total_amount: number; avatar_url: string; created_at: string };

export function LiveFeed() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, total_amount, product_name, created_at, user_id, profiles!inner(username, avatar_url)")
        .in("status", ["paid", "delivered", "processing"])
        .order("created_at", { ascending: false })
        .limit(8);
      const mapped: Item[] = (data || []).map((o: any) => ({
        id: o.id,
        username: o.profiles?.username || "Cliente",
        avatar_url: o.profiles?.avatar_url || "",
        product_name: o.product_name,
        total_amount: Number(o.total_amount),
        created_at: o.created_at,
      }));
      setItems(mapped);
    };
    load();
    const ch = supabase
      .channel("live-feed")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, async (p) => {
        const n: any = p.new;
        if (!["paid", "delivered", "processing"].includes(n.status)) return;
        const { data: prof } = await supabase.from("profiles").select("username, avatar_url").eq("user_id", n.user_id).maybeSingle();
        setItems((prev) => [{
          id: n.id, username: prof?.username || "Cliente", avatar_url: prof?.avatar_url || "",
          product_name: n.product_name, total_amount: Number(n.total_amount), created_at: n.updated_at,
        }, ...prev.filter((x) => x.id !== n.id)].slice(0, 8));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {items.map((it) => (
          <motion.div
            key={it.id}
            layout
            initial={{ opacity: 0, x: -20, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="glass rounded-2xl p-3 flex items-center gap-3 shadow-glow"
          >
            <div className="relative">
              <img src={it.avatar_url} className="w-10 h-10 rounded-xl bg-secondary object-cover" alt=""/>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-card animate-pulse"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                <span className="text-primary">{it.username}</span> comprou {it.product_name}
              </div>
              <div className="text-[11px] text-muted-foreground">{relative(it.created_at)} · {brl(it.total_amount)}</div>
            </div>
            <Sparkles size={16} className="text-primary"/>
          </motion.div>
        ))}
      </AnimatePresence>
      {items.length === 0 && (
        <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
          Aguardando primeiras compras...
        </div>
      )}
    </div>
  );
}
