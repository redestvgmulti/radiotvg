-- 1. Add expires_at column
ALTER TABLE public.vouchers
ADD COLUMN expires_at timestamp with time zone DEFAULT (now() + interval '7 days');

UPDATE public.vouchers 
SET expires_at = created_at + interval '7 days' 
WHERE expires_at IS NULL;

ALTER TABLE public.vouchers 
ALTER COLUMN expires_at SET NOT NULL;

-- 2. Update redeem_reward_voucher to set and return expires_at
CREATE OR REPLACE FUNCTION public.redeem_reward_voucher(_reward_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cost integer;
  _remaining integer;
  _uid uuid;
  _voucher_code text;
  _protocol text;
  _redemption_id uuid;
  _expires_at timestamptz;
BEGIN
  _uid := auth.uid();

  -- 1. Check if already redeemed this week
  IF EXISTS (
    SELECT 1 FROM public.vouchers
    WHERE user_id = _uid
      AND reward_id = _reward_id
      AND created_at >= date_trunc('week', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'
  ) THEN
    RAISE EXCEPTION 'Você já resgatou esta recompensa nesta semana. Tente novamente na próxima semana.';
  END IF;

  -- 2. Fetch reward cost
  SELECT points_cost INTO _cost
  FROM public.rewards
  WHERE id = _reward_id AND is_active = true;

  IF _cost IS NULL THEN
    RAISE EXCEPTION 'Recompensa não encontrada ou inativa';
  END IF;

  -- 3. Atomic points deduction
  UPDATE public.profiles
  SET total_points = total_points - _cost
  WHERE user_id = _uid AND total_points >= _cost
  RETURNING total_points INTO _remaining;

  IF _remaining IS NULL THEN
    RAISE EXCEPTION 'Pontos insuficientes';
  END IF;

  -- 4. Generate codes and expiration
  _voucher_code := 'TVG-' || upper(substr(md5(random()::text), 1, 5));
  _protocol := 'PROTO-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.voucher_protocol_seq')::text, 4, '0');
  _expires_at := now() AT TIME ZONE 'America/Sao_Paulo' + interval '7 days';

  -- 5. Insert redemption
  INSERT INTO public.redemptions (user_id, reward_id, points_spent, coupon_code)
  VALUES (_uid, _reward_id, _cost, _voucher_code)
  RETURNING id INTO _redemption_id;

  -- 6. Insert voucher
  INSERT INTO public.vouchers (user_id, reward_id, redemption_id, voucher_code, protocol_number, points_spent, expires_at)
  VALUES (_uid, _reward_id, _redemption_id, _voucher_code, _protocol, _cost, _expires_at);

  RETURN jsonb_build_object(
    'voucher_code', _voucher_code,
    'protocol_number', _protocol,
    'remaining_points', _remaining,
    'expires_at', _expires_at
  );
END;
$$;

-- 3. Update get_admin_vouchers to handle expires_at and real-time expiration check
DROP FUNCTION IF EXISTS public.get_admin_vouchers();

CREATE OR REPLACE FUNCTION public.get_admin_vouchers()
 RETURNS TABLE(id uuid, protocol_number text, voucher_code text, display_name text, email character varying, reward_name text, points_spent integer, status text, created_at timestamp with time zone, redeemed_at timestamp with time zone, expires_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT v.id, v.protocol_number, v.voucher_code, p.display_name, u.email, r.name AS reward_name,
         v.points_spent, 
         CASE 
           WHEN v.status = 'pending' AND now() > v.expires_at THEN 'expired'
           ELSE v.status
         END as status, 
         v.created_at, v.redeemed_at, v.expires_at
  FROM public.vouchers v
  LEFT JOIN public.profiles p ON p.user_id = v.user_id
  LEFT JOIN public.rewards r ON r.id = v.reward_id
  LEFT JOIN auth.users u ON u.id = v.user_id
  ORDER BY v.created_at DESC;
$function$;

-- 4. Update get_voucher_export mapped to exactly match 
DROP FUNCTION IF EXISTS public.get_voucher_export();

CREATE OR REPLACE FUNCTION public.get_voucher_export()
 RETURNS TABLE(protocol_number text, voucher_code text, display_name text, email character varying, reward_name text, points_spent integer, status text, created_at timestamp with time zone, redeemed_at timestamp with time zone, expires_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT v.protocol_number, v.voucher_code, p.display_name, u.email, r.name AS reward_name,
         v.points_spent, 
         CASE 
           WHEN v.status = 'pending' AND now() > v.expires_at THEN 'expired'
           ELSE v.status
         END as status, 
         v.created_at, v.redeemed_at, v.expires_at
  FROM public.vouchers v
  JOIN public.profiles p ON p.user_id = v.user_id
  JOIN public.rewards r ON r.id = v.reward_id
  JOIN auth.users u ON u.id = v.user_id
  ORDER BY v.created_at DESC;
$function$;
