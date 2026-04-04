"use server";

import { createClient } from "@/lib/supabase/server";

// Start or recover an active workout log
export async function startWorkoutLog(workoutId: string, athleteId: string) {
  const supabase = await createClient();

  // Check for existing in-progress log
  const { data: existing } = await supabase
    .from("workout_logs")
    .select("*, set_logs(*)")
    .eq("workout_id", workoutId)
    .eq("athlete_id", athleteId)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) return existing;

  // Create new log
  const { data: newLog, error } = await supabase
    .from("workout_logs")
    .insert({
      workout_id: workoutId,
      athlete_id: athleteId,
      status: "in_progress",
    })
    .select("*, set_logs(*)")
    .single();

  if (error) throw new Error(error.message);
  return newLog;
}

// Log a single set immediately
export async function logSet(data: {
  workout_log_id: string;
  workout_exercise_id: string;
  set_number: number;
  reps_achieved: number | null;
  weight_kg: number | null;
  rpe: number | null;
  completed: boolean;
}) {
  const supabase = await createClient();

  // Check if set already exists
  const { data: existing } = await supabase
    .from("set_logs")
    .select("id")
    .eq("workout_log_id", data.workout_log_id)
    .eq("workout_exercise_id", data.workout_exercise_id)
    .eq("set_number", data.set_number)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("set_logs")
      .update({
        reps_achieved: data.reps_achieved,
        weight_kg: data.weight_kg,
        rpe: data.rpe,
        completed: data.completed,
        logged_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) throw new Error(error.message);
    return existing.id;
  }

  const { data: newSet, error } = await supabase
    .from("set_logs")
    .insert({
      workout_log_id: data.workout_log_id,
      workout_exercise_id: data.workout_exercise_id,
      set_number: data.set_number,
      reps_achieved: data.reps_achieved,
      weight_kg: data.weight_kg,
      rpe: data.rpe,
      completed: data.completed,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return newSet?.id;
}

// Complete workout log
export async function completeWorkout(logId: string, athleteId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_logs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", logId);

  if (error) throw new Error(error.message);

  // Update streak
  await updateStreak(athleteId);
}

// Get previous set data for auto-fill
export async function getPreviousSetData(
  exerciseId: string,
  athleteId: string
) {
  const supabase = await createClient();

  // Find the most recent completed log for this athlete
  const { data: logs } = await supabase
    .from("workout_logs")
    .select("id")
    .eq("athlete_id", athleteId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(5);

  if (!logs || logs.length === 0) return null;

  const logIds = logs.map((l) => l.id);

  // Find workout_exercises that use this exercise
  const { data: wExercises } = await supabase
    .from("workout_exercises")
    .select("id")
    .eq("exercise_id", exerciseId);

  if (!wExercises || wExercises.length === 0) return null;

  const weIds = wExercises.map((we) => we.id);

  // Find the most recent set log
  const { data: setLog } = await supabase
    .from("set_logs")
    .select("weight_kg, reps_achieved")
    .in("workout_log_id", logIds)
    .in("workout_exercise_id", weIds)
    .eq("completed", true)
    .order("logged_at", { ascending: false })
    .limit(1)
    .single();

  return setLog ?? null;
}

// Update athlete streak
async function updateStreak(athleteId: string) {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Get current streak record
  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("athlete_id", athleteId)
    .single();

  if (!streak) {
    // Create first streak
    await supabase.from("streaks").insert({
      athlete_id: athleteId,
      current_streak: 1,
      longest_streak: 1,
      last_workout_date: todayStr,
    });
  } else {
    const lastDate = streak.last_workout_date;

    let newStreak = streak.current_streak;

    if (lastDate === todayStr) {
      // Already worked out today — no change
      return;
    } else if (lastDate === yesterdayStr) {
      // Consecutive day
      newStreak = streak.current_streak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, streak.longest_streak);

    await supabase
      .from("streaks")
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_workout_date: todayStr,
        updated_at: new Date().toISOString(),
      })
      .eq("id", streak.id);
  }

  // Check for achievements
  await checkAchievements(athleteId);
}

// Check and grant achievements
async function checkAchievements(athleteId: string) {
  const supabase = await createClient();

  // Count completed workouts
  const { count } = await supabase
    .from("workout_logs")
    .select("id", { count: "exact", head: true })
    .eq("athlete_id", athleteId)
    .eq("status", "completed");

  const totalWorkouts = count ?? 0;

  // Map achievement keys to conditions
  const achievementChecks: { key: string; condition: boolean }[] = [
    { key: "first_workout", condition: totalWorkouts >= 1 },
    { key: "one_week_streak", condition: false }, // checked via streak
    { key: "one_month_streak", condition: false },
  ];

  // Check streak-based achievements
  const { data: streak } = await supabase
    .from("streaks")
    .select("current_streak")
    .eq("athlete_id", athleteId)
    .single();

  if (streak) {
    achievementChecks[1].condition = streak.current_streak >= 7;
    achievementChecks[2].condition = streak.current_streak >= 30;
  }

  for (const check of achievementChecks) {
    if (!check.condition) continue;

    // Find achievement by key
    const { data: achievement } = await supabase
      .from("achievements")
      .select("id")
      .eq("key", check.key)
      .single();

    if (!achievement) continue;

    // Check if already earned
    const { data: existing } = await supabase
      .from("athlete_achievements")
      .select("id")
      .eq("athlete_id", athleteId)
      .eq("achievement_id", achievement.id)
      .single();

    if (!existing) {
      await supabase.from("athlete_achievements").insert({
        athlete_id: athleteId,
        achievement_id: achievement.id,
      });
    }
  }
}
