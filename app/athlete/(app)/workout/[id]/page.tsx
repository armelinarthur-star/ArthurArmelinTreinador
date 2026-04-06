"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getWorkoutDetail } from "@/app/actions/athlete";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell, Clock, MessageSquare } from "lucide-react";

const muscleGroupLabels: Record<string, string> = {
  chest: "Peito",
  back: "Costas",
  shoulders: "Ombros",
  biceps: "Biceps",
  triceps: "Triceps",
  glutes: "Gluteos",
  quadriceps: "Quadriceps",
  hamstrings: "Posteriores",
  calves: "Panturrilha",
  abs: "Abdomen",
  full_body: "Full Body",
};

const goalLabels: Record<string, string> = {
  hypertrophy: "Hipertrofia",
  fat_loss: "Emagrecimento",
  strength: "Força",
  endurance: "Resistência",
  general: "Geral",
};

interface WorkoutDetail {
  workout: {
    id: string;
    name: string;
    status: string;
    day_label: string | null;
    scheduled_date: string | null;
    coach: { id: string; full_name: string; avatar_url: string | null } | null;
  };
  exercises: {
    id: string;
    order_index: number;
    sets: number;
    reps_min: number | null;
    reps_max: number | null;
    rest_seconds: number;
    notes: string | null;
    exercise: {
      id: string;
      name: string;
      muscle_group: string;
      equipment: string;
    };
  }[];
}

export default function AthleteWorkoutDetailPage() {
  const params = useParams();
  const workoutId = params.id as string;
  const [data, setData] = useState<WorkoutDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getWorkoutDetail(workoutId);
      setData(result as WorkoutDetail | null);
      setIsLoading(false);
    }
    load();
  }, [workoutId]);

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <Skeleton className="mb-4 h-5 w-20 bg-bg-elevated" />
        <Skeleton className="mb-2 h-7 w-48 bg-bg-elevated" />
        <Skeleton className="mb-6 h-5 w-32 bg-bg-elevated" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-card bg-bg-elevated" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-content-secondary">Treino não encontrado.</p>
      </div>
    );
  }

  const { workout, exercises } = data;
  const totalTime = exercises.length * 5;

  return (
    <div className="flex-1 p-6 pb-24">
      {/* Back */}
      <Link
        href="/athlete/workout"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-content-primary">
          {workout.name}
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <Badge className="bg-bg-elevated text-[10px] text-content-secondary">
            {goalLabels.hypertrophy}
          </Badge>
          {workout.day_label && (
            <Badge className="bg-bg-elevated text-[10px] text-content-secondary">
              {workout.day_label}
            </Badge>
          )}
        </div>
        <p className="mt-2 flex items-center gap-3 text-xs text-content-secondary">
          <span className="flex items-center gap-1">
            <Dumbbell className="size-3.5" />
            {exercises.length} exercício{exercises.length !== 1 && "s"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            ~{totalTime} min
          </span>
        </p>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {exercises.map((ex, i) => (
          <div
            key={ex.id}
            className="rounded-card border border-line-subtle bg-bg-surface p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-content-primary">
                  {i + 1}. {ex.exercise.name}
                </p>
                <Badge className="mt-1 bg-bg-elevated text-[10px] text-content-secondary">
                  {muscleGroupLabels[ex.exercise.muscle_group] ??
                    ex.exercise.muscle_group}
                </Badge>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-content-secondary">
              <span>
                {ex.sets} séries × {ex.reps_min ?? "?"}
                {ex.reps_max ? `-${ex.reps_max}` : ""} reps
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {ex.rest_seconds}s descanso
              </span>
            </div>

            {ex.notes && (
              <div className="mt-3 flex items-start gap-2 rounded-input bg-bg-elevated px-3 py-2">
                <MessageSquare className="mt-0.5 size-3 shrink-0 text-brand-red" />
                <p className="text-xs italic text-brand-red">{ex.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fixed bottom button */}
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-line-subtle bg-bg-base/95 p-4 backdrop-blur-sm">
        <Link href={`/athlete/workout/${workoutId}/log`}>
          <Button className="w-full gap-2 rounded-input bg-brand-red text-white font-semibold hover:bg-brand-red-dark">
            <Dumbbell className="size-4" />
            Iniciar Treino
          </Button>
        </Link>
      </div>
    </div>
  );
}
