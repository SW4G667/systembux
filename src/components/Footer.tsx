import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-card/30">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-xs">
            Explore produtos para Roblox, calcule valores estimados e fale com a equipe antes de confirmar sua compra.
          </p>
          <Link to="/support" className="inline-block text-sm text-primary hover:underline">Abrir atendimento →</Link>
        </div>
        <FooterCol title="Loja" links={[
          ["Robux", "/robux"], ["MM2", "/products"], ["Contas", "/products"], ["Gift Cards", "/products"]
        ]}/>
        <FooterCol title="Conta" links={[
          ["Dashboard", "/dashboard"], ["Meus pedidos", "/dashboard"], ["Atendimento", "/support"]
        ]}/>
        <FooterCol title="Suporte" links={[
          ["Contato", "/support"], ["Sua conta", "/dashboard"]
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
