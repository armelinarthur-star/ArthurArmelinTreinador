-- Allow coaches to read their athletes' anamnesis data
CREATE POLICY "anamnesis_coach_read" ON athlete_anamnesis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM coach_athlete_relationships
      WHERE coach_id = auth.uid()
        AND athlete_id = athlete_anamnesis.athlete_id
        AND status = 'active'
    )
  );
