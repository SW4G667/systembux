import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Headphones, Sparkles, TrendingUp, Star, Coins, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveFeed } from "@/components/LiveFeed";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ orders: 0, users: 0, robux: 0 });

  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).eq("is_featured", true).limit(6).then(({ data }) => setProducts(data || []));
    Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["paid", "delivered"]),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("robux_amount").not("robux_amount", "is", null),
    ]).then(([o, u, r]) => {
      const robux = (r.data || []).reduce((a, b: any) => a + (b.robux_amount || 0), 0);
      setStats({ orders: o.count || 0, users: u.count || 0, robux });
    });
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,oklch(0.72_0.22_295/0.4),transparent_60%)] pointer-events-none"/>
        <div className="container mx-auto px-4 py-20 lg:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"/> Sistema online · Entrega automática
              </div>
              <h1 className="mt-5 text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                Robux <span className="text-gradient animate-gradient bg-gradient-hero">mais barato</span><br/>
                do Brasil.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl">
                Compre Robux via PIX, receba na hora. 100 Robux a partir de <strong className="text-foreground">R$3,80</strong>. Plataforma premium com suporte 24/7.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/robux">
                  <Button size="lg" className="bg-gradient-hero shadow-glow text-base h-12 px-6">
                    Comprar Robux <ArrowRight className="ml-1"/>
                  </Button>
                </Link>
                <Link to="/products">
                  <Button size="lg" variant="outline" className="h-12 px-6 glass border-border/60">
                    Ver loja completa
                  </Button>
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                <Stat label="Pedidos" value={`${stats.orders}+`} />
                <Stat label="Clientes" value={`${stats.users}+`} />
                <Stat label="Robux entregues" value={`${(stats.robux/1000).toFixed(0)}K+`} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
              <div className="glass-strong rounded-3xl p-6 shadow-premium ring-neon animate-float">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive"/>
                    <span className="w-2.5 h-2.5 rounded-full bg-warning"/>
                    <span className="w-2.5 h-2.5 rounded-full bg-success"/>
                  </div>
                  <span className="text-xs text-muted-foreground">🔴 ao vivo</span>
                </div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp size={15} className="text-primary"/> Últimas compras</h3>
                <LiveFeed />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { i: Zap, t: "Entrega instantânea", d: "Receba seus Robux em segundos após o PIX confirmado." },
            { i: Shield, t: "100% Seguro", d: "Pagamentos protegidos, dados criptografados, anti-fraude." },
            { i: Headphones, t: "Suporte 24/7", d: "Equipe online para te ajudar a qualquer momento." },
          ].map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 hover:shadow-glow transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-hero grid place-items-center shadow-glow mb-4">
                <b.i className="text-white" size={22}/>
              </div>
              <h3 className="font-bold text-lg">{b.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{b.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-semibold">Em destaque</div>
            <h2 className="text-3xl lg:text-4xl font-bold mt-1">Produtos populares</h2>
          </div>
          <Link to="/products" className="text-sm text-primary hover:underline">Ver todos →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <motion.div key={p.id} whileHover={{ y: -4 }} className="glass rounded-2xl overflow-hidden group">
              <div className="aspect-[16/10] overflow-hidden bg-secondary relative">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                {p.original_price && (
                  <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-destructive text-destructive-foreground text-xs font-bold">
                    -{Math.round((1 - p.price / p.original_price) * 100)}%
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">{p.category}</div>
                <h3 className="font-semibold mt-1">{p.name}</h3>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    {p.original_price && <div className="text-xs text-muted-foreground line-through">{brl(p.original_price)}</div>}
                    <div className="text-xl font-black text-gradient">{brl(p.price)}</div>
                  </div>
                  <Link to="/products"><Button size="sm" className="bg-gradient-hero shadow-glow">Comprar</Button></Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Simples assim</div>
          <h2 className="text-3xl lg:text-4xl font-bold mt-1">Como funciona</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 relative">
          {[
            { n: "01", i: Coins, t: "Escolha a quantidade", d: "Defina quantos Robux deseja na nossa calculadora." },
            { n: "02", i: Sparkles, t: "Pague com PIX", d: "Receba o QR Code e pague em segundos." },
            { n: "03", i: Gift, t: "Receba na hora", d: "Robux entregues automaticamente na sua gamepass." },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-6 relative">
              <div className="text-6xl font-black text-gradient opacity-30 absolute right-4 top-2">{s.n}</div>
              <div className="w-12 h-12 rounded-xl bg-gradient-hero grid place-items-center shadow-glow"><s.i className="text-white" size={20}/></div>
              <h3 className="font-bold text-lg mt-4">{s.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Clientes felizes</div>
          <h2 className="text-3xl lg:text-4xl font-bold mt-1">+5.000 avaliações 5 estrelas</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n: "Lucas R.", t: "Comprei 1k Robux e chegou em segundos. Site profissional!", s: "https://api.dicebear.com/7.x/bottts/svg?seed=l1" },
            { n: "Mariana S.", t: "Atendimento perfeito. Já é a 5ª vez que compro.", s: "https://api.dicebear.com/7.x/bottts/svg?seed=m2" },
            { n: "Pedro V.", t: "Mais barato que comprar direto na Roblox 🚀", s: "https://api.dicebear.com/7.x/bottts/svg?seed=p3" },
          ].map((t, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className="flex gap-1 text-warning">{[...Array(5)].map((_,j) => <Star key={j} size={14} fill="currentColor"/>)}</div>
              <p className="text-sm mt-3">"{t.t}"</p>
              <div className="flex items-center gap-3 mt-4">
                <img src={t.s} className="w-9 h-9 rounded-lg bg-secondary"/>
                <div className="text-sm font-medium">{t.n}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 lg:p-16 text-center shadow-glow">
          <div className="absolute inset-0 grid-bg opacity-30"/>
          <div className="relative">
            <h2 className="text-3xl lg:text-5xl font-black text-white">Pronto pra começar?</h2>
            <p className="text-white/85 mt-3 max-w-xl mx-auto">Crie sua conta grátis e ganhe 50 pontos de boas-vindas.</p>
            <Link to="/register" className="inline-block mt-7">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold">Criar conta grátis</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl lg:text-3xl font-black text-gradient">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}
