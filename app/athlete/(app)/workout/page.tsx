"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getAthleteWorkouts } from "@/app/actions/athlete";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ChevronRight } from "lucide-react";

type TabValue = "week" | "history";

interface WorkoutRow {
  id: string;
  name: string;
  status: string;
  day_label: string | null;
  scheduled_date: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; border: string; badge: string }> = {
  active: {
    label: "Pendente",
    border: "border-l-content-tertiary/30",
    badge: "bg-bg-elevated text-content-secondary",
  },
  completed: {
    label: "Concluído",
    border: "border-l-state-success",
    badge: "bg-state-success/15 text-state-success",
  },
  draft: {
    label: "Pendente",
    border: "border-l-content-tertiary/30",
    badge: "bg-bg-elevated text-content-secondary",
  },
  in_progress: {
    label: "Em andamento",
    border: "border-l-brand-red animate-pulse",
    badge: "bg-brand-red/15 text-brand-red",
  },
};

export default function AthleteWorkoutsPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<TabValue>("week");

  useEffect(() => {
    if (!profile) return;

    async function load() {
      setIsLoading(true);
      const data = await getAthleteWorkouts(profile!.id);
      setWorkouts(data as WorkoutRow[]);
      setIsLoading(false);
    }

    load();
  }, [profile]);

  const loading = authLoading || isLoading;

  // Filter by tab
  const now = new Date();
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay();
  startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const filtered =
    tab === "week"
      ? workouts.filter((w) => {
          if (!w.scheduled_date) return w.status === "active" || w.status === "draft";
          const d = new Date(w.scheduled_date + "T00:00:00");
          return d >= startOfWeek && d <= endOfWeek;
        })
      : workouts.filter((w) => w.status === "completed");

  const tabs: { label: string; value: TabValue }[] = [
    { label: "Esta Semana", value: "week" },
    { label: "Histórico", value: "history" },
  ];

  return (
    <div className="flex-1 p-6">
      <h1 className="mb-6 text-xl font-semibold text-content-primary">
        Meus Treinos
      </h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-pill px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
              tab === t.value
                ? "bg-brand-red text-white"
                : "bg-bg-elevated text-content-secondary hover:text-content-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-card bg-bg-elevated" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-card border border-line-subtle bg-bg-surface py-16 text-center">
          <Dumbbell className="mx-auto mb-3 size-8 text-content-tertiary" />
          <p className="text-sm text-content-secondary">
            {tab === "week"
              ? "Nenhum treino agendado esta semana."
              : "Nenhum treino concluído ainda."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((w) => {
            const config = statusConfig[w.status] ?? statusConfig.active;
            return (
              <Link key={w.id} href={`/athlete/workout/${w.id}`}>
                <div
                  className={`flex items-center gap-4 rounded-card border border-line-subtle border-l-[3px] ${config.border} bg-bg-surface p-4 transition-colors hover:border-brand-red/20`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-medium text-content-primary truncate">
                        {w.name}
                      </p>
                      <Badge className={`text-[10px] ${config.badge}`}>
                        {config.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-content-secondary">
                      {w.scheduled_date
                        ? `Agendado para ${new Date(
                            w.scheduled_date + "T00:00:00"
                          ).toLocaleDateString("pt-BR")}`
                        : w.day_label ?? "Sem data"}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-content-tertiary" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
