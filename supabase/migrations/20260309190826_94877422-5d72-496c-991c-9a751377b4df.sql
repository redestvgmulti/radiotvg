
-- =============================================
-- 1. CREATE NEW TABLES
-- =============================================

-- ADS TABLE
CREATE TABLE public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  media_url text NOT NULL DEFAULT '',
  media_type text NOT NULL DEFAULT 'image',
  link_url text NOT NULL DEFAULT '',
  display_duration integer NOT NULL DEFAULT 15,
  station_ids uuid[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active ads" ON public.ads
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins can manage ads" ON public.ads
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- PROFILES TABLE
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  total_points integer NOT NULL DEFAULT 0,
  total_listening_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Auto-insert profile on signup" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- REWARDS TABLE
CREATE TABLE public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL DEFAULT '',
  points_cost integer NOT NULL DEFAULT 0,
  partner text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active rewards" ON public.rewards
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins can manage rewards" ON public.rewards
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- BOOSTERS TABLE
CREATE TABLE public.boosters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  multiplier numeric NOT NULL DEFAULT 1,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.boosters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active boosters" ON public.boosters
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins can manage boosters" ON public.boosters
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- REDEMPTIONS TABLE
CREATE TABLE public.redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_id uuid REFERENCES public.rewards(id) ON DELETE CASCADE NOT NULL,
  points_spent integer NOT NULL DEFAULT 0,
  redeemed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own redemptions" ON public.redemptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own redemptions" ON public.redemptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all redemptions" ON public.redemptions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 2. MODIFY EXISTING TABLES
-- =============================================

-- Add station_id to programs
ALTER TABLE public.programs
  ADD COLUMN station_id uuid REFERENCES public.stream_environments(id);

-- =============================================
-- 3. DROP UNUSED TABLES
-- =============================================

DROP TABLE IF EXISTS public.program_gallery;
DROP TABLE IF EXISTS public.videos;

-- =============================================
-- 4. FIX RLS POLICIES
-- =============================================

-- Fix programs: change public -> authenticated for ALL
DROP POLICY IF EXISTS "Admins can manage programs" ON public.programs;
CREATE POLICY "Admins can manage programs" ON public.programs
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix sponsors: change public -> authenticated for ALL
DROP POLICY IF EXISTS "Admins can manage sponsors" ON public.sponsors;
CREATE POLICY "Admins can manage sponsors" ON public.sponsors
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 5. INDEXES
-- =============================================

CREATE INDEX idx_ads_station_ids ON public.ads USING GIN (station_ids);
CREATE INDEX idx_programs_station_id ON public.programs (station_id);
CREATE INDEX idx_programs_day_of_week ON public.programs (day_of_week);
CREATE INDEX idx_programs_start_time ON public.programs (start_time);
CREATE INDEX idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX idx_redemptions_user_id ON public.redemptions (user_id);
