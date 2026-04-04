CREATE TABLE athlete_anamnesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  birth_date DATE,
  sex TEXT,
  height_cm DECIMAL(5,1),
  weight_kg DECIMAL(5,2),
  body_fat_pct DECIMAL(4,1),
  primary_goal TEXT,
  experience_level TEXT,
  days_per_week INT,
  health_conditions TEXT[],
  movement_restrictions TEXT,
  activity_level TEXT,
  sleep_quality TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE athlete_anamnesis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anamnesis_own" ON athlete_anamnesis
  FOR ALL USING (athlete_id = auth.uid());
