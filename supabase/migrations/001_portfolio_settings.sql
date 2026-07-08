-- Sudeis Fedlu Portfolio — run once in Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard → your project → SQL → New query

CREATE TABLE IF NOT EXISTS portfolio_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT 'null'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS portfolio_settings_updated_at_idx
  ON portfolio_settings (updated_at DESC);

ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;

-- Public read for site content only (writes go through your server + service role key)
DROP POLICY IF EXISTS "Allow public read of portfolio content" ON portfolio_settings;
CREATE POLICY "Allow public read of portfolio content" ON portfolio_settings
  FOR SELECT
  USING (key IN ('heroImage', 'aboutImage', 'projects', 'resumeSourceSettings', 'resumeData'));

-- Keys stored by this app (via server using SUPABASE_SERVICE_ROLE_KEY):
--   heroImage, aboutImage, projects, inquiries
--   resumeSourceSettings, resumeData
--   adminEmail, passcodeHash
--   (legacy) passcode

-- Optional: seed empty rows so the CMS has a place to write immediately
INSERT INTO portfolio_settings (key, value) VALUES
  ('heroImage', 'null'::jsonb),
  ('aboutImage', 'null'::jsonb),
  ('projects', '[]'::jsonb),
  ('inquiries', '[]'::jsonb),
  ('resumeSourceSettings', 'null'::jsonb),
  ('resumeData', 'null'::jsonb)
ON CONFLICT (key) DO NOTHING;
