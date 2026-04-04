"use client";

import { useEffect, useState } from "react";
import { searchExercises } from "@/app/actions/workouts";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import type { Exercise, MuscleGroup } from "@/lib/types/database";

const muscleGroupLabels: Record<MuscleGroup, string> = {
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

interface ExerciseSearchProps {
  onSelect: (exercise: Exercise) => void;
  selectedIds: string[];
}

export function ExerciseSearch({ onSelect, selectedIds }: ExerciseSearchProps) {
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | "">("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(true);
      const data = await searchExercises(query, muscleFilter || undefined);
      setExercises(data as Exercise[]);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, muscleFilter]);

  const muscleGroups = Object.entries(muscleGroupLabels) as [MuscleGroup, string][];

  return (
    <div className="flex flex-col gap-3">
      {/* Muscle group filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setMuscleFilter("")}
          className={`rounded-pill px-2.5 py-1 text-[11px] font-medium transition-colors ${
            muscleFilter === ""
              ? "bg-brand-red text-white"
              : "bg-bg-elevated text-content-secondary hover:text-content-primary"
          }`}
        >
          Todos
        </button>
        {muscleGroups.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMuscleFilter(key)}
            className={`rounded-pill px-2.5 py-1 text-[11px] font-medium transition-colors ${
              muscleFilter === key
                ? "bg-brand-red text-white"
                : "bg-bg-elevated text-content-secondary hover:text-content-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Command search */}
      <Command className="rounded-card border border-line-subtle bg-bg-surface" shouldFilter={false}>
        <CommandInput
          placeholder="Buscar exercício..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-60">
          {isLoading ? (
            <div className="py-6 text-center text-xs text-content-secondary">
              Buscando...
            </div>
          ) : exercises.length === 0 ? (
            <CommandEmpty className="text-content-secondary">
              Nenhum exercício encontrado.
            </CommandEmpty>
          ) : (
            <CommandGroup>
              {exercises.map((ex) => {
                const alreadyAdded = selectedIds.includes(ex.id);
                return (
                  <CommandItem
                    key={ex.id}
                    onSelect={() => {
                      if (!alreadyAdded) onSelect(ex);
                    }}
                    disabled={alreadyAdded}
                    className={`gap-3 ${
                      alreadyAdded
                        ? "opacity-40"
                        : "text-content-primary hover:bg-bg-elevated"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ex.name}</p>
                      <p className="text-[11px] text-content-secondary">
                        {muscleGroupLabels[ex.muscle_group]} · {ex.equipment}
                      </p>
                    </div>
                    {alreadyAdded && (
                      <span className="text-[10px] text-content-tertiary">Adicionado</span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  );
}
