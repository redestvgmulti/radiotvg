
-- Create storage bucket for radio assets
INSERT INTO storage.buckets (id, name, public) VALUES ('radio-assets', 'radio-assets', true);

-- Public read access
CREATE POLICY "Public read radio assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'radio-assets');

-- Admin upload/update/delete
CREATE POLICY "Admins can upload radio assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'radio-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update radio assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'radio-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete radio assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'radio-assets' AND has_role(auth.uid(), 'admin'::app_role));

-- Add image settings
INSERT INTO public.radio_settings (key, value, label, category) VALUES
  ('logo_url', '', 'Logo da Rádio', 'imagens'),
  ('hero_image_url', '', 'Imagem Hero', 'imagens'),
  ('favicon_url', '', 'Favicon', 'imagens');
