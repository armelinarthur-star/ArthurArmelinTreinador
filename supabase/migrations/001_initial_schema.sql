-- Sprint 1.2 — Schema completo Arthur Armelin Treinador
-- Executar no Supabase SQL Editor

--- ENUMS ---
CREATE TYPE user_role AS ENUM ('coach', 'athlete');
CREATE TYPE relationship_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE muscle_group AS ENUM ('chest','back','shoulders','biceps','triceps','legs','glutes','abs','full_body');
CREATE TYPE equipment_type AS ENUM ('barbell','dumbbell','machine','cable','bodyweight','resistance_band','kettlebell');
CREATE TYPE workout_goal AS ENUM ('hypertrophy','fat_loss','strength','endurance','general');
CREATE TYPE experience_level AS ENUM ('beginner','intermediate','advanced');
CREATE TYPE workout_status AS ENUM ('draft','active','completed','archived');
CREATE TYPE log_status AS ENUM ('in_progress','completed','skipped');

--- TABELAS ---

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'athlete',
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coach_athlete_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status relationship_status DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coach_id, athlete_id)
);

CREATE TABLE exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group muscle_group NOT NULL,
  equipment equipment_type NOT NULL DEFAULT 'bodyweight',
  instructions TEXT,
  video_url TEXT,
  created_by UUID REFERENCES profiles(id),
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal workout_goal DEFAULT 'general',
  level experience_level DEFAULT 'beginner',
  days_per_week INT CHECK (days_per_week BETWEEN 1 AND 7),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workout_templates(id),
  coach_id UUID NOT NULL REFERENCES profiles(id),
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  day_label TEXT,
  week_number INT DEFAULT 1,
  scheduled_date DATE,
  status workout_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercise_library(id),
  order_index INT NOT NULL,
  sets INT NOT NULL DEFAULT 3,
  reps_min INT,
  reps_max INT,
  rest_seconds INT DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id),
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status log_status DEFAULT 'in_progress',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
  workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id),
  set_number INT NOT NULL,
  reps_achieved INT,
  weight_kg DECIMAL(6,2),
  rpe INT CHECK (rpe BETWEEN 1 AND 10),
  completed BOOLEAN DEFAULT FALSE,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE weekly_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  coach_id UUID NOT NULL REFERENCES profiles(id),
  week_start DATE NOT NULL,
  body_weight_kg DECIMAL(5,2),
  energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 5),
  pain_areas TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(athlete_id, week_start)
);

CREATE TABLE progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  photo_url TEXT NOT NULL,
  photo_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE athlete_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id),
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(athlete_id, achievement_id)
);

CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID UNIQUE NOT NULL REFERENCES profiles(id),
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_workout_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  coach_id UUID NOT NULL REFERENCES profiles(id),
  email TEXT,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--- ÍNDICES ---
CREATE INDEX idx_workouts_athlete ON workouts(athlete_id);
CREATE INDEX idx_workouts_coach ON workouts(coach_id);
CREATE INDEX idx_workout_logs_athlete ON workout_logs(athlete_id);
CREATE INDEX idx_set_logs_log ON set_logs(workout_log_id);
CREATE INDEX idx_relationships_coach ON coach_athlete_relationships(coach_id);
CREATE INDEX idx_checkins_athlete ON weekly_checkins(athlete_id);

--- TRIGGER: auto-criar perfil ao registrar ---
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'athlete')
  );
  INSERT INTO streaks (athlete_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

--- ROW LEVEL SECURITY ---
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_athlete_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;

--- POLÍTICAS RLS ---
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "profiles_coach_view" ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM coach_athlete_relationships
    WHERE coach_id = auth.uid() AND athlete_id = profiles.id
  ));

CREATE POLICY "workouts_coach" ON workouts FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "workouts_athlete" ON workouts FOR SELECT USING (athlete_id = auth.uid());

CREATE POLICY "logs_athlete" ON workout_logs FOR ALL USING (athlete_id = auth.uid());
CREATE POLICY "set_logs_athlete" ON set_logs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM workout_logs wl
    WHERE wl.id = set_logs.workout_log_id AND wl.athlete_id = auth.uid()
  ));

