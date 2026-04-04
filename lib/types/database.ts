// Database types for Arthur Armelin Treinador
// Auto-mapped from supabase/migrations/001_initial_schema.sql

// --- Enums ---

export type UserRole = "coach" | "athlete";
export type RelationshipStatus = "active" | "inactive" | "pending";
export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "glutes"
  | "abs"
  | "full_body";
export type EquipmentType =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "bodyweight"
  | "resistance_band"
  | "kettlebell";
export type WorkoutGoal =
  | "hypertrophy"
  | "fat_loss"
  | "strength"
  | "endurance"
  | "general";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type WorkoutStatus = "draft" | "active" | "completed" | "archived";
export type LogStatus = "in_progress" | "completed" | "skipped";

// --- Tables ---

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachAthleteRelationship {
  id: string;
  coach_id: string;
  athlete_id: string;
  status: RelationshipStatus;
  started_at: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  equipment: EquipmentType;
  instructions: string | null;
  video_url: string | null;
  created_by: string | null;
  is_custom: boolean;
  created_at: string;
}

export interface WorkoutTemplate {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  goal: WorkoutGoal;
  level: ExperienceLevel;
  days_per_week: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: string;
  template_id: string | null;
  coach_id: string;
  athlete_id: string;
  name: string;
  day_label: string | null;
  week_number: number;
  scheduled_date: string | null;
  status: WorkoutStatus;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  sets: number;
  reps_min: number | null;
  reps_max: number | null;
  rest_seconds: number;
  notes: string | null;
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  workout_id: string;
  athlete_id: string;
  started_at: string;
  completed_at: string | null;
  status: LogStatus;
  notes: string | null;
  created_at: string;
}

export interface SetLog {
  id: string;
  workout_log_id: string;
  workout_exercise_id: string;
  set_number: number;
  reps_achieved: number | null;
  weight_kg: number | null;
  rpe: number | null;
  completed: boolean;
  logged_at: string;
}

export interface WeeklyCheckin {
  id: string;
  athlete_id: string;
  coach_id: string;
  week_start: string;
  body_weight_kg: number | null;
  energy_level: number | null;
  sleep_quality: number | null;
  pain_areas: string | null;
  notes: string | null;
  submitted_at: string;
}

export interface ProgressPhoto {
  id: string;
  athlete_id: string;
  photo_url: string;
  photo_date: string;
  notes: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface AthleteAchievement {
  id: string;
  athlete_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface Streak {
  id: string;
  athlete_id: string;
  current_streak: number;
  longest_streak: number;
  last_workout_date: string | null;
  updated_at: string;
}

export interface InviteToken {
  id: string;
  token: string;
  coach_id: string;
  email: string | null;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

// --- Database schema type (for Supabase client) ---

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> &
          Partial<Pick<Profile, "created_at" | "updated_at">>;
        Update: Partial<Profile>;
      };
      coach_athlete_relationships: {
        Row: CoachAthleteRelationship;
        Insert: Omit<CoachAthleteRelationship, "id" | "started_at" | "created_at"> &
          Partial<Pick<CoachAthleteRelationship, "id" | "status" | "started_at" | "created_at">>;
        Update: Partial<CoachAthleteRelationship>;
      };
      exercise_library: {
        Row: Exercise;
        Insert: Omit<Exercise, "id" | "created_at"> &
          Partial<Pick<Exercise, "id" | "equipment" | "is_custom" | "created_at">>;
        Update: Partial<Exercise>;
      };
      workout_templates: {
        Row: WorkoutTemplate;
        Insert: Omit<WorkoutTemplate, "id" | "created_at" | "updated_at"> &
          Partial<Pick<WorkoutTemplate, "id" | "goal" | "level" | "is_active" | "created_at" | "updated_at">>;
        Update: Partial<WorkoutTemplate>;
      };
      workouts: {
        Row: Workout;
        Insert: Omit<Workout, "id" | "created_at" | "updated_at"> &
          Partial<Pick<Workout, "id" | "week_number" | "status" | "created_at" | "updated_at">>;
        Update: Partial<Workout>;
      };
      workout_exercises: {
        Row: WorkoutExercise;
        Insert: Omit<WorkoutExercise, "id" | "created_at"> &
          Partial<Pick<WorkoutExercise, "id" | "sets" | "rest_seconds" | "created_at">>;
        Update: Partial<WorkoutExercise>;
      };
      workout_logs: {
        Row: WorkoutLog;
        Insert: Omit<WorkoutLog, "id" | "started_at" | "created_at"> &
          Partial<Pick<WorkoutLog, "id" | "status" | "started_at" | "created_at">>;
        Update: Partial<WorkoutLog>;
      };
      set_logs: {
        Row: SetLog;
        Insert: Omit<SetLog, "id" | "logged_at"> &
          Partial<Pick<SetLog, "id" | "completed" | "logged_at">>;
        Update: Partial<SetLog>;
      };
      weekly_checkins: {
        Row: WeeklyCheckin;
        Insert: Omit<WeeklyCheckin, "id" | "submitted_at"> &
          Partial<Pick<WeeklyCheckin, "id" | "submitted_at">>;
        Update: Partial<WeeklyCheckin>;
      };
      progress_photos: {
        Row: ProgressPhoto;
        Insert: Omit<ProgressPhoto, "id" | "photo_date" | "created_at"> &
          Partial<Pick<ProgressPhoto, "id" | "photo_date" | "created_at">>;
        Update: Partial<ProgressPhoto>;
      };
      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, "id" | "created_at"> &
          Partial<Pick<Achievement, "id" | "created_at">>;
        Update: Partial<Achievement>;
      };
      athlete_achievements: {
        Row: AthleteAchievement;
        Insert: Omit<AthleteAchievement, "id" | "earned_at"> &
          Partial<Pick<AthleteAchievement, "id" | "earned_at">>;
        Update: Partial<AthleteAchievement>;
      };
      streaks: {
        Row: Streak;
        Insert: Omit<Streak, "id" | "updated_at"> &
          Partial<Pick<Streak, "id" | "current_streak" | "longest_streak" | "updated_at">>;
        Update: Partial<Streak>;
      };
      invite_tokens: {
        Row: InviteToken;
        Insert: Omit<InviteToken, "id" | "token" | "expires_at" | "created_at"> &
          Partial<Pick<InviteToken, "id" | "token" | "expires_at" | "created_at">>;
        Update: Partial<InviteToken>;
      };
    };
    Enums: {
      user_role: UserRole;
      relationship_status: RelationshipStatus;
      muscle_group: MuscleGroup;
      equipment_type: EquipmentType;
      workout_goal: WorkoutGoal;
      experience_level: ExperienceLevel;
      workout_status: WorkoutStatus;
      log_status: LogStatus;
    };
  };
}
