export type PublicSiteSettings = {
  name: string;
  tagline: string;
  supportEmail: string | null;
  discordInviteUrl: string | null;
  announcement: string | null;
  heroSubtitle: string;
};

export const DEFAULT_SITE_SETTINGS: PublicSiteSettings = {
  name: "System Bux",
  tagline: "Explore produtos para Roblox, calcule valores estimados e fale com a equipe antes de confirmar sua compra.",
  supportEmail: null,
  discordInviteUrl: null,
  announcement: null,
  heroSubtitle: "Explore o catálogo, calcule uma estimativa e fale com a equipe antes de confirmar disponibilidade, preço e pagamento.",
};

function textField(value: unknown, maxLength: number, multiline = false): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\r\n?/g, "\n").trim();
  const forbidden = multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/ : /[\u0000-\u001F\u007F]/;
  if (!trimmed || trimmed.length > maxLength || forbidden.test(trimmed)) return null;
  return trimmed;
}

export function validSiteName(value: unknown): string | null {
  return textField(value, 60);
}

export function validDiscordInvite(value: unknown): string | null {
  const input = textField(value, 240);
  if (!input) return null;

  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.search || url.hash) return null;

    const host = url.hostname.toLowerCase();
    const path = url.pathname.split("/").filter(Boolean);
    const isShortLink = host === "discord.gg";
    const isInviteLink = host === "discord.com";
    const code = isShortLink && path.length === 1
      ? path[0]
      : isInviteLink && path.length === 2 && path[0] === "invite"
        ? path[1]
        : null;

    if (!code || !/^[A-Za-z0-9-]{2,64}$/.test(code)) return null;
    return `https://discord.gg/${code}`;
  } catch {
    return null;
  }
}

export function parsePublicSiteSettings(value: unknown): PublicSiteSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_SITE_SETTINGS;
  const fields = value as Record<string, unknown>;
  const email = textField(fields.support_email, 254);
  // Legacy seed data predates the assisted quotation flow; these defaults have
  // not been verified as a real support address or a price comparison claim.
  const tagline = textField(fields.tagline, 180);

  return {
    name: validSiteName(fields.name) ?? DEFAULT_SITE_SETTINGS.name,
    tagline: tagline && tagline !== "Robux com o melhor preço do Brasil" ? tagline : DEFAULT_SITE_SETTINGS.tagline,
    supportEmail: email && email.toLowerCase() !== "suporte@systembux.com" && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? email : null,
    discordInviteUrl: validDiscordInvite(fields.discord_invite_url),
    announcement: textField(fields.announcement, 280, true),
    heroSubtitle: textField(fields.hero_subtitle, 240, true) ?? DEFAULT_SITE_SETTINGS.heroSubtitle,
  };
}
