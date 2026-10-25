import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Menu, X, Sparkles, ShoppingBag, LogOut, User as UserIcon, LayoutDashboard, ShieldAlert, ExternalLink } from "lucide-react";
import { Logo } from "./Logo";
import { AdminBadge } from "./AdminBadge";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";
import { relative } from "@/lib/format";
import { useSiteSettings } from "@/hooks/use-site-settings";

const nav = [
  { to: "/", label: "Início" },
  { to: "/robux", label: "Robux" },
  { to: "/products", label: "Loja" },
  { to: "/ranking", label: "Ranking" },
  { to: "/support", label: "Suporte" },
];
type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const site = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const unread = notifs.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(15);
      setNotifs(data || []);
    };
    load();
    const ch = supabase
      .channel("notif:" + user.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (p) => {
        setNotifs((prev) => [p.new as Notification, ...prev].slice(0, 15));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <header className="sticky top-0 z-50 glass-strong border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0" aria-label={`${site.name} — início`}><Logo name={site.name}/></Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/60"
              activeProps={{ className: "px-3 py-2 text-sm font-semibold text-foreground rounded-md bg-secondary/80" }}
            >
              {n.label}
            </Link>
          ))}
          {site.discordInviteUrl && (
            <a href={site.discordInviteUrl} target="_blank" rel="noopener noreferrer"
              aria-label="Entrar no servidor Discord (abre em nova aba)"
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/60">
              Discord <ExternalLink size={13} aria-hidden="true"/>
            </a>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* notifications */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                  className="relative w-10 h-10 grid place-items-center rounded-xl glass hover:bg-secondary transition-all"
                  aria-label="Notificações"
                >
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center text-[10px] font-bold rounded-full bg-gradient-hero text-white animate-pulse-ring">
                      {unread}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-[340px] glass-strong rounded-2xl shadow-premium overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b">
                        <div className="font-semibold flex items-center gap-2"><Bell size={16} className="text-primary"/> Notificações</div>
                        {unread > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary hover:underline">marcar lidas</button>
                        )}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                        {notifs.length === 0 ? (
                          <div className="p-8 text-center text-sm text-muted-foreground">Nenhuma notificação ainda.</div>
                        ) : notifs.map((n) => (
                          <div key={n.id} className={`px-4 py-3 border-b border-border/40 flex gap-3 ${!n.is_read ? "bg-primary/5" : ""}`}>
                            <div className="w-8 h-8 rounded-lg bg-gradient-hero grid place-items-center shrink-0">
                              <Sparkles size={14} className="text-white"/>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{n.title}</div>
                              {n.body && <div className="text-xs text-muted-foreground line-clamp-2">{n.body}</div>}
                              <div className="text-[10px] text-muted-foreground mt-1">{relative(n.created_at)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* profile */}
              <div className="relative">
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl glass hover:bg-secondary transition-all"
                >
                  <img src={profile?.avatar_url || ""} alt="" className="w-8 h-8 rounded-lg object-cover bg-secondary"/>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className="text-sm font-medium max-w-[100px] truncate">{profile?.username}</span>
                    {isAdmin && <AdminBadge size={11} />}
                  </div>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-2 w-64 glass-strong rounded-2xl shadow-premium overflow-hidden"
                    >
                      <div className="p-4 border-b">
                        <div className="flex items-center gap-3">
                          <img src={profile?.avatar_url || ""} className="w-12 h-12 rounded-xl object-cover bg-secondary" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <div className="font-semibold truncate">{profile?.username}</div>
                              {isAdmin && <AdminBadge size={11}/>}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                          <div className="rounded-lg bg-secondary/60 py-1.5">
                            <div className="text-[10px] uppercase text-muted-foreground">Pontos</div>
                            <div className="text-sm font-bold text-primary">{profile?.points ?? 0}</div>
                          </div>
                          <div className="rounded-lg bg-secondary/60 py-1.5">
                            <div className="text-[10px] uppercase text-muted-foreground">VIP</div>
                            <div className="text-sm font-bold text-gradient-gold capitalize">{profile?.vip_tier}</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-1">
                        <DropItem to="/dashboard" icon={<LayoutDashboard size={15}/>} label="Dashboard"/>
                        <DropItem to="/dashboard" icon={<ShoppingBag size={15}/>} label="Meus pedidos"/>
                        <DropItem to="/dashboard" icon={<UserIcon size={15}/>} label="Perfil"/>
                        {isAdmin && <DropItem to="/admin" icon={<ShieldAlert size={15} className="text-gold"/>} label="Painel Admin"/>}
                        <button onClick={signOut} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary text-destructive">
                          <LogOut size={15}/> Sair
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
              <Link to="/register"><Button size="sm" className="bg-gradient-hero shadow-glow">Criar conta</Button></Link>
            </div>
          )}

          <button onClick={() => setOpen(!open)} className="lg:hidden w-10 h-10 grid place-items-center rounded-xl glass"
            aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="site-mobile-navigation">
            {open ? <X size={18} aria-hidden="true"/> : <Menu size={18} aria-hidden="true"/>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            id="site-mobile-navigation"
            className="lg:hidden border-t overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary">
                  {n.label}
                </Link>
              ))}
              {site.discordInviteUrl && (
                <a href={site.discordInviteUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => setOpen(false)} aria-label="Entrar no servidor Discord (abre em nova aba)"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary">
                  Discord <ExternalLink size={14} aria-hidden="true"/>
                </a>
              )}
              {!user && (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Entrar</Button></Link>
                  <Link to="/register" className="flex-1"><Button className="w-full bg-gradient-hero">Cadastrar</Button></Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function DropItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary">
      {icon} {label}
    </Link>
  );
}
