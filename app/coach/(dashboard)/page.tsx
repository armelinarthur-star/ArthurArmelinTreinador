"use client";

import { useAuth } from "@/hooks/useAuth";
import { useDashboardMetrics, useCoachAthletes } from "@/hooks/useQueries";
import { getGreeting, timeAgo, getInitials } from "@/lib/utils/greeting";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Dumbbell, ClipboardCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function CoachDashboardPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: athletesData, isLoading: athletesLoading } = useCoachAthletes();

  const loading = authLoading || metricsLoading || athletesLoading;
  const recentAthletes = (athletesData ?? []).slice(0, 5);
  const firstName = profile?.full_name?.split(" ")[0] ?? "Treinador";

  const metricCards = [
    {
      label: "ALUNOS ATIVOS",
      value: metrics?.activeAthletes ?? 0,
      icon: Users,
      accent: false,
    },
    {
      label: "TREINOS ESTE MÊS",
      value: metrics?.workoutsThisMonth ?? 0,
      icon: Dumbbell,
      accent: false,
    },
    {
      label: "CHECK-INS PENDENTES",
      value: metrics?.pendingCheckins ?? 0,
      icon: ClipboardCheck,
      accent: (metrics?.pendingCheckins ?? 0) > 0,
    },
    {
      label: "INATIVOS (7+ DIAS)",
      value: metrics?.inactiveAthletes ?? 0,
      icon: AlertTriangle,
      accent: (metrics?.inactiveAthletes ?? 0) > 0,
    },
  ];

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        {loading ? (
          <>
            <Skeleton className="mb-2 h-9 w-64 bg-bg-elevated" />
            <Skeleton className="h-4 w-40 bg-bg-elevated" />
          </>
        ) : (
          <>
            <h1 className="font-brand text-3xl text-content-primary md:text-4xl">
              {getGreeting()}, {firstName}.
            </h1>
            <p className="mt-1 text-sm font-medium text-brand-red">
              Inspirando Capacidades
            </p>
          </>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="mb-10 grid grid-cols-2 gap-3 md:gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-card bg-bg-elevated" />
            ))
          : metricCards.map((card) => (
              <div
                key={card.label}
                className="relative rounded-card border border-line-subtle bg-bg-surface p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <card.icon className="size-5 text-content-secondary" />
                  {card.accent && (
                    <span className="size-2 rounded-full bg-brand-red" />
                  )}
                </div>
                <p className="font-brand text-[32px] leading-none text-content-primary">
                  {card.value}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-wider text-content-secondary">
                  {card.label}
                </p>
              </div>
            ))}
      </div>

      {/* Recent Athletes */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-content-primary">
            Alunos(as) Recentes
          </h2>
          <Link
            href="/coach/athletes"
            className="text-xs text-brand-red hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-card bg-bg-elevated" />
            ))}
          </div>
        ) : recentAthletes.length === 0 ? (
          <div className="rounded-card border border-line-subtle bg-bg-surface p-8 text-center">
            <p className="text-sm text-content-secondary">
              Nenhum aluno ainda. Convide o primeiro!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentAthletes.map((athlete) => (
              <Link
                key={athlete.id}
                href={`/coach/athletes/${athlete.id}`}
                className="flex items-center gap-3 rounded-card border border-line-subtle bg-bg-surface p-4 transition-colors duration-200 hover:border-line-default"
              >
                <Avatar className="size-10">
                  <AvatarImage src={athlete.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-brand-red text-xs font-semibold text-white">
                    {getInitials(athlete.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-content-primary truncate">
                    {athlete.full_name}
                  </p>
                  <p className="text-xs text-content-secondary">
                    Último treino: {timeAgo(athlete.last_workout_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
