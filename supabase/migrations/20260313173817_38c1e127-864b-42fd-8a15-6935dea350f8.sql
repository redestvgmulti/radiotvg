CREATE TABLE instagram_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active posts"
  ON instagram_posts FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage posts"
  ON instagram_posts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));