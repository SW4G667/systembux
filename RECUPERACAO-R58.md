# Recuperação do SystemBux R58

O código foi recuperado do repositório `SW4G667/systembux`. A URL de preview antiga responde com proteção de login da Vercel; isso não prova que o projeto ou os dados foram apagados. O projeto Vercel `systembux` ainda existe, mas seus deployments atuais vêm de `SW4G667/zx-sparkle-cart` (branch `valtrexcloud-2026-10-11`) e `systembux.vercel.app` entrega o ValtrexCloud. Publicar a loja recuperada nesse projeto substituiria o site atual. É preciso separar os projetos ou decidir explicitamente qual domínio deve mostrar cada produto.

## Correções feitas no código

- O checkout deixa de gerar um código PIX inventado no navegador. Pagamentos antigos sem ID real do provedor não são exibidos como cobranças válidas.
- A calculadora envia uma solicitação de cotação ao atendimento, com quantidade, nick, Game Pass e valor estimado. Ela deixa claro que ainda não existe pedido nem cobrança.
- Foram retiradas avaliações fictícias, números públicos obtidos de tabelas privadas, promessas de entrega instantânea e links para páginas inexistentes.
- Dependências centrais foram fixadas nas versões do `bun.lock` para evitar a incompatibilidade entre TanStack Start e Vite que impedia a instalação limpa via npm.
- O ZIP exclui o `.env` que estava versionado no repositório público; `.gitignore` e `.env.example` orientam a configuração local. Ao atualizar o repositório, execute `git rm --cached .env` para parar de versioná-lo.
- A migração `secure_storefront_checkout_and_roles` fecha a criação de pedidos/cobranças pelo cliente, limita a edição do perfil e retira a promoção automática de um e-mail fixo. **A migração está apenas no código; não foi aplicada ao banco remoto.**

## Antes de publicar

1. Defina um projeto Vercel separado para a loja e seu domínio, preservando o deployment atual do ValtrexCloud. O preview antigo exige autenticação e o domínio curto aponta para outro conteúdo.
2. Faça backup do banco Supabase e aplique a migração nova no projeto correto. O projeto referenciado pela loja não aparece entre os projetos Supabase acessíveis neste ambiente.
3. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no ambiente de build. Não exponha chaves `service_role` no navegador.
4. Configure um gateway real em um backend confiável antes de habilitar checkout ou prometer pagamento automático. Esta versão mantém a cotação por atendimento enquanto isso não existe.
5. Execute `npm install`, `npx tsc --noEmit` e `npm run build`. O projeto usa o adaptador Cloudflare no build; um novo deployment Vercel exige verificar o adaptador e o comando de saída na configuração do projeto.

O ZIP de fonte exclui `.env`, `node_modules`, `dist` e arquivos Git. Nenhum deployment ou migração remota foi realizado nesta revisão.
