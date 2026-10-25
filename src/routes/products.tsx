import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { brl } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Package, RefreshCw, Sparkles } from "lucide-react";

export const Route = createFileRoute("/products")({ component: Products });
type Product = Database["public"]["Tables"]["products"]["Row"];
const categoryNames: Record<string, string> = {
  robux: "Robux", mm2: "MM2", accounts: "Contas", giftcards: "Gift Cards",
  gamepasses: "Game Passes", services: "Serviços", scripts: "Scripts",
};

function Products() {
  const [items, setItems] = useState<Product[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    supabase.from("products").select("*").eq("is_active", true)
      .order("is_featured", { ascending: false }).order("created_at", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (!active) return;
        if (loadError) setError(true);
        else setItems(data || []);
        setLoading(false);
      });
    return () => { active = false; };
  }, [retry]);

  const categories = useMemo(() => ["all", ...new Set(items.map((item) => item.category))], [items]);
  const filtered = category === "all" ? items : items.filter((item) => item.category === category);

  return (
    <div className="container mx-auto px-4 py-10 lg:py-14">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary"><Sparkles size={15} aria-hidden="true"/> Catálogo System Bux</div>
        <h1 className="text-3xl lg:text-5xl font-black tracking-tight mt-2">Encontre o que procura</h1>
        <p className="text-muted-foreground mt-3">Veja os itens disponíveis para consulta. Nossa equipe confirma valor, estoque e entrega antes de qualquer pagamento.</p>
      </div>

      {!loading && !error && categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mt-8" aria-label="Filtrar produtos por categoria">
          {categories.map((name) => (
            <button key={name} type="button" onClick={() => setCategory(name)} aria-pressed={category === name}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${category === name ? "bg-gradient-hero text-white shadow-glow" : "glass hover:bg-secondary"}`}>
              {name === "all" ? "Todos" : categoryNames[name] || name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8" aria-label="Carregando produtos">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="glass rounded-2xl overflow-hidden animate-pulse" aria-hidden="true">
              <div className="aspect-[16/10] bg-secondary"/><div className="p-5 space-y-3"><div className="h-4 w-1/3 rounded bg-secondary"/><div className="h-6 w-3/4 rounded bg-secondary"/><div className="h-8 w-1/2 rounded bg-secondary"/></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-strong rounded-2xl p-8 mt-8 text-center max-w-xl mx-auto" role="alert">
          <AlertCircle className="mx-auto text-warning" size={30}/><h2 className="text-lg font-semibold mt-3">Não foi possível carregar o catálogo</h2>
          <p className="text-sm text-muted-foreground mt-2">Verifique sua conexão e tente novamente.</p>
          <Button variant="outline" onClick={() => setRetry((value) => value + 1)} className="mt-5"><RefreshCw size={16} className="mr-2"/> Tentar novamente</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-strong rounded-2xl p-8 mt-8 text-center max-w-xl mx-auto">
          <Package className="mx-auto text-primary" size={32}/><h2 className="text-lg font-semibold mt-3">Nenhum item nesta categoria</h2>
          <p className="text-sm text-muted-foreground mt-2">Você pode falar com a equipe sobre o que procura.</p>
          <Button asChild className="mt-5 bg-gradient-hero"><Link to="/support">Abrir atendimento</Link></Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
          {filtered.map((product) => (
            <article key={product.id} className="glass rounded-2xl overflow-hidden group flex flex-col border border-border/40 hover:border-primary/40 hover:shadow-glow transition-all">
              <div className="aspect-[16/10] bg-secondary overflow-hidden relative">
                {product.image_url && !brokenImages.has(product.id) ? (
                  <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => setBrokenImages((previous) => new Set(previous).add(product.id))}/>
                ) : <div className="w-full h-full grid place-items-center bg-gradient-hero/20"><Package className="text-primary" size={44} aria-hidden="true"/></div>}
                {product.is_featured && <span className="absolute top-3 left-3 rounded-full bg-background/90 border border-border/60 px-2.5 py-1 text-[11px] font-semibold">Em destaque</span>}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">{categoryNames[product.category] || product.category}</div>
                <h2 className="font-bold text-lg mt-1 leading-snug">{product.name}</h2>
                {product.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>}
                <div className="mt-auto pt-5">
                  <div className="text-xs text-muted-foreground">Valor de referência</div>
                  <div className="text-2xl font-black text-gradient">{brl(product.price)}</div>
                  <Button asChild className="w-full bg-gradient-hero mt-4">
                    <Link to={product.category === "robux" ? "/robux" : "/support"}>Solicitar cotação <ArrowRight size={16} className="ml-1" aria-hidden="true"/></Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
