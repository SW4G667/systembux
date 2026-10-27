import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { DEFAULT_SITE_SETTINGS, validDiscordInvite, validSiteName } from "@/lib/site-settings";
import { brl, relative } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, ShoppingBag, DollarSign, Megaphone, Package, Globe, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({ component: Admin });

type PublicSiteFields = {
  name: string;
  discord_invite_url: string;
  announcement: string;
  hero_subtitle: string;
  tagline: string;
  support_email: string;
};

const EMPTY_SITE_FIELDS: PublicSiteFields = {
  name: DEFAULT_SITE_SETTINGS.name, discord_invite_url: "", announcement: "", hero_subtitle: "", tagline: "", support_email: "",
};

function asSiteFields(value: Json): PublicSiteFields {
  const row = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    name: typeof row.name === "string" ? row.name : DEFAULT_SITE_SETTINGS.name,
    discord_invite_url: typeof row.discord_invite_url === "string" ? row.discord_invite_url : "",
    announcement: typeof row.announcement === "string" ? row.announcement : "",
    hero_subtitle: typeof row.hero_subtitle === "string" ? row.hero_subtitle : "",
    tagline: row.tagline === "Robux com o melhor preço do Brasil" ? DEFAULT_SITE_SETTINGS.tagline : typeof row.tagline === "string" ? row.tagline : "",
    support_email: row.support_email === "suporte@systembux.com" ? "" : typeof row.support_email === "string" ? row.support_email : "",
  };
}

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0, pending: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [announce, setAnnounce] = useState({ title: "", body: "" });
  const [siteFields, setSiteFields] = useState<PublicSiteFields>(EMPTY_SITE_FIELDS);
  const [siteLoading, setSiteLoading] = useState(true);
  const [siteSaving, setSiteSaving] = useState(false);
  const [siteError, setSiteError] = useState("");
  const [siteVersion, setSiteVersion] = useState<string | null>(null);

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

  const loadSiteSettings = async () => {
    setSiteLoading(true);
    setSiteError("");
    const { data, error } = await supabase.from("settings").select("value, updated_at").eq("key", "site").maybeSingle();
    if (error || !data) {
      setSiteVersion(null);
      setSiteError(error?.message || "Configuração do site não encontrada.");
    } else {
      setSiteFields(asSiteFields(data.value));
      setSiteVersion(data.updated_at);
    }
    setSiteLoading(false);
  };

  useEffect(() => {
    if (isAdmin) void loadSiteSettings();
  }, [isAdmin]);

  const saveSiteSettings = async () => {
    if (!isAdmin || siteSaving || siteLoading) return;
    const fields = Object.fromEntries(
      Object.entries(siteFields).map(([key, value]) => [key, value.trim()]),
    ) as PublicSiteFields;
    if (!validSiteName(fields.name)) return setSiteError("Informe um nome de 1 a 60 caracteres, em uma única linha.");
    if (!siteVersion) return setSiteError("Recarregue as configurações antes de salvar.");
    const invite = fields.discord_invite_url ? validDiscordInvite(fields.discord_invite_url) : "";
    if (invite === null) return setSiteError("Informe um convite HTTPS discord.gg/código ou discord.com/invite/código.");
    if (fields.announcement.length > 280 || fields.hero_subtitle.length > 240 || fields.tagline.length > 180) {
      return setSiteError("Revise os limites de caracteres do anúncio, subtítulo e descrição.");
    }
    if (fields.support_email.length > 254 || (fields.support_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.support_email))) {
      return setSiteError("Informe um e-mail de suporte válido ou deixe o campo vazio.");
    }
    setSiteSaving(true);
    setSiteError("");
    try {
      // Leia novamente para preservar as outras chaves (por exemplo name) e
      // não sobrescrever uma alteração feita por outro administrador.
      const { data: current, error: readError } = await supabase.from("settings")
        .select("value, updated_at").eq("key", "site").single();
      if (readError || !current) throw new Error(readError?.message || "Configuração do site não encontrada.");
      if (current.updated_at !== siteVersion) {
        throw new Error("A configuração foi alterada no Manager ou em outra sessão. Recarregue antes de salvar.");
      }
      const original = current.value && typeof current.value === "object" && !Array.isArray(current.value)
        ? current.value : {};
      const value = { ...original, ...fields, discord_invite_url: invite } as Json;
      const { data: saved, error: writeError } = await supabase.from("settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", "site").eq("updated_at", siteVersion)
        .select("value, updated_at").maybeSingle();
      if (writeError || !saved) {
        throw new Error(writeError?.message || "A configuração mudou ou a gravação não foi autorizada. Recarregue e tente novamente.");
      }
      setSiteFields(asSiteFields(saved.value));
      setSiteVersion(saved.updated_at);
      await queryClient.invalidateQueries({ queryKey: ["public-site-settings"] });
      toast.success("Configurações públicas do site atualizadas.");
    } catch (error) {
      setSiteError(error instanceof Error ? error.message : "Não foi possível salvar as configurações.");
    } finally {
      setSiteSaving(false);
    }
  };

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

      <section className="glass-strong rounded-3xl p-6 mt-6" aria-labelledby="site-settings-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><Globe className="text-primary" size={20}/><h2 id="site-settings-title" className="text-lg font-semibold">Conteúdo público do site</h2></div>
            <p className="text-sm text-muted-foreground mt-1">Atualize textos e convite do Discord sem alterar o endereço do backend. O suporte por ticket continua disponível no site.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadSiteSettings()} disabled={siteLoading || siteSaving}>
            <RefreshCw size={15} className="mr-2"/> Recarregar
          </Button>
        </div>
        {siteLoading ? <p className="text-sm text-muted-foreground mt-5">Carregando configurações...</p> : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="site-name" className="text-sm font-medium">Nome público do projeto</label>
              <Input id="site-name" maxLength={60} value={siteFields.name}
                onChange={(event) => setSiteFields((previous) => ({ ...previous, name: event.target.value }))}/>
              <p className="text-xs text-muted-foreground">Atualiza o nome exibido na loja, no rodapé e no título da página.</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="site-discord" className="text-sm font-medium">Convite do servidor Discord</label>
              <Input id="site-discord" type="url" maxLength={200} placeholder="https://discord.gg/seuconvite" value={siteFields.discord_invite_url}
                onChange={(event) => setSiteFields((previous) => ({ ...previous, discord_invite_url: event.target.value }))}/>
              <p className="text-xs text-muted-foreground">Deixe vazio para ocultar o botão Comunidade.</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="site-announcement" className="text-sm font-medium">Aviso na página inicial</label>
              <Textarea id="site-announcement" maxLength={280} rows={2} placeholder="Comunicado opcional para visitantes" value={siteFields.announcement}
                onChange={(event) => setSiteFields((previous) => ({ ...previous, announcement: event.target.value }))}/>
              <p className="text-xs text-muted-foreground">{siteFields.announcement.length}/280 caracteres. Deixe vazio para ocultar.</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="site-subtitle" className="text-sm font-medium">Subtítulo da página inicial</label>
              <Textarea id="site-subtitle" maxLength={240} rows={2} value={siteFields.hero_subtitle}
                onChange={(event) => setSiteFields((previous) => ({ ...previous, hero_subtitle: event.target.value }))}/>
              <p className="text-xs text-muted-foreground">{siteFields.hero_subtitle.length}/240 caracteres. Vazio usa o texto padrão.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="site-tagline" className="text-sm font-medium">Descrição curta</label>
              <Input id="site-tagline" maxLength={180} value={siteFields.tagline}
                onChange={(event) => setSiteFields((previous) => ({ ...previous, tagline: event.target.value }))}/>
              <p className="text-xs text-muted-foreground">{siteFields.tagline.length}/180 caracteres. Aparece no rodapé.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="site-email" className="text-sm font-medium">E-mail de suporte</label>
              <Input id="site-email" type="email" maxLength={254} value={siteFields.support_email}
                onChange={(event) => setSiteFields((previous) => ({ ...previous, support_email: event.target.value }))}/>
              <p className="text-xs text-muted-foreground">Contato público opcional. Nunca coloque credenciais aqui.</p>
            </div>
            {siteError && <p className="md:col-span-2 text-sm text-destructive" role="alert">{siteError}</p>}
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={() => void saveSiteSettings()} disabled={siteSaving || siteLoading} className="bg-gradient-hero shadow-glow">
                {siteSaving ? "Salvando..." : "Salvar configurações"}
              </Button>
            </div>
          </div>
        )}
      </section>
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
