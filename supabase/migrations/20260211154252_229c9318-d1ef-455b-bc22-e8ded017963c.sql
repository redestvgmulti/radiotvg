
-- Create a key-value settings table for radio configuration
CREATE TABLE public.radio_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'geral',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.radio_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read settings"
ON public.radio_settings
FOR SELECT
USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings"
ON public.radio_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_radio_settings_updated_at
BEFORE UPDATE ON public.radio_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default settings
INSERT INTO public.radio_settings (key, value, label, category) VALUES
  ('radio_name', 'Rádio TVG', 'Nome da Rádio', 'geral'),
  ('radio_slogan', 'A sua rádio gospel!', 'Slogan', 'geral'),
  ('radio_email', 'contato@radiotvg.com', 'E-mail de contato', 'contato'),
  ('radio_whatsapp', '', 'WhatsApp', 'contato'),
  ('radio_instagram', '', 'Instagram', 'redes_sociais'),
  ('radio_facebook', '', 'Facebook', 'redes_sociais'),
  ('radio_youtube', '', 'YouTube', 'redes_sociais'),
  ('maintenance_mode', 'false', 'Modo manutenção', 'sistema'),
  ('welcome_message', 'Bem-vindo à Rádio TVG!', 'Mensagem de boas-vindas', 'geral');
