"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  getTodayWorkout,
  getAthleteStreak,
  getUpcomingWorkouts,
} from "@/app/actions/athlete";
import { getGreeting } from "@/lib/utils/greeting";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dumbbell, ChevronRight, Flame, Leaf } from "lucide-react";

interface TodayWorkout {
  id: string;
  name: string;
  day_label: string | null;
  workout_exercises: { id: string }[];
}

interface UpcomingWorkout {
  id: string;
  name: string;
  day_label: string | null;
  scheduled_date: string | null;
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AthleteHomePage() {
  const { profile, isLoading: authLoading } = useAuth();
  const [todayWorkout, setTodayWorkout] = useState<TodayWorkout | null>(null);
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [upcoming, setUpcoming] = useState<UpcomingWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const [today, streakData, upcomingData] = await Promise.all([
        getTodayWorkout(profile!.id),
        getAthleteStreak(profile!.id),
        getUpcomingWorkouts(profile!.id),
      ]);
      setTodayWorkout(today as TodayWorkout | null);
      setStreak(streakData);
      setUpcoming(upcomingData as UpcomingWorkout[]);
      setIsLoading(false);
    }

    load();
  }, [profile]);

  const loading = authLoading || isLoading;

  // Streak milestone progress
  const nextMilestone = streak.current_streak < 7 ? 7 : streak.current_streak < 30 ? 30 : 90;
  const milestoneProgress = Math.min(
    (streak.current_streak / nextMilestone) * 100,
    100
  );

  return (
    <div className="flex-1 p-6">
      {/* Greeting */}
      {loading ? (
        <div className="mb-6">
          <Skeleton className="mb-2 h-5 w-24 bg-bg-elevated" />
          <Skeleton className="h-7 w-48 bg-bg-elevated" />
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-sm text-content-secondary">{getGreeting()},</p>
          <h1 className="text-xl font-bold text-content-primary">
            {profile?.full_name?.split(" ")[0]}
          </h1>
        </div>
      )}

      {/* Today's workout card */}
      {loading ? (
        <Skeleton className="mb-4 h-40 rounded-card bg-bg-elevated" />
      ) : todayWorkout ? (
        <div className="mb-4 rounded-card border-l-[3px] border-l-brand-red border border-line-subtle bg-bg-surface p-5">
          <p className="mb-1 font-accent text-xs uppercase tracking-wider text-brand-red">
            Treino de Hoje
          </p>
          <h2 className="mb-2 text-lg font-bold text-content-primary">
            {todayWorkout.name}
          </h2>
          <p className="mb-4 text-xs text-content-secondary">
            {todayWorkout.workout_exercises.length} exercício
            {todayWorkout.workout_exercises.length !== 1 && "s"} ·{" "}
            estimado {todayWorkout.workout_exercises.length * 5} min
          </p>
          <Link href={`/athlete/workout/${todayWorkout.id}/log`}>
            <Button className="w-full gap-2 rounded-input bg-brand-red text-white font-semibold hover:bg-brand-red-dark">
              <Dumbbell className="size-4" />
              Iniciar Treino
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mb-4 rounded-card border border-line-subtle bg-bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-bg-elevated">
              <Leaf className="size-5 text-state-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-content-primary">
                Dia de descanso ativo
              </p>
              <p className="text-xs text-content-secondary">
                Faça uma caminhada leve ou alongamento para recuperação.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Streak card */}
      {loading ? (
        <Skeleton className="mb-6 h-20 rounded-card bg-bg-elevated" />
      ) : (
        <div className="mb-6 rounded-card border border-line-subtle bg-bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-content-primary">
              <Flame className="size-4 text-brand-red" />
              {streak.current_streak} dia{streak.current_streak !== 1 && "s"}{" "}
              consecutivo{streak.current_streak !== 1 && "s"}
            </span>
            <span className="text-[11px] text-content-tertiary">
              Meta: {nextMilestone} dias
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated">
            <div
              className="h-full rounded-full bg-brand-red transition-all duration-500"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upcoming workouts */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-36 bg-bg-elevated" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-36 shrink-0 rounded-card bg-bg-elevated" />
            ))}
          </div>
        </div>
      ) : upcoming.length > 0 ? (
        <div>
          <h3 className="mb-3 text-sm font-medium text-content-primary">
            Próximos Treinos
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-none">
            {upcoming.map((w) => {
              const date = w.scheduled_date
                ? new Date(w.scheduled_date + "T00:00:00")
                : null;
              return (
                <Link
                  key={w.id}
                  href={`/athlete/workout/${w.id}`}
                  className="shrink-0"
                >
                  <div className="w-36 rounded-card border border-line-subtle bg-bg-surface p-3 transition-colors hover:border-brand-red/30">
                    <p className="mb-1 text-xs font-medium text-content-primary truncate">
                      {w.name}
                    </p>
                    <p className="text-[11px] text-content-secondary">
                      {date
                        ? `${dayNames[date.getDay()]} · ${date.toLocaleDateString("pt-BR")}`
                        : w.day_label ?? "Sem data"}
                    </p>
                    <ChevronRight className="mt-2 size-3.5 text-content-tertiary" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
