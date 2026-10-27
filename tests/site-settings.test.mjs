import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_SITE_SETTINGS, parsePublicSiteSettings, validDiscordInvite, validSiteName } from "../src/lib/site-settings.ts";

test("reads the public site fields and normalizes a Discord invite", () => {
  const settings = parsePublicSiteSettings({
    name: "  Loja Exemplo  ",
    tagline: " Produtos digitais ",
    support_email: " ajuda@example.com ",
    discord_invite_url: "https://discord.com/invite/AbC123",
    announcement: "  Atendimento disponível hoje  ",
    hero_subtitle: "  Consulte antes de comprar.  ",
  });

  assert.deepEqual(settings, {
    name: "Loja Exemplo",
    tagline: "Produtos digitais",
    supportEmail: "ajuda@example.com",
    discordInviteUrl: "https://discord.gg/AbC123",
    announcement: "Atendimento disponível hoje",
    heroSubtitle: "Consulte antes de comprar.",
  });
});

test("missing or malformed rows retain usable defaults", () => {
  assert.deepEqual(parsePublicSiteSettings(null), DEFAULT_SITE_SETTINGS);
  assert.deepEqual(parsePublicSiteSettings([]), DEFAULT_SITE_SETTINGS);

  const settings = parsePublicSiteSettings({
    name: " ",
    tagline: "bad\nline",
    support_email: "not-an-email",
    hero_subtitle: 123,
    announcement: "a".repeat(281),
  });
  assert.deepEqual(settings, DEFAULT_SITE_SETTINGS);
  assert.deepEqual(parsePublicSiteSettings({
    name: "System Bux", tagline: "Robux com o melhor preço do Brasil", support_email: "suporte@systembux.com",
  }), DEFAULT_SITE_SETTINGS);
});

test("only direct HTTPS Discord invite links are exposed", () => {
  assert.equal(validDiscordInvite("https://discord.gg/xyz-12"), "https://discord.gg/xyz-12");
  for (const value of [
    "http://discord.gg/xyz12",
    "https://discord.gg.evil.test/xyz12",
    "https://discord.com@evil.test/invite/xyz12",
    "https://discord.gg@evil.test/xyz12",
    "https://discord.gg/xyz12/another",
    "https://www.discord.gg/xyz12",
    "https://discordapp.com/invite/xyz12",
    "https://discord.com/channels/xyz12",
    "https://discord.com/invite/xyz12?ref=other",
    "javascript:alert(1)",
  ]) {
    assert.equal(validDiscordInvite(value), null, value);
  }
});

test("a renamed project uses a bounded public name", () => {
  assert.equal(validSiteName("  Synx Applications  "), "Synx Applications");
  assert.equal(parsePublicSiteSettings({ name: "Synx Applications" }).name, "Synx Applications");
  assert.equal(validSiteName("\nNome inválido"), "Nome inválido");
  assert.equal(validSiteName("Linha um\nLinha dois"), null);
  assert.equal(validSiteName("x".repeat(61)), null);
  assert.equal(parsePublicSiteSettings({ name: "x".repeat(61) }).name, DEFAULT_SITE_SETTINGS.name);
});
