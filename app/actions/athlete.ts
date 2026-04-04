"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAthleteWorkouts(athleteId: string, status?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("workouts")
    .select(
      `*, coach:profiles!workouts_coach_id_fkey(id, full_name, avatar_url)`
    )
    .eq("athlete_id", athleteId)
    .order("scheduled_date", { ascending: true, nullsFirst: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getWorkoutDetail(workoutId: string) {
  const supabase = await createClient();

  const { data: workout } = await supabase
    .from("workouts")
    .select(
      `*, coach:profiles!workouts_coach_id_fkey(id, full_name, avatar_url)`
    )
    .eq("id", workoutId)
    .single();

  if (!workout) return null;

  const { data: exercises } = await supabase
    .from("workout_exercises")
    .select(`*, exercise:exercise_library(*)`)
    .eq("workout_id", workoutId)
    .order("order_index");

  return { workout, exercises: exercises ?? [] };
}

export async function getTodayWorkout(athleteId: string) {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("workouts")
    .select(
      `*, workout_exercises(id)`
    )
    .eq("athlete_id", athleteId)
    .eq("scheduled_date", today)
    .in("status", ["active", "draft"])
    .limit(1)
    .single();

  return data ?? null;
}

export async function getAthleteStreak(athleteId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak")
    .eq("athlete_id", athleteId)
    .single();

  return data ?? { current_streak: 0, longest_streak: 0 };
}

export async function getUpcomingWorkouts(athleteId: string) {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("workouts")
    .select("id, name, day_label, scheduled_date")
    .eq("athlete_id", athleteId)
    .in("status", ["active", "draft"])
    .gte("scheduled_date", today)
    .order("scheduled_date", { ascending: true })
    .limit(5);

  return data ?? [];
}

export async function getThisWeekCheckin(athleteId: string) {
  const supabase = await createClient();

  // Get Monday of current week
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const weekStart = monday.toISOString().split("T")[0];

  const { data } = await supabase
    .from("weekly_checkins")
    .select("*")
    .eq("athlete_id", athleteId)
    .eq("week_start", weekStart)
    .single();

  return data ?? null;
}

export async function submitCheckin(data: {
  athlete_id: string;
  coach_id: string;
  body_weight_kg: number | null;
  energy_level: number | null;
  sleep_quality: number | null;
  pain_areas: string | null;
  notes: string | null;
}) {
  const supabase = await createClient();

  // Calculate week start (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const weekStart = monday.toISOString().split("T")[0];

  // Check if already submitted
  const { data: existing } = await supabase
    .from("weekly_checkins")
    .select("id")
    .eq("athlete_id", data.athlete_id)
    .eq("week_start", weekStart)
    .single();

  if (existing) {
    throw new Error("Check-in desta semana já foi enviado.");
  }

  const { error } = await supabase.from("weekly_checkins").insert({
    athlete_id: data.athlete_id,
    coach_id: data.coach_id,
    week_start: weekStart,
    body_weight_kg: data.body_weight_kg,
    energy_level: data.energy_level,
    sleep_quality: data.sleep_quality,
    pain_areas: data.pain_areas,
    notes: data.notes,
  });

  if (error) throw new Error(error.message);
}

export async function getAthleteCoach(athleteId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("coach_athlete_relationships")
    .select(`coach:profiles!coach_athlete_relationships_coach_id_fkey(id, full_name, avatar_url)`)
    .eq("athlete_id", athleteId)
    .eq("status", "active")
    .limit(1)
    .single();

  return data?.coach ?? null;
}

export async function getAthleteProfileData(athleteId: string) {
  const supabase = await createClient();

  const [profileRes, anamnesisRes, streakRes, lastWorkoutRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, phone")
        .eq("id", athleteId)
        .single(),
      supabase
        .from("athlete_anamnesis")
        .select("primary_goal, days_per_week")
        .eq("athlete_id", athleteId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("streaks")
        .select("current_streak, longest_streak")
        .eq("athlete_id", athleteId)
        .single(),
      supabase
        .from("workout_logs")
        .select("completed_at")
        .eq("athlete_id", athleteId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

  return {
    profile: profileRes.data,
    anamnesis: anamnesisRes.data,
    streak: streakRes.data ?? { current_streak: 0, longest_streak: 0 },
    lastWorkoutDate: lastWorkoutRes.data?.completed_at ?? null,
  };
}

export async function updateAthleteProfile(
  athleteId: string,
  updates: { full_name?: string; phone?: string | null }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", athleteId);

  if (error) throw new Error(error.message);
}
