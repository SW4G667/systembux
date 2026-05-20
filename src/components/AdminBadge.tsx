import { Shield } from "lucide-react";

export function AdminBadge({ size = 14 }: { size?: number }) {
  return (
    <span
      title="Administrador System Bux"
      className="inline-flex items-center justify-center rounded-md bg-gradient-gold px-1.5 py-0.5 shadow-gold"
      style={{ minWidth: size + 8, height: size + 8 }}
    >
      <Shield size={size} className="text-yellow-950" fill="currentColor" />
    </span>
  );
}
