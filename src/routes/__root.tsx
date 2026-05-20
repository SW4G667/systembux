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
      { title: "System Bux — Robux mais barato do Brasil" },
      { name: "description", content: "Compre Robux, MM2, gamepasses e gift cards com entrega automática via PIX. Plataforma premium 24/7." },
      { name: "theme-color", content: "#1a0f2e" },
      { property: "og:title", content: "System Bux — Robux mais barato do Brasil" },
      { property: "og:description", content: "Compre Robux, MM2, gamepasses e gift cards com entrega automática via PIX. Plataforma premium 24/7." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "System Bux — Robux mais barato do Brasil" },
      { name: "twitter:description", content: "Compre Robux, MM2, gamepasses e gift cards com entrega automática via PIX. Plataforma premium 24/7." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b0924813-c008-44c5-a597-367562da4d2f/id-preview-9e7d413f--49918f3f-bc32-4e24-84cc-9ab2d5e3eb76.lovable.app-1779257584859.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b0924813-c008-44c5-a597-367562da4d2f/id-preview-9e7d413f--49918f3f-bc32-4e24-84cc-9ab2d5e3eb76.lovable.app-1779257584859.png" },
      { name: "twitter:card", content: "summary_large_image" },
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
  errorComponent: ({ error, reset }) => {
    const r = useRouter();
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold">Algo deu errado</h1>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
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
