"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { getWorkoutDetail } from "@/app/actions/athlete";
import {
  startWorkoutLog,
  logSet,
  completeWorkout,
  getPreviousSetData,
} from "@/app/actions/logging";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import confetti from "canvas-confetti";

// --- Types ---
interface ExerciseData {
  id: string; // workout_exercise_id
  exercise_id: string;
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
  };
}

interface SetState {
  set_number: number;
  weight_kg: string;
  reps_achieved: string;
  completed: boolean;
}

// --- Constants ---
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

const motivationalPhrases = [
  "Consistência é o que separa os bons dos grandes.",
  "Mais um treino. Mais um passo.",
  "Seu futuro eu agradece.",
  "Não foi fácil. Mas você fez.",
  "Arthur ficou orgulhoso.",
  "Cada gota de suor conta.",
  "Você é mais forte do que pensa.",
  "O impossível é só questão de tempo.",
  "Disciplina vence o talento quando o talento não tem disciplina.",
  "Hoje você escolheu ser melhor.",
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// --- Rest Timer Component ---
function RestTimer({
  duration,
  onComplete,
  onSkip,
}: {
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (remaining <= 0) {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(200);
      }
      onComplete();
      return;
    }

    const timer = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(timer);
  }, [remaining, onComplete]);

  const progress = 1 - remaining / duration;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-base/95 backdrop-blur-sm">
      <p className="mb-6 font-accent text-xs uppercase tracking-[0.2em] text-brand-red">
        Descansando
      </p>

      {/* SVG circle */}
      <div className="relative mb-6">
        <svg width="140" height="140" className="-rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="6"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#FF0025"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[32px] font-bold text-content-primary">
          {remaining}
        </span>
      </div>

      <button
        onClick={onSkip}
        className="text-sm text-content-secondary hover:text-content-primary"
      >
        Pular
      </button>
    </div>
  );
}

