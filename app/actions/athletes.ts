"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardMetrics(coachId: string) {
  const supabase = await createClient();

  const [athletesRes, workoutsRes, checkinsRes, inactiveRes] =
    await Promise.all([
      // Active athletes count
      supabase
        .from("coach_athlete_relationships")
        .select("id", { count: "exact", head: true })
        .eq("coach_id", coachId)
        .eq("status", "active"),

      // Workouts delivered this month
      supabase
        .from("workouts")
        .select("id", { count: "exact", head: true })
        .eq("coach_id", coachId)
        .gte(
          "created_at",
          new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        ),

      // Pending check-ins (no coach review yet — just count all from this week)
      supabase
        .from("weekly_checkins")
        .select("id", { count: "exact", head: true })
        .eq("coach_id", coachId)
        .gte(
          "submitted_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        ),

      // Athletes without workout in 7+ days
      supabase.rpc("get_inactive_athletes_count" as never, {
        p_coach_id: coachId,
      }),
    ]);

  return {
    activeAthletes: athletesRes.count ?? 0,
    workoutsThisMonth: workoutsRes.count ?? 0,
    pendingCheckins: checkinsRes.count ?? 0,
    inactiveAthletes:
      typeof inactiveRes.data === "number" ? inactiveRes.data : 0,
  };
}

export async function getAthletes(coachId: string) {
  const supabase = await createClient();

  const { data: relationships } = await supabase
    .from("coach_athlete_relationships")
    .select(
      `
      status,
      athlete:profiles!coach_athlete_relationships_athlete_id_fkey(
        id, full_name, email, avatar_url, created_at
      )
    `
    )
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });

  if (!relationships) return [];

  // Get last workout date for each athlete
  const athletes = await Promise.all(
    relationships.map(async (rel) => {
      const athlete = rel.athlete as unknown as {
        id: string;
        full_name: string;
        email: string;
        avatar_url: string | null;
        created_at: string;
      };

      const { data: lastWorkout } = await supabase
        .from("workout_logs")
        .select("completed_at")
        .eq("athlete_id", athlete.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

      return {
        id: athlete.id,
        full_name: athlete.full_name,
        email: athlete.email,
        avatar_url: athlete.avatar_url,
        status: rel.status as string,
        last_workout_at: lastWorkout?.completed_at ?? null,
        created_at: athlete.created_at,
      };
    })
  );

  return athletes;
}

export async function getAthleteById(athleteId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", athleteId)
    .single();

  if (!profile) return null;

  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("athlete_id", athleteId)
    .single();

  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, name, status, scheduled_date, created_at")
    .eq("athlete_id", athleteId)
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    profile,
    streak,
    workouts: workouts ?? [],
  };
}

export async function getAthleteCheckins(athleteId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("weekly_checkins")
    .select("*")
    .eq("athlete_id", athleteId)
    .order("week_start", { ascending: false })
    .limit(10);

  return data ?? [];
}
