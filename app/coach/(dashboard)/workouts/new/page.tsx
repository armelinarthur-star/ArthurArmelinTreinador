"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { createWorkout, type WorkoutExerciseInput } from "@/app/actions/workouts";
import { getAthletes } from "@/app/actions/athletes";
import { useEffect } from "react";
import { StepIndicator } from "@/components/coach/workouts/StepIndicator";
import { ExerciseSearch } from "@/components/coach/workouts/ExerciseSearch";
import {
  SortableExerciseList,
  type ExerciseWithMeta,
} from "@/components/coach/workouts/SortableExerciseList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Save, Dumbbell } from "lucide-react";
import type { Exercise } from "@/lib/types/database";

interface Athlete {
  id: string;
  full_name: string;
}

const steps = [
  { label: "Configurações" },
  { label: "Exercícios" },
  { label: "Revisar e Salvar" },
];

const muscleGroupLabels: Record<string, string> = {
  chest: "Peito",
  back: "Costas",
  shoulders: "Ombros",
  biceps: "Biceps",
  triceps: "Triceps",
  legs: "Pernas",
  glutes: "Gluteos",
  quadriceps: "Quadriceps",
  hamstrings: "Posteriores",
  calves: "Panturrilha",
  abs: "Abdomen",
  full_body: "Full Body",
};

