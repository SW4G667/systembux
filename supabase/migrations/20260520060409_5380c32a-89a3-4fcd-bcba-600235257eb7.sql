
-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE public.vip_tier AS ENUM ('bronze', 'silver', 'gold', 'diamond');
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'processing', 'delivered', 'cancelled', 'refunded');
CREATE TYPE public.payment_status AS ENUM ('pending', 'approved', 'expired', 'failed', 'refunded');
CREATE TYPE public.product_category AS ENUM ('robux', 'mm2', 'accounts', 'giftcards', 'gamepasses', 'services', 'scripts');
CREATE TYPE public.notification_type AS ENUM ('order', 'payment', 'cashback', 'points', 'promo', 'admin', 'ticket', 'welcome', 'system');
CREATE TYPE public.ticket_status AS ENUM ('open', 'pending', 'answered', 'closed');

-- ===== UPDATED_AT TRIGGER FN =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  vip_tier vip_tier NOT NULL DEFAULT 'bronze',
  points INTEGER NOT NULL DEFAULT 0,
  cashback_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  affiliate_code TEXT NOT NULL UNIQUE,
  referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_login_at TIMESTAMPTZ,
  daily_login_streak INTEGER NOT NULL DEFAULT 0,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_affiliate ON public.profiles(affiliate_code);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== USER ROLES =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
$$;

-- ===== HANDLE NEW USER =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_username TEXT;
  v_code TEXT;
BEGIN
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  -- ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_username := v_username || floor(random() * 1000)::text;
  END LOOP;
  v_code := upper(substring(md5(NEW.id::text || random()::text) from 1 for 8));

  INSERT INTO public.profiles (user_id, username, display_name, email, avatar_url, affiliate_code)
  VALUES (NEW.id, v_username, COALESCE(NEW.raw_user_meta_data->>'display_name', v_username), NEW.email,
          'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=' || v_username, v_code);

  -- default role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  -- auto-admin for keybot
  IF lower(NEW.email) = 'admin@keybot.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;

  -- welcome notification
  INSERT INTO public.notifications (user_id, type, title, body, icon)
  VALUES (NEW.id, 'welcome', 'Bem-vindo à System Bux 🚀',
    'Sua conta está ativa! Aproveite preços imbatíveis em Robux e produtos Roblox.',
    'sparkles');
  RETURN NEW;
END; $$;

-- ===== CATEGORIES =====
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category product_category NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ===== PRODUCTS =====
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category product_category NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  price NUMERIC(12,2) NOT NULL,
  original_price NUMERIC(12,2),
  stock INTEGER NOT NULL DEFAULT 9999,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  sales_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_active ON public.products(is_active);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== ORDERS =====
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT ('SB-' || to_char(now(),'YYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 6))),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_category product_category NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'pending',
  roblox_nick TEXT,
  gamepass_url TEXT,
  robux_amount INTEGER,
  delivery_data JSONB DEFAULT '{}'::jsonb,
  coupon_code TEXT,
  notes TEXT,
  admin_notes TEXT,
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== PAYMENTS =====
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'vexopay',
  provider_payment_id TEXT,
  method TEXT NOT NULL DEFAULT 'pix',
  amount NUMERIC(12,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  pix_qr_code TEXT,
  pix_copy_paste TEXT,
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  raw_response JSONB DEFAULT '{}'::jsonb,
  webhook_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_order ON public.payments(order_id);
CREATE INDEX idx_payments_provider_id ON public.payments(provider_payment_id);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== NOTIFICATIONS =====
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT,
  icon TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user ON public.notifications(user_id, is_read, created_at DESC);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ===== ANNOUNCEMENTS (global) =====
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  variant TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ===== AFFILIATES =====
CREATE TABLE public.affiliate_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  cashback_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_aff_user ON public.affiliate_earnings(affiliate_user_id);
ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;

-- ===== POINTS HISTORY =====
CREATE TABLE public.points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_points_user ON public.points_history(user_id, created_at DESC);
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- ===== CASHBACK HISTORY =====
CREATE TABLE public.cashback_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  reason TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cashback_history ENABLE ROW LEVEL SECURITY;

-- ===== TICKETS =====
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tickets_updated BEFORE UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tmsg_ticket ON public.ticket_messages(ticket_id, created_at);
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- ===== COUPONS =====
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  min_order_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- ===== AUDIT LOGS =====
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  ip TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_user ON public.audit_logs(user_id, created_at DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ===== SETTINGS =====
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====

-- profiles
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin(auth.uid()));

-- user_roles
CREATE POLICY "roles_self_read" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()));

-- categories
CREATE POLICY "cat_public_read" ON public.categories FOR SELECT USING (is_active OR public.is_admin(auth.uid()));
CREATE POLICY "cat_admin_all" ON public.categories FOR ALL USING (public.is_admin(auth.uid()));

-- products
CREATE POLICY "prod_public_read" ON public.products FOR SELECT USING (is_active OR public.is_admin(auth.uid()));
CREATE POLICY "prod_admin_all" ON public.products FOR ALL USING (public.is_admin(auth.uid()));

-- orders
CREATE POLICY "orders_self_read" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "orders_self_insert" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_admin_update" ON public.orders FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "orders_admin_delete" ON public.orders FOR DELETE USING (public.is_admin(auth.uid()));

-- payments
CREATE POLICY "pay_self_read" ON public.payments FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "pay_admin_all" ON public.payments FOR ALL USING (public.is_admin(auth.uid()));

-- notifications
CREATE POLICY "notif_self_read" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "notif_self_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_admin_all" ON public.notifications FOR ALL USING (public.is_admin(auth.uid()));

-- announcements
CREATE POLICY "ann_public_read" ON public.announcements FOR SELECT USING (is_active AND (ends_at IS NULL OR ends_at > now()));
CREATE POLICY "ann_admin_all" ON public.announcements FOR ALL USING (public.is_admin(auth.uid()));

-- affiliate_earnings
CREATE POLICY "aff_self_read" ON public.affiliate_earnings FOR SELECT USING (auth.uid() = affiliate_user_id OR public.is_admin(auth.uid()));
CREATE POLICY "aff_admin_all" ON public.affiliate_earnings FOR ALL USING (public.is_admin(auth.uid()));

-- points_history
CREATE POLICY "pts_self_read" ON public.points_history FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "pts_admin_all" ON public.points_history FOR ALL USING (public.is_admin(auth.uid()));

-- cashback_history
CREATE POLICY "cb_self_read" ON public.cashback_history FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "cb_admin_all" ON public.cashback_history FOR ALL USING (public.is_admin(auth.uid()));

-- tickets
CREATE POLICY "tic_self_read" ON public.tickets FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "tic_self_insert" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tic_admin_all" ON public.tickets FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "tmsg_read" ON public.ticket_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR public.is_admin(auth.uid())))
);
CREATE POLICY "tmsg_insert" ON public.ticket_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);