CREATE POLICY "exercises_read" ON exercise_library FOR SELECT USING (true);
CREATE POLICY "exercises_coach_insert" ON exercise_library FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "checkins_athlete_insert" ON weekly_checkins FOR INSERT
  WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "checkins_read" ON weekly_checkins FOR SELECT
  USING (coach_id = auth.uid() OR athlete_id = auth.uid());

CREATE POLICY "streaks_own" ON streaks FOR ALL USING (athlete_id = auth.uid());
CREATE POLICY "achievements_read" ON achievements FOR SELECT USING (true);
CREATE POLICY "athlete_achievements_own" ON athlete_achievements FOR ALL
  USING (athlete_id = auth.uid());
CREATE POLICY "invites_coach" ON invite_tokens FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "invites_public_read" ON invite_tokens FOR SELECT USING (true);

--- SEED: 20 exercícios base ---
INSERT INTO exercise_library (name, muscle_group, equipment, instructions) VALUES
('Supino Reto com Barra','chest','barbell','Deite no banco, barra na largura dos ombros, desça até o peito e empurre.'),
('Supino Inclinado com Halteres','chest','dumbbell','Banco inclinado 30-45°, desça controladamente até a linha do peito.'),
('Crossover no Cabo','chest','cable','Puxe os cabos de cima cruzando na frente do corpo, contraindo o peitoral.'),
('Puxada Frontal','back','machine','Segure a barra larga, puxe até a clavícula contraindo as costas.'),
('Remada Curvada com Barra','back','barbell','Tronco a 45°, puxe a barra até o abdômen mantendo as costas retas.'),
('Remada Unilateral com Haltere','back','dumbbell','Apoie um joelho no banco, puxe o haltere até o quadril.'),
('Desenvolvimento com Barra','shoulders','barbell','Empurre a barra acima da cabeça com os cotovelos à frente do tronco.'),
('Elevação Lateral','shoulders','dumbbell','Eleve os halteres lateralmente até a altura dos ombros, cotovelos levemente dobrados.'),
('Rosca Direta com Barra','biceps','barbell','Cotovelos fixos no corpo, flexione os antebraços trazendo a barra ao peito.'),
('Rosca Alternada com Haltere','biceps','dumbbell','Alternando os braços, flexione cada antebraço com supinação no final.'),
('Tríceps Testa','triceps','barbell','Deitado, desça a barra até a testa e estenda completamente.'),
('Tríceps no Cabo','triceps','cable','Puxe o cabo para baixo estendendo o cotovelo, mantendo os cotovelos fixos.'),
('Agachamento Livre','legs','barbell','Barra nas costas, desça até 90° ou abaixo, joelho alinhado com o pé.'),
('Leg Press 45°','legs','machine','Pés na plataforma, desça até 90° de flexão no joelho e empurre.'),
('Cadeira Extensora','legs','machine','Estenda os joelhos completamente e retorne controlado.'),
('Mesa Flexora','legs','machine','Flexione os joelhos trazendo os calcanhares ao glúteo.'),
('Stiff com Halteres','glutes','dumbbell','Joelhos levemente flexionados, desça os halteres pela frente das pernas sentindo o glúteo.'),
('Hip Thrust com Barra','glutes','barbell','Apoiado no banco, empurre o quadril para cima contraindo o glúteo no topo.'),
('Abdominal Supra','abs','bodyweight','Deitado com joelhos dobrados, eleve o tronco contraindo o abdômen.'),
('Prancha Isométrica','abs','bodyweight','Posição de apoio nos antebraços, corpo reto, mantenha por X segundos.');

--- SEED: conquistas base ---
INSERT INTO achievements (key, name, description, icon) VALUES
('first_workout','Primeira Conquista','Completou o primeiro treino','🏆'),
('streak_7','Semana Perfeita','7 dias consecutivos de treino','🔥'),
('streak_30','Mês Dedicado','30 dias consecutivos de treino','💎'),
('workouts_10','10 Treinos','Completou 10 treinos','💪'),
('workouts_50','50 Treinos','Completou 50 treinos','🦾'),
('checkin_4','Consistente','4 check-ins semanais enviados','📊');