export default function NewWorkoutPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1 — Config
  const [name, setName] = useState("");
  const [athleteId, setAthleteId] = useState("");
  const [dayLabel, setDayLabel] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [weekNumber, setWeekNumber] = useState(1);
  const [status, setStatus] = useState<"draft" | "active">("draft");

  // Athletes list
  const [athletes, setAthletes] = useState<Athlete[]>([]);

  // Step 2 — Exercises
  const [exercises, setExercises] = useState<ExerciseWithMeta[]>([]);

  useEffect(() => {
    if (!profile) return;
    getAthletes(profile.id).then((data) =>
      setAthletes(data.map((a: { id: string; full_name: string }) => ({ id: a.id, full_name: a.full_name })))
    );
  }, [profile]);

  function handleAddExercise(exercise: Exercise) {
    const newEx: ExerciseWithMeta = {
      exercise_id: exercise.id,
      order_index: exercises.length,
      sets: 3,
      reps_min: 8,
      reps_max: 12,
      rest_seconds: 60,
      notes: null,
      name: exercise.name,
      muscle_group: exercise.muscle_group,
    };
    setExercises((prev) => [...prev, newEx]);
  }

  function handleFieldChange(
    index: number,
    field: string,
    value: number | string | null
  ) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  }

  function handleRemove(index: number) {
    setExercises((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((ex, i) => ({ ...ex, order_index: i }))
    );
  }

  async function handleSave() {
    if (!profile) return;
    setIsSaving(true);

    const exerciseInputs: WorkoutExerciseInput[] = exercises.map((ex) => ({
      exercise_id: ex.exercise_id,
      order_index: ex.order_index,
      sets: ex.sets,
      reps_min: ex.reps_min,
      reps_max: ex.reps_max,
      rest_seconds: ex.rest_seconds,
      notes: ex.notes,
    }));

    try {
      await createWorkout({
        coach_id: profile.id,
        athlete_id: athleteId,
        name,
        day_label: dayLabel || null,
        goal: "hypertrophy",
        scheduled_date: scheduledDate || null,
        week_number: weekNumber,
        status,
        exercises: exerciseInputs,
      });
      router.push("/coach/workouts");
    } catch {
      setIsSaving(false);
    }
  }

  const canAdvanceStep1 = name.trim() !== "" && athleteId !== "";
  const canAdvanceStep2 = exercises.length > 0;

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Back */}
      <Link
        href="/coach/workouts"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-content-primary">
        Criar Treino
      </h1>

      {/* Step indicator */}
      <div className="mb-8">
        <StepIndicator steps={steps} currentStep={step} />
      </div>

      {/* Step 1 — Configurações */}
      {step === 0 && (
        <div className="mx-auto max-w-lg space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-content-secondary">
              Nome do Treino *
            </label>
            <Input
              placeholder="Ex: Treino A — Peito e Tríceps"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-content-secondary">Aluno(a)(a) *</label>
            <Select value={athleteId} onValueChange={(v) => setAthleteId(v ?? "")}>
              <SelectTrigger className="w-full border-line-default bg-bg-elevated text-content-primary">
                <SelectValue placeholder="Selecionar aluno" />
              </SelectTrigger>
              <SelectContent className="border-line-subtle bg-bg-surface">
                {athletes.map((a) => (
                  <SelectItem
                    key={a.id}
                    value={a.id}
                    className="text-content-primary hover:bg-bg-elevated"
                  >
                    {a.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-content-secondary">
                Rótulo do Dia
              </label>
              <Input
                placeholder="Ex: Dia A"
                value={dayLabel}
                onChange={(e) => setDayLabel(e.target.value)}
                className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-content-secondary">Semana</label>
              <Input
                type="number"
                min={1}
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
                className="border-line-default bg-bg-elevated text-content-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-content-secondary">
              Data Agendada
            </label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="border-line-default bg-bg-elevated text-content-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-content-secondary">Status</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus("draft")}
                className={`rounded-pill px-3 py-1.5 text-xs font-medium transition-colors ${
                  status === "draft"
                    ? "bg-brand-red text-white"
                    : "bg-bg-elevated text-content-secondary hover:text-content-primary"
                }`}
              >
                Rascunho
              </button>
              <button
                type="button"
                onClick={() => setStatus("active")}
                className={`rounded-pill px-3 py-1.5 text-xs font-medium transition-colors ${
                  status === "active"
                    ? "bg-brand-red text-white"
                    : "bg-bg-elevated text-content-secondary hover:text-content-primary"
                }`}
              >
                Ativo
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setStep(1)}
              disabled={!canAdvanceStep1}
              className="gap-2 rounded-input bg-brand-red text-white hover:bg-brand-red-dark disabled:opacity-50"
            >
              Próximo
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Exercícios */}
      {step === 1 && (
        <div className="space-y-6">
          <ExerciseSearch
            onSelect={handleAddExercise}
            selectedIds={exercises.map((e) => e.exercise_id)}
          />

          <div>
            <h3 className="mb-3 text-sm font-medium text-content-primary">
              Exercícios Adicionados ({exercises.length})
            </h3>
            <SortableExerciseList
              exercises={exercises}
              onChange={setExercises}
              onFieldChange={handleFieldChange}
              onRemove={handleRemove}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(0)}
              className="gap-2 border-line-default text-content-primary hover:bg-bg-elevated"
            >
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
            <Button
              onClick={() => setStep(2)}
              disabled={!canAdvanceStep2}
              className="gap-2 rounded-input bg-brand-red text-white hover:bg-brand-red-dark disabled:opacity-50"
            >
              Próximo
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Revisar e Salvar */}
      {step === 2 && (
        <div className="mx-auto max-w-lg space-y-6">
          {/* Summary */}
          <div className="rounded-card border border-line-subtle bg-bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-content-primary">
                {name}
              </h3>
              <Badge
                className={
                  status === "active"
                    ? "bg-state-success/15 text-state-success"
                    : "bg-bg-elevated text-content-secondary"
                }
              >
                {status === "active" ? "Ativo" : "Rascunho"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-content-secondary">Aluno(a)</span>
              <span className="text-content-primary">
                {athletes.find((a) => a.id === athleteId)?.full_name ?? "—"}
              </span>

              {dayLabel && (
                <>
                  <span className="text-content-secondary">Dia</span>
                  <span className="text-content-primary">{dayLabel}</span>
                </>
              )}

              <span className="text-content-secondary">Semana</span>
              <span className="text-content-primary">{weekNumber}</span>

              {scheduledDate && (
                <>
                  <span className="text-content-secondary">Data</span>
                  <span className="text-content-primary">
                    {new Date(scheduledDate + "T00:00:00").toLocaleDateString("pt-BR")}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Exercise list summary */}
          <div className="rounded-card border border-line-subtle bg-bg-surface p-5">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-content-primary">
              <Dumbbell className="size-4" />
              {exercises.length} Exercício{exercises.length !== 1 && "s"}
            </h4>
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <div
                  key={ex.exercise_id}
                  className="flex items-center justify-between rounded-input bg-bg-elevated px-3 py-2"
                >
                  <span className="text-sm text-content-primary">
                    {i + 1}. {ex.name}
                  </span>
                  <span className="text-xs text-content-secondary">
                    {ex.sets}x{ex.reps_min ?? "?"}
                    {ex.reps_max ? `-${ex.reps_max}` : ""} · {ex.rest_seconds}s
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="gap-2 border-line-default text-content-primary hover:bg-bg-elevated"
            >
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2 rounded-input bg-brand-red text-white hover:bg-brand-red-dark"
            >
              <Save className="size-4" />
              {isSaving ? "Salvando..." : "Salvar Treino"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
