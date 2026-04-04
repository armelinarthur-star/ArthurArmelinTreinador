"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAthleteById, getAthleteCheckins } from "@/app/actions/athletes";
import { getInitials, timeAgo } from "@/lib/utils/greeting";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Profile, WeeklyCheckin } from "@/lib/types/database";

interface AthleteData {
  profile: Profile;
  streak: { current_streak: number; longest_streak: number } | null;
  workouts: {
    id: string;
    name: string;
    status: string;
    scheduled_date: string | null;
    created_at: string;
  }[];
}

const energyIcons = ["", "😴", "🥱", "😐", "💪", "🔥"];
const sleepIcons = ["", "😵", "😩", "😑", "😊", "😴"];

function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: "Rascunho",
    active: "Ativo",
    completed: "Concluído",
    archived: "Arquivado",
  };
  return map[status] ?? status;
}

function statusColor(status: string) {
  if (status === "completed") return "bg-state-success/15 text-state-success";
  if (status === "active") return "bg-brand-red-subtle text-brand-red";
  return "bg-bg-elevated text-content-secondary";
}

export default function AthleteProfilePage() {
  const params = useParams();
  const athleteId = params.id as string;

  const [data, setData] = useState<AthleteData | null>(null);
  const [checkins, setCheckins] = useState<WeeklyCheckin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [athleteData, checkinsData] = await Promise.all([
        getAthleteById(athleteId),
        getAthleteCheckins(athleteId),
      ]);
      setData(athleteData);
      setCheckins(checkinsData);
      setIsLoading(false);
    }

    load();
  }, [athleteId]);

  if (isLoading) {
    return (
      <div className="flex-1 p-6 md:p-8">
        <Skeleton className="mb-6 h-6 w-32 bg-bg-elevated" />
        <div className="mb-8 flex items-center gap-4">
          <Skeleton className="size-16 rounded-full bg-bg-elevated" />
          <div>
            <Skeleton className="mb-2 h-6 w-48 bg-bg-elevated" />
            <Skeleton className="h-4 w-24 bg-bg-elevated" />
          </div>
        </div>
        <Skeleton className="h-10 w-full bg-bg-elevated" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-card bg-bg-elevated" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-content-secondary">Aluno não encontrado.</p>
      </div>
    );
  }

  const { profile, streak, workouts } = data;

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Back */}
      <Link
        href="/coach/athletes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="bg-brand-red text-lg font-semibold text-white">
            {getInitials(profile.full_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold text-content-primary">
            {profile.full_name}
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <Badge className="bg-state-success/15 text-state-success text-[10px]">
              Ativo
            </Badge>
            {streak && streak.current_streak > 0 && (
              <span className="text-xs text-content-secondary">
                🔥 {streak.current_streak} dias seguidos
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="workouts" className="w-full">
        <TabsList className="mb-4 w-full justify-start gap-1 rounded-card border border-line-subtle bg-bg-surface p-1">
          <TabsTrigger
            value="workouts"
            className="rounded-input px-4 py-2 text-sm text-content-secondary data-[state=active]:bg-bg-elevated data-[state=active]:text-content-primary"
          >
            Treinos
          </TabsTrigger>
          <TabsTrigger
            value="checkins"
            className="rounded-input px-4 py-2 text-sm text-content-secondary data-[state=active]:bg-bg-elevated data-[state=active]:text-content-primary"
          >
            Check-ins
          </TabsTrigger>
          <TabsTrigger
            value="progress"
            className="rounded-input px-4 py-2 text-sm text-content-secondary data-[state=active]:bg-bg-elevated data-[state=active]:text-content-primary"
          >
            Progresso
          </TabsTrigger>
        </TabsList>

        {/* Workouts Tab */}
        <TabsContent value="workouts">
          {workouts.length === 0 ? (
            <div className="rounded-card border border-line-subtle bg-bg-surface p-8 text-center">
              <Dumbbell className="mx-auto mb-3 size-8 text-content-tertiary" />
              <p className="text-sm text-content-secondary">
                Nenhum treino atribuído ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {workouts.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-card border border-line-subtle bg-bg-surface p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-content-primary">
                      {w.name}
                    </p>
                    <p className="text-xs text-content-secondary">
                      {w.scheduled_date
                        ? new Date(w.scheduled_date).toLocaleDateString("pt-BR")
                        : timeAgo(w.created_at)}
                    </p>
                  </div>
                  <Badge className={`text-[10px] ${statusColor(w.status)}`}>
                    {statusLabel(w.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Check-ins Tab */}
        <TabsContent value="checkins">
          {checkins.length === 0 ? (
            <div className="rounded-card border border-line-subtle bg-bg-surface p-8 text-center">
              <p className="text-sm text-content-secondary">
                Nenhum check-in enviado ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {checkins.map((c) => (
                <div
                  key={c.id}
                  className="rounded-card border border-line-subtle bg-bg-surface p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-content-primary">
                      Semana de{" "}
                      {new Date(c.week_start).toLocaleDateString("pt-BR")}
                    </p>
                    {c.body_weight_kg && (
                      <span className="text-xs text-content-secondary">
                        {c.body_weight_kg} kg
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-content-secondary">
                    {c.energy_level && (
                      <span>
                        Energia: {energyIcons[c.energy_level]} {c.energy_level}
                        /5
                      </span>
                    )}
                    {c.sleep_quality && (
                      <span>
                        Sono: {sleepIcons[c.sleep_quality]} {c.sleep_quality}/5
                      </span>
                    )}
                  </div>
                  {c.notes && (
                    <p className="mt-2 text-xs text-content-tertiary">
                      {c.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <div className="rounded-card border border-line-subtle bg-bg-surface p-8 text-center">
            <p className="text-sm text-content-secondary">Em breve</p>
            <div className="mx-auto mt-3 h-[2px] w-8 bg-brand-red opacity-50" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
