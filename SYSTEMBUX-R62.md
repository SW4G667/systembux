# SystemBux R62 — conteúdo editável

O site agora lê `public.settings` (`key = site`) do Supabase já conectado ao projeto. Os campos públicos `discord_invite_url`, `announcement`, `hero_subtitle`, `tagline` e `support_email` atualizam a página inicial, navegação e rodapé. Links Discord são aceitos somente em domínios oficiais. Se a leitura falhar, o site usa textos locais e mantém o atendimento por ticket.

Administradores autenticados podem editar os mesmos campos em `/admin`. O Manager R62 também pode gravá-los pelo `/panel` → Integrações → SystemBux quando as duas variáveis privadas `SYSTEMBUX_SUPABASE_URL` e `SYSTEMBUX_SUPABASE_SERVICE_ROLE_KEY` apontam para **este** projeto Supabase. A URL de abertura salva no Manager é apenas um atalho; trocar o domínio de produção ou o backend exige configuração na hospedagem e novo deployment.

Para revisar localmente: `npm ci`, `npx tsc --noEmit`, `node --test tests/site-settings.test.mjs`, `npm run build`, `npm run preview`. O build de Vercel usa `VERCEL=1 npm run build`.

O preview Vercel permanece protegido. O domínio de produção ainda responde 404; a migração SQL de segurança R58 precisa ser aplicada no Supabase do site antes de liberar a loja publicamente. Não configure PIX ou chaves privadas na linha `settings.site`: o conteúdo dessa tabela é legível pelos visitantes.
