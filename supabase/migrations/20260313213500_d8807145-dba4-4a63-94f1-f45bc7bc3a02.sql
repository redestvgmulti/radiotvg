
CREATE TABLE public.push_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  target text NOT NULL DEFAULT 'all',
  recipients integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'sent',
  onesignal_id text,
  icon_url text DEFAULT '',
  image_url text DEFAULT '',
  link_url text DEFAULT '',
  sent_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.push_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage push_history"
  ON public.push_history
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
