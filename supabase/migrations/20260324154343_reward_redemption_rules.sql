CREATE TABLE IF NOT EXISTS public.reward_terms_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reward_terms_acceptances_user_version_key UNIQUE(user_id, terms_version)
);

ALTER TABLE public.reward_terms_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own acceptance"
  ON public.reward_terms_acceptances FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own acceptances only"
  ON public.reward_terms_acceptances FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

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

  -- 4. Generate codes
  _voucher_code := 'TVG-' || upper(substr(md5(random()::text), 1, 5));
  _protocol := 'PROTO-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('voucher_protocol_seq')::text, 4, '0');

  -- 5. Insert redemption
  INSERT INTO public.redemptions (user_id, reward_id, points_spent, coupon_code)
  VALUES (_uid, _reward_id, _cost, _voucher_code)
  RETURNING id INTO _redemption_id;

  -- 6. Insert voucher
  INSERT INTO public.vouchers (user_id, reward_id, redemption_id, voucher_code, protocol_number, points_spent)
  VALUES (_uid, _reward_id, _redemption_id, _voucher_code, _protocol, _cost);

  RETURN jsonb_build_object(
    'voucher_code', _voucher_code,
    'protocol_number', _protocol,
    'remaining_points', _remaining
  );
END;
$$;
