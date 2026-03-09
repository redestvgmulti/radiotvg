
-- 1. Create atomic redeem_reward function
CREATE OR REPLACE FUNCTION public.redeem_reward(_user_id uuid, _reward_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cost integer;
  _points integer;
BEGIN
  -- Get reward cost
  SELECT points_cost INTO _cost
  FROM public.rewards
  WHERE id = _reward_id AND is_active = true;

  IF _cost IS NULL THEN
    RAISE EXCEPTION 'Recompensa não encontrada ou inativa';
  END IF;

  -- Get user points
  SELECT total_points INTO _points
  FROM public.profiles
  WHERE user_id = _user_id;

  IF _points IS NULL THEN
    RAISE EXCEPTION 'Perfil não encontrado';
  END IF;

  IF _points < _cost THEN
    RAISE EXCEPTION 'Pontos insuficientes';
  END IF;

  -- Deduct points
  UPDATE public.profiles
  SET total_points = total_points - _cost
  WHERE user_id = _user_id;

  -- Insert redemption
  INSERT INTO public.redemptions (user_id, reward_id, points_spent)
  VALUES (_user_id, _reward_id, _cost);

  RETURN jsonb_build_object('success', true, 'points_spent', _cost, 'remaining_points', _points - _cost);
END;
$$;

-- 2. Drop sponsors table
DROP TABLE IF EXISTS public.sponsors;
