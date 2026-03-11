
-- 1A. Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Storage policy: authenticated upload to own folder
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policy: public read
CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Storage policy: users can update own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policy: users can delete own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 1C. Add coupon_code to redemptions
ALTER TABLE public.redemptions ADD COLUMN coupon_code text;

-- 1D. Update redeem_reward function with coupon generation
CREATE OR REPLACE FUNCTION public.redeem_reward(_user_id uuid, _reward_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _cost integer;
  _points integer;
  _coupon text;
BEGIN
  SELECT points_cost INTO _cost
  FROM public.rewards
  WHERE id = _reward_id AND is_active = true;

  IF _cost IS NULL THEN
    RAISE EXCEPTION 'Recompensa não encontrada ou inativa';
  END IF;

  SELECT total_points INTO _points
  FROM public.profiles
  WHERE user_id = _user_id;

  IF _points IS NULL THEN
    RAISE EXCEPTION 'Perfil não encontrado';
  END IF;

  IF _points < _cost THEN
    RAISE EXCEPTION 'Pontos insuficientes';
  END IF;

  -- Generate coupon code
  _coupon := 'TVG-' || to_char(now(), 'YYYY') || '-' || upper(substr(md5(random()::text), 1, 4));

  UPDATE public.profiles
  SET total_points = total_points - _cost
  WHERE user_id = _user_id;

  INSERT INTO public.redemptions (user_id, reward_id, points_spent, coupon_code)
  VALUES (_user_id, _reward_id, _cost, _coupon);

  RETURN jsonb_build_object('success', true, 'points_spent', _cost, 'remaining_points', _points - _cost, 'coupon_code', _coupon);
END;
$function$;

-- 1E. Create get_coupon_export function
CREATE OR REPLACE FUNCTION public.get_coupon_export()
RETURNS TABLE(display_name text, email varchar, reward_name text, coupon_code text, redeemed_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.display_name, u.email, r.name AS reward_name, rd.coupon_code, rd.redeemed_at
  FROM public.redemptions rd
  JOIN public.profiles p ON p.user_id = rd.user_id
  JOIN public.rewards r ON r.id = rd.reward_id
  JOIN auth.users u ON u.id = rd.user_id
  ORDER BY rd.redeemed_at DESC;
$$;
