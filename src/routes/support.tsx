import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Send, MessageCircle } from "lucide-react";
import { AdminBadge } from "@/components/AdminBadge";
import { relative } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({ component: Support });

function Support() {
  const { user, profile, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    const q = isAdmin
      ? supabase.from("tickets").select("*, profiles!inner(username, avatar_url)").order("last_message_at", { ascending: false })
      : supabase.from("tickets").select("*").eq("user_id", user.id).order("last_message_at", { ascending: false });
    q.then(({ data }) => setTickets(data || []));
  }, [user?.id, isAdmin]);

  useEffect(() => {
    if (!active) return;
    supabase.from("ticket_messages").select("*").eq("ticket_id", active.id).order("created_at").then(({ data }) => setMessages(data || []));
    const ch = supabase.channel(`tic:${active.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${active.id}` }, (p) => {
        setMessages((m) => [...m, p.new as any]);
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active?.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!text.trim() || !active || !user) return;
    const { error } = await supabase.from("ticket_messages").insert({ ticket_id: active.id, user_id: user.id, is_admin: isAdmin, message: text });
    if (error) return toast.error(error.message);
    setText("");
  };

  const create = async () => {
    if (!newSubject.trim() || !user) return;
    const { data, error } = await supabase.from("tickets").insert({ user_id: user.id, subject: newSubject }).select().single();
    if (error) return toast.error(error.message);
    setTickets((t) => [data, ...t]); setActive(data); setNewSubject(""); toast.success("Ticket criado");
  };

  if (loading || !profile) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold flex items-center gap-2"><MessageCircle className="text-primary"/> Suporte</h1>
      <div className="grid md:grid-cols-[320px_1fr] gap-4 mt-6 h-[600px]">
        <div className="glass-strong rounded-3xl p-3 overflow-y-auto scrollbar-thin">
          <div className="flex gap-2 p-2">
            <Input placeholder="Novo ticket..." value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="h-9 text-sm"/>
            <Button size="icon" onClick={create} className="bg-gradient-hero shrink-0"><Plus size={15}/></Button>
          </div>
          {tickets.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground p-6">Nenhum ticket ainda.</div>
          ) : tickets.map((t) => (
            <button key={t.id} onClick={() => setActive(t)}
              className={`w-full text-left p-3 rounded-xl mt-1 ${active?.id===t.id?"bg-primary/20 ring-1 ring-primary/40":"hover:bg-secondary"}`}>
              <div className="font-medium text-sm truncate">{t.subject}</div>
              <div className="text-[10px] text-muted-foreground">{t.profiles?.username || "Você"} · {relative(t.last_message_at)}</div>
            </button>
          ))}
        </div>
        <div className="glass-strong rounded-3xl flex flex-col">
          {active ? (
            <>
              <div className="p-4 border-b">
                <div className="font-semibold">{active.subject}</div>
                <div className="text-xs text-muted-foreground capitalize">{active.status}</div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.user_id === user?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.user_id === user?.id ? "bg-gradient-hero text-white" : "glass"}`}>
                      {m.is_admin && m.user_id !== user?.id && <div className="flex items-center gap-1 mb-1"><AdminBadge size={10}/><span className="text-[10px] font-bold">Admin</span></div>}
                      {m.message}
                      <div className="text-[9px] opacity-70 mt-1">{relative(m.created_at)}</div>
                    </div>
                  </div>
                ))}
                <div ref={endRef}/>
              </div>
              <div className="p-3 border-t flex gap-2">
                <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key==="Enter" && send()} placeholder="Mensagem..." className="h-10"/>
                <Button onClick={send} className="bg-gradient-hero shadow-glow"><Send size={15}/></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-muted-foreground text-sm">Selecione um ticket ou crie um novo</div>
          )}
        </div>
      </div>
    </div>
  );
}
