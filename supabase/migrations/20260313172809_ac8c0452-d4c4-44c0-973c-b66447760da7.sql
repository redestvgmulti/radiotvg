-- Sequence for protocol numbers
CREATE SEQUENCE voucher_protocol_seq;

-- Vouchers table
CREATE TABLE vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  reward_id uuid NOT NULL REFERENCES rewards(id),
  redemption_id uuid NOT NULL REFERENCES redemptions(id) ON DELETE CASCADE,
  voucher_code text NOT NULL,
  protocol_number text NOT NULL,
  points_spent integer NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','redeemed','expired','cancelled')),
  created_at timestamptz DEFAULT now(),
  redeemed_at timestamptz,
  redeemed_by uuid
);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- RLS: Users read own vouchers
CREATE POLICY "Users can read own vouchers"
  ON vouchers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- RLS: Admins read all vouchers
CREATE POLICY "Admins can read all vouchers"
  ON vouchers FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS: Admins update vouchers
CREATE POLICY "Admins can update vouchers"
  ON vouchers FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function: redeem_reward_voucher (atomic)
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

  -- 1. Fetch reward cost
  SELECT points_cost INTO _cost
  FROM public.rewards
  WHERE id = _reward_id AND is_active = true;

  IF _cost IS NULL THEN
    RAISE EXCEPTION 'Recompensa não encontrada ou inativa';
  END IF;

  -- 2. Atomic points deduction
  UPDATE public.profiles
  SET total_points = total_points - _cost
  WHERE user_id = _uid AND total_points >= _cost
  RETURNING total_points INTO _remaining;

  IF _remaining IS NULL THEN
    RAISE EXCEPTION 'Pontos insuficientes';
  END IF;

  -- 3. Generate codes
  _voucher_code := 'TVG-' || upper(substr(md5(random()::text), 1, 5));
  _protocol := 'PROTO-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('voucher_protocol_seq')::text, 4, '0');

  -- 4. Insert redemption
  INSERT INTO public.redemptions (user_id, reward_id, points_spent, coupon_code)
  VALUES (_uid, _reward_id, _cost, _voucher_code)
  RETURNING id INTO _redemption_id;

  -- 5. Insert voucher
  INSERT INTO public.vouchers (user_id, reward_id, redemption_id, voucher_code, protocol_number, points_spent)
  VALUES (_uid, _reward_id, _redemption_id, _voucher_code, _protocol, _cost);

  RETURN jsonb_build_object(
    'voucher_code', _voucher_code,
    'protocol_number', _protocol,
    'remaining_points', _remaining
  );
END;
$$;

-- Function: get_voucher_export
CREATE OR REPLACE FUNCTION public.get_voucher_export()
RETURNS TABLE(
  protocol_number text,
  voucher_code text,
  display_name text,
  email varchar,
  reward_name text,
  points_spent integer,
  status text,
  created_at timestamptz,
  redeemed_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.protocol_number, v.voucher_code, p.display_name, u.email, r.name AS reward_name,
         v.points_spent, v.status, v.created_at, v.redeemed_at
  FROM public.vouchers v
  JOIN public.profiles p ON p.user_id = v.user_id
  JOIN public.rewards r ON r.id = v.reward_id
  JOIN auth.users u ON u.id = v.user_id
  ORDER BY v.created_at DESC;
$$;