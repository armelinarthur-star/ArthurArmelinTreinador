-- Add granular leg muscle groups to enum
ALTER TYPE muscle_group ADD VALUE IF NOT EXISTS 'quadriceps';
ALTER TYPE muscle_group ADD VALUE IF NOT EXISTS 'hamstrings';
ALTER TYPE muscle_group ADD VALUE IF NOT EXISTS 'calves';

-- Junction table: each exercise can target multiple muscle groups with a weight (0.5–1.0)
-- Weight represents how much a set of this exercise "counts" toward that muscle group
-- Example: Squat → glutes 1.0, quadriceps 1.0, hamstrings 0.5
CREATE TABLE exercise_muscle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercise_library(id) ON DELETE CASCADE,
  muscle_group muscle_group NOT NULL,
  set_weight DECIMAL(2,1) NOT NULL DEFAULT 1.0
    CHECK (set_weight >= 0.5 AND set_weight <= 1.0),
  UNIQUE(exercise_id, muscle_group)
);

ALTER TABLE exercise_muscle_groups ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "muscle_groups_read" ON exercise_muscle_groups
  FOR SELECT USING (true);

-- Only coaches can write
CREATE POLICY "muscle_groups_write" ON exercise_muscle_groups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach')
  );

-- Seed existing exercises: copy their single muscle_group as weight 1.0
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group, set_weight)
SELECT id, muscle_group, 1.0 FROM exercise_library
ON CONFLICT DO NOTHING;
