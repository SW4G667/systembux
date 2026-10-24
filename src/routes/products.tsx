import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { brl } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export const Route = createFileRoute("/products")({ component: Products });
type Product = Database["public"]["Tables"]["products"]["Row"];

function Products() {
  const [items, setItems] = useState<Product[]>([]);
  const [cat, setCat] = useState<string>("all");
  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).order("is_featured", { ascending: false }).then(({ data }) => setItems(data || []));
  }, []);
  const filtered = cat === "all" ? items : items.filter((i) => i.category === cat);
  const cats = ["all","robux","mm2","accounts","giftcards","gamepasses","services","scripts"];
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl lg:text-4xl font-bold">Loja completa</h1>
      <p className="text-muted-foreground mt-2">Tudo que você precisa para o Roblox em um só lugar.</p>
      <div className="flex flex-wrap gap-2 mt-6">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${cat===c?"bg-gradient-hero text-white shadow-glow":"glass hover:bg-secondary"}`}>
            {c === "all" ? "Todos" : c}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
        {filtered.map((p) => (
          <div key={p.id} className="glass rounded-2xl overflow-hidden group">
            <div className="aspect-[16/10] bg-secondary overflow-hidden">
              {p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                : <div className="w-full h-full grid place-items-center bg-gradient-hero/20"><Package className="text-primary" size={44}/></div>}
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.category}</div>
              <div className="font-semibold mt-1">{p.name}</div>
              <div className="flex items-end justify-between mt-3">
                <div className="text-xl font-black text-gradient">{brl(p.price)}</div>
                <Link to={p.category === "robux" ? "/robux" : "/support"}>
                  <Button size="sm" className="bg-gradient-hero">Consultar</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
