"use server";

import { createClient } from "@/lib/supabase/server";
import type { MuscleGroup } from "@/lib/types/database";

export interface WorkoutExerciseInput {
  exercise_id: string;
  order_index: number;
  sets: number;
  reps_min: number | null;
  reps_max: number | null;
  rest_seconds: number;
  notes: string | null;
}

export interface CreateWorkoutInput {
  coach_id: string;
  athlete_id: string;
  name: string;
  day_label: string | null;
  goal: string;
  scheduled_date: string | null;
  week_number: number;
  status: "draft" | "active";
  exercises: WorkoutExerciseInput[];
}

export async function createWorkout(data: CreateWorkoutInput) {
  const supabase = await createClient();

  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      coach_id: data.coach_id,
      athlete_id: data.athlete_id,
      name: data.name,
      day_label: data.day_label,
      scheduled_date: data.scheduled_date,
      week_number: data.week_number,
      status: data.status,
    })
    .select("id")
    .single();

  if (workoutError || !workout) throw new Error(workoutError?.message ?? "Erro ao criar treino");

  if (data.exercises.length > 0) {
    const exerciseRows = data.exercises.map((ex) => ({
      workout_id: workout.id,
      exercise_id: ex.exercise_id,
      order_index: ex.order_index,
      sets: ex.sets,
      reps_min: ex.reps_min,
      reps_max: ex.reps_max,
      rest_seconds: ex.rest_seconds,
      notes: ex.notes,
    }));

    const { error: exError } = await supabase
      .from("workout_exercises")
      .insert(exerciseRows);

    if (exError) throw new Error(exError.message);
  }

  return workout.id;
}

export async function updateWorkout(
  workoutId: string,
  data: Partial<CreateWorkoutInput> & { exercises?: WorkoutExerciseInput[] }
) {
  const supabase = await createClient();

  const { exercises, coach_id, ...workoutFields } = data;

  if (Object.keys(workoutFields).length > 0) {
    const { error } = await supabase
      .from("workouts")
      .update({
        ...workoutFields,
        updated_at: new Date().toISOString(),
      })
      .eq("id", workoutId);

    if (error) throw new Error(error.message);
  }

  if (exercises) {
    await supabase
      .from("workout_exercises")
      .delete()
      .eq("workout_id", workoutId);

    if (exercises.length > 0) {
      const rows = exercises.map((ex) => ({
        workout_id: workoutId,
        exercise_id: ex.exercise_id,
        order_index: ex.order_index,
        sets: ex.sets,
        reps_min: ex.reps_min,
        reps_max: ex.reps_max,
        rest_seconds: ex.rest_seconds,
        notes: ex.notes,
      }));

      const { error } = await supabase
        .from("workout_exercises")
        .insert(rows);

      if (error) throw new Error(error.message);
    }
  }
}

export async function archiveWorkout(workoutId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workouts")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", workoutId);

  if (error) throw new Error(error.message);
}

export async function duplicateWorkout(workoutId: string, coachId: string) {
  const supabase = await createClient();

  const { data: original } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", workoutId)
    .single();

  if (!original) throw new Error("Treino não encontrado");

  const { data: newWorkout, error: wErr } = await supabase
    .from("workouts")
    .insert({
      coach_id: coachId,
      athlete_id: original.athlete_id,
      name: `${original.name} (Cópia)`,
      day_label: original.day_label,
      week_number: original.week_number,
      status: "draft",
    })
    .select("id")
    .single();

  if (wErr || !newWorkout) throw new Error(wErr?.message ?? "Erro ao duplicar");

  const { data: exercises } = await supabase
    .from("workout_exercises")
    .select("*")
    .eq("workout_id", workoutId)
    .order("order_index");

  if (exercises && exercises.length > 0) {
    const rows = exercises.map((ex) => ({
      workout_id: newWorkout.id,
      exercise_id: ex.exercise_id,
      order_index: ex.order_index,
      sets: ex.sets,
      reps_min: ex.reps_min,
      reps_max: ex.reps_max,
      rest_seconds: ex.rest_seconds,
      notes: ex.notes,
    }));

    await supabase.from("workout_exercises").insert(rows);
  }

  return newWorkout.id;
}

export async function getWorkouts(coachId: string, status?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("workouts")
    .select(
      `*, athlete:profiles!workouts_athlete_id_fkey(id, full_name, avatar_url)`
    )
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getWorkoutById(workoutId: string) {
  const supabase = await createClient();

  const { data: workout } = await supabase
    .from("workouts")
    .select(
      `*, athlete:profiles!workouts_athlete_id_fkey(id, full_name, avatar_url)`
    )
    .eq("id", workoutId)
    .single();

  if (!workout) return null;

  const { data: exercises } = await supabase
    .from("workout_exercises")
    .select(
      `*, exercise:exercise_library(*)`
    )
    .eq("workout_id", workoutId)
    .order("order_index");

  return { workout, exercises: exercises ?? [] };
}

export async function searchExercises(query: string, muscleGroup?: MuscleGroup) {
  const supabase = await createClient();

  let q = supabase
    .from("exercise_library")
    .select("*")
    .order("name");

  if (query) {
    q = q.ilike("name", `%${query}%`);
  }

  if (muscleGroup) {
    q = q.eq("muscle_group", muscleGroup);
  }

  const { data } = await q.limit(50);
  return data ?? [];
}

export async function createCustomExercise(
  data: {
    name: string;
    muscle_group: MuscleGroup;
    equipment: string;
    instructions: string | null;
    video_url: string | null;
  },
  coachId: string
) {
  const supabase = await createClient();

  const { data: exercise, error } = await supabase
    .from("exercise_library")
    .insert({
      ...data,
      created_by: coachId,
      is_custom: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return exercise;
}
