-- O navegador não possui um gateway confiável para criar ou confirmar pedidos.
-- Pedidos e pagamentos só poderão ser criados por um backend autenticado no futuro.
DROP POLICY IF EXISTS "orders_self_insert" ON public.orders;
REVOKE INSERT ON TABLE public.orders, public.payments FROM PUBLIC, anon, authenticated;

-- Um cliente não pode alterar pontos, saldo, total gasto, VIP ou banimento.
REVOKE UPDATE ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE (display_name, avatar_url, banner_url, bio) ON TABLE public.profiles TO authenticated;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- A marca visual "Admin" em mensagens deve corresponder a um papel real.
DROP POLICY IF EXISTS "tmsg_insert" ON public.ticket_messages;
CREATE POLICY "tmsg_insert" ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (NOT is_admin OR public.is_admin((SELECT auth.uid())))
    AND EXISTS (
      SELECT 1 FROM public.tickets AS ticket
      WHERE ticket.id = ticket_id
        AND (ticket.user_id = (SELECT auth.uid()) OR public.is_admin((SELECT auth.uid())))
    )
  );

-- Retira a promoção automática de um e-mail fixo. Perfis administrativos já
-- concedidos continuam intactos; concessões novas exigem operação administrativa.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_username TEXT;
  v_code TEXT;
BEGIN
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_username := v_username || floor(random() * 1000)::text;
  END LOOP;
  v_code := upper(substring(md5(NEW.id::text || random()::text) from 1 for 8));
  INSERT INTO public.profiles (user_id, username, display_name, email, avatar_url, affiliate_code)
  VALUES (NEW.id, v_username, COALESCE(NEW.raw_user_meta_data->>'display_name', v_username), NEW.email,
          'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=' || v_username, v_code);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO public.notifications (user_id, type, title, body, icon)
  VALUES (NEW.id, 'welcome', 'Bem-vindo à System Bux',
    'Sua conta está ativa. Explore o catálogo e acompanhe seus atendimentos.', 'sparkles');
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
