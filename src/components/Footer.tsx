import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Instagram, Twitter, MessageCircle, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-card/30">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-xs">
            A loja brasileira mais confiável de Robux e produtos Roblox. Entrega rápida, suporte 24h e preços imbatíveis.
          </p>
          <div className="flex gap-2 pt-2">
            {[Instagram, Twitter, MessageCircle, Mail].map((I, i) => (
              <a key={i} href="#" className="w-9 h-9 grid place-items-center rounded-lg glass hover:bg-primary/20 transition-colors">
                <I size={16}/>
              </a>
            ))}
          </div>
        </div>
        <FooterCol title="Loja" links={[
          ["Robux", "/robux"], ["MM2", "/products"], ["Contas", "/products"], ["Gift Cards", "/products"]
        ]}/>
        <FooterCol title="Conta" links={[
          ["Dashboard", "/dashboard"], ["Meus pedidos", "/dashboard/orders"], ["Afiliados", "/dashboard/affiliates"], ["Cashback", "/dashboard/rewards"]
        ]}/>
        <FooterCol title="Suporte" links={[
          ["FAQ", "/faq"], ["Contato", "/support"], ["Termos", "/terms"], ["Privacidade", "/privacy"]
        ]}/>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} System Bux. Todos os direitos reservados.</span>
          <span>Não afiliado oficialmente à Roblox Corporation.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="font-semibold mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map(([l, to]) => (
          <li key={l}><Link to={to} className="hover:text-foreground transition-colors">{l}</Link></li>
        ))}
      </ul>
    </div>
  );
}
