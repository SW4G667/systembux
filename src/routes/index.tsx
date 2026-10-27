import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Headphones, Sparkles, Coins, Gift, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { brl } from "@/lib/format";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/")({ component: Home });
type Product = Database["public"]["Tables"]["products"]["Row"];

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const site = useSiteSettings();

  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).eq("is_featured", true).limit(6).then(({ data }) => setProducts(data || []));
  }, []);

  return (
    <>
      {site.announcement && (
        <aside aria-label="Aviso da loja" className="border-b border-primary/20 bg-primary/10">
          <p className="container mx-auto px-4 py-3 text-center text-sm font-medium text-foreground whitespace-pre-line">{site.announcement}</p>
        </aside>
      )}
      {/* HERO */}
      <section className="relative overflow-hidden grid-bg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,oklch(0.72_0.22_295/0.4),transparent_60%)] pointer-events-none"/>
        <div className="container mx-auto px-4 py-20 lg:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-success"/> Catálogo e atendimento em um só lugar
              </div>
              <h1 className="mt-5 text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                Sua experiência Roblox, <span className="text-gradient animate-gradient bg-gradient-hero">do seu jeito.</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl whitespace-pre-line">
                {site.heroSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/robux">
                  <Button size="lg" className="bg-gradient-hero shadow-glow text-base h-12 px-6">
                    Calcular Robux <ArrowRight className="ml-1"/>
                  </Button>
                </Link>
                <Link to="/products">
                  <Button size="lg" variant="outline" className="h-12 px-6 glass border-border/60">
                    Ver loja completa
                  </Button>
                </Link>
                {site.discordInviteUrl && (
                  <Button asChild size="lg" variant="ghost" className="h-12 px-5 glass border border-border/60">
                    <a href={site.discordInviteUrl} target="_blank" rel="noopener noreferrer"
                      aria-label="Entrar no servidor Discord (abre em nova aba)">
                      Entrar no Discord <ExternalLink size={17} aria-hidden="true"/>
                    </a>
                  </Button>
                )}
              </div>
              <p className="mt-8 text-sm text-muted-foreground">Sua solicitação e as respostas ficam registradas na sua conta.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
              <div className="glass-strong rounded-3xl p-6 shadow-premium ring-neon animate-float">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive"/>
                    <span className="w-2.5 h-2.5 rounded-full bg-warning"/>
                    <span className="w-2.5 h-2.5 rounded-full bg-success"/>
                  </div>
                  <span className="text-xs text-muted-foreground">{site.name}</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Uma compra clara, do início ao fim</h3>
                <div className="space-y-3 text-sm">
                  <div className="glass rounded-xl p-4"><strong>01 · Explore</strong><p className="text-muted-foreground mt-1">Veja produtos e valores de referência no catálogo.</p></div>
                  <div className="glass rounded-xl p-4"><strong>02 · Consulte</strong><p className="text-muted-foreground mt-1">Envie os detalhes da sua Game Pass pelo atendimento.</p></div>
                  <div className="glass rounded-xl p-4"><strong>03 · Acompanhe</strong><p className="text-muted-foreground mt-1">Confira as respostas da equipe e seus pedidos na conta.</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { i: Zap, t: "Cotação rápida", d: "Escolha a quantidade e veja uma estimativa antes de conversar com a equipe." },
            { i: Shield, t: "Informações claras", d: "Disponibilidade e valor final são confirmados antes de qualquer pagamento." },
            { i: Headphones, t: "Atendimento na conta", d: "Envie sua solicitação e acompanhe as respostas no mesmo lugar." },
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
                {p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  : <div className="w-full h-full grid place-items-center bg-gradient-hero/20"><Gift className="text-primary" size={42}/></div>}
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
                  <Link to={p.category === "robux" ? "/robux" : "/support"}><Button size="sm" className="bg-gradient-hero shadow-glow">Consultar</Button></Link>
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
            { n: "02", i: Sparkles, t: "Envie sua solicitação", d: "Informe nick e Game Pass para receber atendimento." },
            { n: "03", i: Gift, t: "Confirme os detalhes", d: "A equipe orienta os próximos passos e o pagamento disponível." },
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

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 lg:p-16 text-center shadow-glow">
          <div className="absolute inset-0 grid-bg opacity-30"/>
          <div className="relative">
            <h2 className="text-3xl lg:text-5xl font-black text-white">Pronto pra começar?</h2>
            <p className="text-white/85 mt-3 max-w-xl mx-auto">Crie sua conta para acompanhar cotações, atendimentos e pedidos.</p>
            <Link to="/register" className="inline-block mt-7">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold">Criar conta grátis</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
