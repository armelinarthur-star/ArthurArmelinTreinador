"use client";

import { GripVertical, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WorkoutExerciseInput } from "@/app/actions/workouts";

const muscleGroupLabels: Record<string, string> = {
  chest: "Peito",
  back: "Costas",
  shoulders: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  legs: "Pernas",
  glutes: "Glúteos",
  abs: "Abdômen",
  full_body: "Full Body",
};

interface ExerciseCardProps {
  exercise: WorkoutExerciseInput & {
    name: string;
    muscle_group: string;
  };
  index: number;
  onChange: (index: number, field: string, value: number | string | null) => void;
  onRemove: (index: number) => void;
  dragHandleProps?: Record<string, unknown>;
}

export function ExerciseCard({
  exercise,
  index,
  onChange,
  onRemove,
  dragHandleProps,
}: ExerciseCardProps) {
  return (
    <div className="rounded-card border border-line-subtle bg-bg-surface p-4">
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          type="button"
          className="mt-1 cursor-grab touch-none text-content-tertiary hover:text-content-secondary active:cursor-grabbing"
          {...dragHandleProps}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-content-primary">
                {index + 1}. {exercise.name}
              </p>
              <p className="text-[11px] text-content-secondary">
                {muscleGroupLabels[exercise.muscle_group] ?? exercise.muscle_group}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="rounded-input p-1.5 text-content-tertiary hover:bg-bg-elevated hover:text-state-error"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>

          {/* Inline inputs */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-[11px] text-content-secondary">
                Séries
              </label>
              <Input
                type="number"
                min={1}
                value={exercise.sets}
                onChange={(e) =>
                  onChange(index, "sets", parseInt(e.target.value) || 1)
                }
                className="h-8 border-line-default bg-bg-elevated text-center text-sm text-content-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-content-secondary">
                Reps Mín
              </label>
              <Input
                type="number"
                min={1}
                value={exercise.reps_min ?? ""}
                onChange={(e) =>
                  onChange(
                    index,
                    "reps_min",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="h-8 border-line-default bg-bg-elevated text-center text-sm text-content-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-content-secondary">
                Reps Máx
              </label>
              <Input
                type="number"
                min={1}
                value={exercise.reps_max ?? ""}
                onChange={(e) =>
                  onChange(
                    index,
                    "reps_max",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="h-8 border-line-default bg-bg-elevated text-center text-sm text-content-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-content-secondary">
                Descanso (s)
              </label>
              <Input
                type="number"
                min={0}
                value={exercise.rest_seconds}
                onChange={(e) =>
                  onChange(index, "rest_seconds", parseInt(e.target.value) || 0)
                }
                className="h-8 border-line-default bg-bg-elevated text-center text-sm text-content-primary"
              />
            </div>
          </div>

          {/* Notes */}
          <Textarea
            placeholder="Observações (opcional)"
            value={exercise.notes ?? ""}
            onChange={(e) =>
              onChange(index, "notes", e.target.value || null)
            }
            className="min-h-[40px] border-line-default bg-bg-elevated text-xs text-content-primary placeholder:text-content-tertiary"
          />
        </div>
      </div>
    </div>
  );
}
