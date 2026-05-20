
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON public.products(is_active, is_featured);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

INSERT INTO public.categories (slug, name, category, icon, sort_order, description) VALUES
  ('robux', 'Robux', 'robux', 'coins', 1, 'Robux entregue via Gamepass'),
  ('gamepasses', 'Gamepasses', 'gamepasses', 'ticket', 2, 'Gamepasses populares'),
  ('mm2', 'MM2', 'mm2', 'knife', 3, 'Itens de Murder Mystery 2'),
  ('accounts', 'Contas Roblox', 'accounts', 'user', 4, 'Contas premium verificadas'),
  ('giftcards', 'Gift Cards', 'giftcards', 'gift', 5, 'Gift Cards Roblox oficiais'),
  ('services', 'Serviços', 'services', 'wrench', 6, 'Serviços Roblox'),
  ('scripts', 'Scripts', 'scripts', 'code', 7, 'Scripts e ferramentas')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (slug, name, category, price, original_price, description, is_featured, is_active, metadata) VALUES
  ('robux-100', '100 Robux', 'robux', 3.80, 7.00, 'Entrega via Gamepass em até 5 minutos', true, true, '{"robux":100}'::jsonb),
  ('robux-500', '500 Robux', 'robux', 18.50, 35.00, 'Pacote popular - economia garantida', true, true, '{"robux":500}'::jsonb),
  ('robux-1000', '1.000 Robux', 'robux', 36.00, 70.00, 'Pacote mais vendido', true, true, '{"robux":1000}'::jsonb),
  ('robux-5000', '5.000 Robux', 'robux', 175.00, 350.00, 'Pacote VIP - bônus de 5% em pontos', true, true, '{"robux":5000}'::jsonb),
  ('robux-10000', '10.000 Robux', 'robux', 340.00, 700.00, 'Pacote Elite - entrega prioritária', true, true, '{"robux":10000}'::jsonb),
  ('mm2-godly', 'MM2 Godly Knife', 'mm2', 12.90, 25.00, 'Faca lendária aleatória', true, true, '{}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.settings (key, value) VALUES
  ('site', '{"name":"System Bux","tagline":"Robux com o melhor preço do Brasil","support_email":"suporte@systembux.com"}'::jsonb),
  ('robux_pricing', '{"price_per_100":3.80,"min_order":100,"max_order":100000}'::jsonb),
  ('payment', '{"provider":"vexopay","methods":["pix"],"pix_expiration_minutes":30}'::jsonb)
ON CONFLICT (key) DO NOTHING;
