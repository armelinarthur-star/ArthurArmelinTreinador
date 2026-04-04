"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getWorkouts, archiveWorkout, duplicateWorkout } from "@/app/actions/workouts";
import { getInitials, timeAgo } from "@/lib/utils/greeting";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Pencil, Copy, Archive } from "lucide-react";

type TabValue = "active" | "draft" | "archived";

interface WorkoutRow {
  id: string;
  name: string;
  status: string;
  scheduled_date: string | null;
  created_at: string;
  day_label: string | null;
  athlete: { id: string; full_name: string; avatar_url: string | null } | null;
}

const statusLabels: Record<string, string> = {
  active: "Ativo",
  draft: "Rascunho",
  completed: "Concluído",
  archived: "Arquivado",
};

const statusColors: Record<string, string> = {
  active: "bg-state-success/15 text-state-success",
  draft: "bg-bg-elevated text-content-secondary",
  completed: "bg-brand-red-subtle text-brand-red",
  archived: "bg-bg-elevated text-content-tertiary",
};

export default function WorkoutsPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<TabValue>("active");
  const router = useRouter();

  useEffect(() => {
    if (!profile) return;
    loadWorkouts();
  }, [profile, tab]);

  async function loadWorkouts() {
    setIsLoading(true);
    const data = await getWorkouts(profile!.id, tab);
    setWorkouts(data as WorkoutRow[]);
    setIsLoading(false);
  }

  async function handleArchive(id: string) {
    await archiveWorkout(id);
    loadWorkouts();
  }

  async function handleDuplicate(id: string) {
    if (!profile) return;
    const newId = await duplicateWorkout(id, profile.id);
    router.push(`/coach/workouts/${newId}/edit`);
  }

  const tabs: { label: string; value: TabValue }[] = [
    { label: "Ativos", value: "active" },
    { label: "Rascunhos", value: "draft" },
    { label: "Arquivados", value: "archived" },
  ];

  const loading = authLoading || isLoading;

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-content-primary">Treinos</h1>
        <Link href="/coach/workouts/new">
          <Button className="gap-2 rounded-input bg-brand-red text-white hover:bg-brand-red-dark">
            <Plus className="size-4" />
            Criar Treino
          </Button>
        </Link>
      </div>

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
      ) : workouts.length === 0 ? (
        <div className="rounded-card border border-line-subtle bg-bg-surface py-16 text-center">
          <p className="text-sm text-content-secondary">
            {tab === "active"
              ? "Nenhum treino ativo. Crie o primeiro!"
              : tab === "draft"
              ? "Nenhum rascunho."
              : "Nenhum treino arquivado."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {workouts.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-4 rounded-card border border-line-subtle bg-bg-surface p-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-medium text-content-primary truncate">
                    {w.name}
                  </p>
                  <Badge
                    className={`text-[10px] ${statusColors[w.status] ?? statusColors.draft}`}
                  >
                    {statusLabels[w.status] ?? w.status}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-content-secondary">
                  {w.athlete && (
                    <span className="flex items-center gap-1.5">
                      <Avatar className="size-4">
                        <AvatarImage src={w.athlete.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-brand-red text-[8px] text-white">
                          {getInitials(w.athlete.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      {w.athlete.full_name}
                    </span>
                  )}
                  {w.scheduled_date && (
                    <span>
                      {new Date(w.scheduled_date).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  {w.day_label && <span>{w.day_label}</span>}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="rounded-input p-2 text-content-secondary hover:bg-bg-elevated hover:text-content-primary" />
                  }
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-line-subtle bg-bg-surface">
                  <DropdownMenuItem
                    onClick={() => router.push(`/coach/workouts/${w.id}/edit`)}
                    className="gap-2 text-content-primary hover:bg-bg-elevated"
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDuplicate(w.id)}
                    className="gap-2 text-content-primary hover:bg-bg-elevated"
                  >
                    <Copy className="size-3.5" />
                    Duplicar
                  </DropdownMenuItem>
                  {w.status !== "archived" && (
                    <DropdownMenuItem
                      onClick={() => handleArchive(w.id)}
                      className="gap-2 text-content-primary hover:bg-bg-elevated"
                    >
                      <Archive className="size-3.5" />
                      Arquivar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
