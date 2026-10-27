import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";

/** Keep browser and sharing metadata in sync when the public name changes. */
export function SiteMetadata() {
  const { name, tagline } = useSiteSettings();

  useEffect(() => {
    const title = `${name} — Produtos digitais e cotação de Robux`;
    document.title = title;
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      document.querySelector(selector)?.setAttribute("content", title);
    }
    document.querySelector('meta[name="description"]')?.setAttribute("content", tagline);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", tagline);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", tagline);
  }, [name, tagline]);

  return null;
}
