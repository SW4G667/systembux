import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "System Bux — Produtos digitais e cotação de Robux" },
      { name: "description", content: "Explore produtos digitais e solicite uma cotação de Robux. O atendimento confirma valores, disponibilidade e pagamento antes do pedido." },
      { name: "theme-color", content: "#1a0f2e" },
      { property: "og:title", content: "System Bux — Produtos digitais e cotação de Robux" },
      { property: "og:description", content: "Explore produtos digitais e solicite uma cotação de Robux. O atendimento confirma valores e disponibilidade antes do pedido." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "System Bux — Produtos digitais e cotação de Robux" },
      { name: "twitter:description", content: "Explore produtos digitais e solicite uma cotação de Robux." },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="text-center">
        <div className="text-8xl font-black text-gradient">404</div>
        <p className="text-muted-foreground mt-2">Página não encontrada</p>
        <a href="/" className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-gradient-hero text-white font-medium shadow-glow">Voltar ao início</a>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => {
    const r = useRouter();
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold">Algo deu errado</h1>
          <p className="text-sm text-muted-foreground mt-2">Não foi possível carregar esta página. Tente novamente.</p>
          <button onClick={() => { r.invalidate(); reset(); }} className="mt-6 px-5 py-2.5 rounded-xl bg-gradient-hero text-white">Tentar novamente</button>
        </div>
      </div>
    );
  },
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1"><Outlet /></main>
          <Footer />
        </div>
        <Toaster richColors theme="dark" position="top-right"/>
      </AuthProvider>
    </QueryClientProvider>
  );
}
