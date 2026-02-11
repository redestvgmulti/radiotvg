
-- Gallery items per program (independent from videos table)
CREATE TABLE public.program_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  thumbnail_url TEXT DEFAULT '',
  media_url TEXT DEFAULT '',
  media_type TEXT NOT NULL DEFAULT 'video',
  duration TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.program_gallery ENABLE ROW LEVEL SECURITY;

-- Public read for active items
CREATE POLICY "Anyone can read active gallery items"
ON public.program_gallery
FOR SELECT
USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage gallery"
ON public.program_gallery
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookup by program
CREATE INDEX idx_program_gallery_program_id ON public.program_gallery(program_id);

-- Timestamp trigger
CREATE TRIGGER update_program_gallery_updated_at
BEFORE UPDATE ON public.program_gallery
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
