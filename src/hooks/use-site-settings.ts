import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SITE_SETTINGS, parsePublicSiteSettings } from "@/lib/site-settings";

export function useSiteSettings() {
  const { data } = useQuery({
    queryKey: ["public-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("value").eq("key", "site").maybeSingle();
      if (error) throw error;
      return parsePublicSiteSettings(data?.value);
    },
    enabled: typeof window !== "undefined",
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 1,
  });

  // Keep the storefront usable while loading or when the settings row is unavailable.
  return data ?? DEFAULT_SITE_SETTINGS;
}
