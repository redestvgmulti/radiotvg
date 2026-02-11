
-- Create sponsors table
CREATE TABLE public.sponsors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  image_url text NOT NULL DEFAULT '',
  link_url text NOT NULL DEFAULT '',
  display_time integer NOT NULL DEFAULT 15 CHECK (display_time IN (15, 30, 45)),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Public read active sponsors
CREATE POLICY "Anyone can read active sponsors"
ON public.sponsors FOR SELECT
USING (is_active = true);

-- Admins full access
CREATE POLICY "Admins can manage sponsors"
ON public.sponsors FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_sponsors_updated_at
BEFORE UPDATE ON public.sponsors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