// --- Main Page ---
export default function WorkoutLogPage() {
  const { profile } = useAuth();
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;

  // State
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [logId, setLogId] = useState<string | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [setsState, setSetsState] = useState<Record<string, SetState[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [workoutName, setWorkoutName] = useState("");

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rest timer
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);

  // Completion
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalSetsCompleted, setTotalSetsCompleted] = useState(0);

  // Exit dialog
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Direction for transitions
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Start chronometer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Load workout + start log
  useEffect(() => {
    if (!profile) return;

    async function load() {
      const [detail, log] = await Promise.all([
        getWorkoutDetail(workoutId),
        startWorkoutLog(workoutId, profile!.id),
      ]);

      if (!detail) return;

      const exs = detail.exercises as ExerciseData[];
      setExercises(exs);
      setWorkoutName(detail.workout.name);
      setLogId(log.id);

      // Recover existing set logs
      const existingSetLogs = (log.set_logs ?? []) as {
        workout_exercise_id: string;
        set_number: number;
        weight_kg: number | null;
        reps_achieved: number | null;
        completed: boolean;
      }[];

      // Initialize sets state with auto-fill
      const initialSets: Record<string, SetState[]> = {};

      for (const ex of exs) {
        const sets: SetState[] = [];

        // Get previous data for auto-fill
        let prevWeight = "";
        let prevReps = "";
        try {
          const prev = await getPreviousSetData(
            ex.exercise.id,
            profile!.id
          );
          if (prev) {
            prevWeight = prev.weight_kg?.toString() ?? "";
            prevReps = prev.reps_achieved?.toString() ?? "";
          }
        } catch {
          // silent
        }

        for (let s = 1; s <= ex.sets; s++) {
          const existing = existingSetLogs.find(
            (sl) =>
              sl.workout_exercise_id === ex.id && sl.set_number === s
          );

          sets.push({
            set_number: s,
            weight_kg: existing?.weight_kg?.toString() ?? prevWeight,
            reps_achieved: existing?.reps_achieved?.toString() ?? prevReps,
            completed: existing?.completed ?? false,
          });
        }

        initialSets[ex.id] = sets;
      }

      setSetsState(initialSets);

      // Find first incomplete exercise to resume
      const firstIncomplete = exs.findIndex((ex) => {
        const sets = initialSets[ex.id];
        return sets?.some((s) => !s.completed);
      });
      if (firstIncomplete >= 0) setCurrentExerciseIndex(firstIncomplete);

      setIsLoading(false);
    }

    load();
  }, [profile, workoutId]);

  // Toggle set completion
  const handleToggleSet = useCallback(
    async (exerciseId: string, setIndex: number) => {
      if (!logId) return;

      const currentSets = setsState[exerciseId];
      if (!currentSets) return;

      const set = currentSets[setIndex];
      const newCompleted = !set.completed;

      // Update local state immediately
      setSetsState((prev) => {
        const updated = { ...prev };
        updated[exerciseId] = updated[exerciseId].map((s, i) =>
          i === setIndex ? { ...s, completed: newCompleted } : s
        );
        return updated;
      });

      // Save to DB
      await logSet({
        workout_log_id: logId,
        workout_exercise_id: exerciseId,
        set_number: set.set_number,
        reps_achieved: set.reps_achieved
          ? parseInt(set.reps_achieved)
          : null,
        weight_kg: set.weight_kg ? parseFloat(set.weight_kg) : null,
        rpe: null,
        completed: newCompleted,
      });

      // Show rest timer if just completed (not last set of last exercise)
      if (newCompleted) {
        const currentEx = exercises[currentExerciseIndex];
        const isLastSetOfLastExercise =
          currentExerciseIndex === exercises.length - 1 &&
          setIndex === currentSets.length - 1;

        if (!isLastSetOfLastExercise) {
          setRestDuration(currentEx.rest_seconds || 60);
          setShowRestTimer(true);
        }

        // Check if all exercises are complete
        const allComplete = checkAllComplete(exerciseId, setIndex, newCompleted);
        if (allComplete) {
          handleCompleteWorkout();
        }
      }
    },
    [logId, setsState, exercises, currentExerciseIndex]
  );

  function checkAllComplete(
    changedExId: string,
    changedSetIdx: number,
    changedValue: boolean
  ): boolean {
    for (const ex of exercises) {
      const sets = setsState[ex.id];
      if (!sets) return false;
      for (let i = 0; i < sets.length; i++) {
        const isChanged = ex.id === changedExId && i === changedSetIdx;
        const completed = isChanged ? changedValue : sets[i].completed;
        if (!completed) return false;
      }
    }
    return true;
  }

  async function handleCompleteWorkout() {
    if (!logId || !profile) return;

    if (timerRef.current) clearInterval(timerRef.current);

    // Count total sets
    let total = 0;
    for (const sets of Object.values(setsState)) {
      total += sets.filter((s) => s.completed).length;
    }
    setTotalSetsCompleted(total);

    await completeWorkout(logId, profile.id);
    setIsCompleted(true);

    // Fire confetti
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FF0025", "#FFFFFF", "#FF0025", "#FFFFFF"],
      });
    }, 300);
  }

  function handleFieldChange(
    exerciseId: string,
    setIndex: number,
    field: "weight_kg" | "reps_achieved",
    value: string
  ) {
    setSetsState((prev) => {
      const updated = { ...prev };
      updated[exerciseId] = updated[exerciseId].map((s, i) =>
        i === setIndex ? { ...s, [field]: value } : s
      );
      return updated;
    });
  }

  // Save on blur
  async function handleFieldBlur(exerciseId: string, setIndex: number) {
    if (!logId) return;
    const set = setsState[exerciseId]?.[setIndex];
    if (!set || !set.completed) return;

    await logSet({
      workout_log_id: logId,
      workout_exercise_id: exerciseId,
      set_number: set.set_number,
      reps_achieved: set.reps_achieved ? parseInt(set.reps_achieved) : null,
      weight_kg: set.weight_kg ? parseFloat(set.weight_kg) : null,
      rpe: null,
      completed: set.completed,
    });
  }

  function navigateExercise(direction: "prev" | "next") {
    setSlideDirection(direction === "next" ? "right" : "left");
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentExerciseIndex((i) =>
        direction === "next" ? Math.min(i + 1, exercises.length - 1) : Math.max(i - 1, 0)
      );
      setIsTransitioning(false);
    }, 150);
  }

  // --- LOADING ---
  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
          <p className="text-sm text-content-secondary">
            Carregando treino...
          </p>
        </div>
      </div>
    );
  }

  // --- COMPLETION ---
  if (isCompleted) {
    const phrase =
      motivationalPhrases[
        Math.floor(Math.random() * motivationalPhrases.length)
      ];

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-base px-6 text-center">
        <Image
          src="/brand/LOGO01_BRANCO.png"
          alt="Arthur Armelin Treinador"
          width={280}
          height={70}
          className="mb-8 h-auto w-auto max-w-[280px]"
        />

        <h1 className="mb-2 font-display text-3xl text-content-primary">
          Treino Concluído!
        </h1>

        <div className="mb-6 h-[2px] w-12 bg-brand-red" />

        <div className="mb-8 space-y-2 text-sm text-content-secondary">
          <p>
            Tempo total:{" "}
            <span className="font-semibold text-content-primary">
              {formatTime(elapsedSeconds)}
            </span>
          </p>
          <p>
            Exercícios:{" "}
            <span className="font-semibold text-content-primary">
              {exercises.length}
            </span>
          </p>
          <p>
            Séries realizadas:{" "}
            <span className="font-semibold text-content-primary">
              {totalSetsCompleted}
            </span>
          </p>
        </div>

        <p className="mb-10 max-w-xs text-sm italic text-brand-red">
          &ldquo;{phrase}&rdquo;
        </p>

        <Button
          onClick={() => router.push("/athlete")}
          className="h-12 w-full max-w-xs rounded-input bg-brand-red text-white font-semibold hover:bg-brand-red-dark"
        >
          Fechar
        </Button>
      </div>
    );
  }

  // --- MAIN EXECUTION VIEW ---
  const currentExercise = exercises[currentExerciseIndex];
  const currentSets = setsState[currentExercise?.id] ?? [];
  const progressPercent =
    ((currentExerciseIndex + 1) / exercises.length) * 100;

  return (
    <div className="flex min-h-dvh flex-col bg-bg-base">
      {/* Rest timer overlay */}
      {showRestTimer && (
        <RestTimer
          duration={restDuration}
          onComplete={() => setShowRestTimer(false)}
          onSkip={() => setShowRestTimer(false)}
        />
      )}

      {/* Exit dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="border-line-subtle bg-bg-surface text-content-primary sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Sair do treino?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-content-secondary">
            Seu progresso foi salvo. Você pode retomar de onde parou.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowExitDialog(false)}
              className="flex-1 border-line-default text-content-primary hover:bg-bg-elevated"
            >
              Continuar
            </Button>
            <Button
              onClick={() => router.push(`/athlete/workout/${workoutId}`)}
              className="flex-1 bg-brand-red text-white hover:bg-brand-red-dark"
            >
              Sair
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fixed header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line-subtle bg-bg-surface px-4 py-3">
        <button
          onClick={() => setShowExitDialog(true)}
          className="flex size-9 items-center justify-center rounded-input text-content-secondary hover:bg-bg-elevated hover:text-content-primary"
        >
          <X className="size-5" />
        </button>
        <p className="max-w-[180px] truncate text-sm font-medium text-content-primary">
          {workoutName}
        </p>
        <span className="font-mono text-sm font-semibold text-content-primary tabular-nums">
          {formatTime(elapsedSeconds)}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-[2px] w-full bg-bg-elevated">
        <div
          className="h-full bg-brand-red transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Exercise content */}
      <div className="flex flex-1 flex-col px-5 pt-6 pb-24">
        <div
          className={`transition-all duration-150 ${
            isTransitioning
              ? slideDirection === "right"
                ? "translate-x-4 opacity-0"
                : "-translate-x-4 opacity-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          {/* Exercise indicator */}
          <p className="mb-1 font-accent text-xs uppercase tracking-[0.15em] text-brand-red">
            Exercício {currentExerciseIndex + 1} de {exercises.length}
          </p>

          {/* Exercise name */}
          <h2 className="mb-2 text-2xl font-bold text-content-primary">
            {currentExercise.exercise.name}
          </h2>

          {/* Muscle group badge */}
          <Badge className="mb-4 bg-bg-elevated text-[11px] text-content-secondary">
            {muscleGroupLabels[currentExercise.exercise.muscle_group] ??
              currentExercise.exercise.muscle_group}
          </Badge>

          {/* Coach notes */}
          {currentExercise.notes && (
            <div className="mb-6 rounded-input border-l-[3px] border-l-brand-red bg-bg-elevated px-4 py-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="mt-0.5 size-3 shrink-0 text-brand-red" />
                <p className="text-xs italic text-brand-red">
                  {currentExercise.notes}
                </p>
              </div>
            </div>
          )}

          {/* Sets */}
          <div className="space-y-2">
            {currentSets.map((set, i) => (
              <div
                key={set.set_number}
                className="flex items-center gap-2"
              >
                {/* Set label */}
                <span className="w-16 shrink-0 text-xs text-content-secondary">
                  Série {set.set_number}
                </span>

                {/* Weight input */}
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="kg"
                  value={set.weight_kg}
                  onChange={(e) =>
                    handleFieldChange(
                      currentExercise.id,
                      i,
                      "weight_kg",
                      e.target.value
                    )
                  }
                  onBlur={() =>
                    handleFieldBlur(currentExercise.id, i)
                  }
                  className="h-10 w-20 border-line-default bg-bg-elevated text-center text-sm text-content-primary placeholder:text-content-tertiary"
                />

                {/* Separator */}
                <span className="text-xs text-content-tertiary">×</span>

                {/* Reps input */}
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="reps"
                  value={set.reps_achieved}
                  onChange={(e) =>
                    handleFieldChange(
                      currentExercise.id,
                      i,
                      "reps_achieved",
                      e.target.value
                    )
                  }
                  onBlur={() =>
                    handleFieldBlur(currentExercise.id, i)
                  }
                  className="h-10 w-16 border-line-default bg-bg-elevated text-center text-sm text-content-primary placeholder:text-content-tertiary"
                />

                {/* Check button */}
                <button
                  onClick={() =>
                    handleToggleSet(currentExercise.id, i)
                  }
                  className={`flex size-12 shrink-0 items-center justify-center rounded-input border transition-all duration-200 ${
                    set.completed
                      ? "border-state-success bg-state-success text-white"
                      : "border-line-default bg-bg-elevated text-content-tertiary hover:border-content-secondary"
                  }`}
                >
                  <Check className="size-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Target info */}
          <p className="mt-3 text-[11px] text-content-tertiary">
            Meta: {currentExercise.sets} × {currentExercise.reps_min ?? "?"}
            {currentExercise.reps_max
              ? `-${currentExercise.reps_max}`
              : ""}{" "}
            reps · {currentExercise.rest_seconds}s descanso
          </p>
        </div>
      </div>

      {/* Navigation — fixed bottom */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line-subtle bg-bg-surface/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigateExercise("prev")}
            disabled={currentExerciseIndex === 0}
            className="gap-1.5 border-line-default text-content-primary hover:bg-bg-elevated disabled:opacity-30"
          >
            <ArrowLeft className="size-4" />
            Anterior
          </Button>

          <span className="text-xs text-content-secondary">
            {currentExerciseIndex + 1} / {exercises.length}
          </span>

          <Button
            onClick={() => navigateExercise("next")}
            disabled={currentExerciseIndex === exercises.length - 1}
            className="gap-1.5 bg-brand-red text-white hover:bg-brand-red-dark disabled:opacity-30"
          >
            Próximo
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
