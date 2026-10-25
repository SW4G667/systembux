export function Logo({ size = 32, name = "System Bux" }: { size?: number; name?: string }) {
  const [first, ...rest] = name.split(/\s+/);
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative grid place-items-center rounded-xl bg-gradient-hero shadow-glow"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" fill="none" width={size * 0.6} height={size * 0.6}>
          <path d="M4 7l8-4 8 4-8 4-8-4z" fill="white" opacity="0.95"/>
          <path d="M4 12l8 4 8-4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M4 17l8 4 8-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight max-w-[180px] truncate" title={name}>
          {first} {rest.length > 0 && <span className="text-gradient">{rest.join(" ")}</span>}
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">premium robux</span>
      </div>
    </div>
  );
}
