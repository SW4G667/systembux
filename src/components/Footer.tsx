import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Footer() {
  const site = useSiteSettings();
  return (
    <footer className="mt-24 border-t bg-card/30">
      <div className={`container mx-auto px-4 py-12 grid gap-10 md:grid-cols-2 ${site.discordInviteUrl ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
        <div className="space-y-3">
          <Logo name={site.name}/>
          <p className="text-sm text-muted-foreground max-w-xs">
            {site.tagline}
          </p>
          <Link to="/support" className="inline-block text-sm text-primary hover:underline">Abrir atendimento →</Link>
          {site.supportEmail && (
            <a href={`mailto:${site.supportEmail}`} className="block text-sm text-muted-foreground hover:text-foreground break-all">
              {site.supportEmail}
            </a>
          )}
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
        {site.discordInviteUrl && (
          <div>
            <h4 className="font-semibold mb-3">Comunidade</h4>
            <a href={site.discordInviteUrl} target="_blank" rel="noopener noreferrer"
              aria-label="Entrar no servidor Discord (abre em nova aba)"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Entrar no Discord ↗
            </a>
          </div>
        )}
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} {site.name}. Todos os direitos reservados.</span>
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