-- coupons
CREATE POLICY "coup_public_read" ON public.coupons FOR SELECT USING (is_active);
CREATE POLICY "coup_admin_all" ON public.coupons FOR ALL USING (public.is_admin(auth.uid()));

-- audit_logs
CREATE POLICY "audit_admin_read" ON public.audit_logs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "audit_self_insert" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- settings
CREATE POLICY "set_public_read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "set_admin_all" ON public.settings FOR ALL USING (public.is_admin(auth.uid()));

-- ===== TRIGGER for new user =====
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== REALTIME =====
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;

-- ===== SEED CATEGORIES + PRODUCTS =====
INSERT INTO public.categories (slug, name, category, icon, sort_order) VALUES
  ('robux', 'Robux', 'robux', 'coins', 1),
  ('mm2', 'MM2 Items', 'mm2', 'knife', 2),
  ('accounts', 'Contas Roblox', 'accounts', 'user', 3),
  ('giftcards', 'Gift Cards', 'giftcards', 'gift', 4),
  ('gamepasses', 'Gamepasses', 'gamepasses', 'ticket', 5),
  ('services', 'Serviços', 'services', 'wrench', 6),
  ('scripts', 'Scripts Premium', 'scripts', 'code', 7);

INSERT INTO public.products (category, name, slug, description, price, original_price, image_url, is_featured) VALUES
  ('robux', '100 Robux', 'robux-100', 'Receba 100 Robux via Gamepass', 3.80, 5.00, 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600', true),
  ('robux', '500 Robux', 'robux-500', 'Pacote de 500 Robux com desconto', 18.00, 25.00, 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600', true),
  ('robux', '1.000 Robux', 'robux-1000', '1.000 Robux entrega imediata', 35.00, 50.00, 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600', true),
  ('mm2', 'Chroma Lightbringer', 'chroma-lightbringer', 'Item lendário do MM2', 45.00, NULL, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600', false),
  ('mm2', 'Chroma Seer', 'chroma-seer', 'Item raro Chroma Seer', 35.00, NULL, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600', false),
  ('accounts', 'Conta Roblox Premium', 'conta-premium', 'Conta com itens raros + premium ativo', 89.90, 120.00, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600', true),
  ('giftcards', 'Gift Card R$25', 'giftcard-25', 'Gift Card Roblox R$25', 28.00, NULL, 'https://images.unsplash.com/photo-1556742400-b5b7c5121f6f?w=600', false),
  ('giftcards', 'Gift Card R$50', 'giftcard-50', 'Gift Card Roblox R$50', 54.00, NULL, 'https://images.unsplash.com/photo-1556742400-b5b7c5121f6f?w=600', false),
  ('services', 'Boost de Level', 'boost-level', 'Suba de nível no seu jogo favorito', 25.00, NULL, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600', false),
  ('scripts', 'Script Blox Fruits VIP', 'script-bf-vip', 'Script premium com auto-farm', 19.90, 30.00, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600', true);

INSERT INTO public.settings (key, value) VALUES
  ('robux_price', '{"per_100": 3.80, "min": 150}'::jsonb),
  ('cashback', '{"percent": 2, "vip_bonus": {"bronze": 0, "silver": 1, "gold": 2, "diamond": 3}}'::jsonb),
  ('affiliate', '{"points_per_brl": 10, "commission_percent": 5}'::jsonb),
  ('site', '{"name": "System Bux", "tagline": "Robux mais barato do Brasil", "support_email": "suporte@systembux.com"}'::jsonb);

INSERT INTO public.announcements (title, body, variant) VALUES
  ('🎉 Promoção de lançamento!', 'Use cupom LANCAMENTO e ganhe 10% OFF em qualquer pedido!', 'promo');
