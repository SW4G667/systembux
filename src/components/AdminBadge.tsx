import { Shield } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function AdminBadge({ size = 14 }: { size?: number }) {
  const site = useSiteSettings();
  return (
    <span
      title={`Administrador ${site.name}`}
      className="inline-flex items-center justify-center rounded-md bg-gradient-gold px-1.5 py-0.5 shadow-gold"
      style={{ minWidth: size + 8, height: size + 8 }}
    >
      <Shield size={size} className="text-yellow-950" fill="currentColor" />
    </span>
  );
}
