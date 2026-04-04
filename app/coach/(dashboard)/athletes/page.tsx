"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAthletes } from "@/app/actions/athletes";
import { timeAgo, getInitials } from "@/lib/utils/greeting";
import { InviteDialog } from "@/components/coach/InviteDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Athlete {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  status: string;
  last_workout_at: string | null;
  created_at: string;
}

type Filter = "all" | "active" | "inactive";

export default function AthletesPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const data = await getAthletes(profile!.id);
      setAthletes(data);
      setIsLoading(false);
    }

    load();
  }, [profile]);

  const loading = authLoading || isLoading;

  const filtered = athletes.filter((a) => {
    const matchesSearch = a.full_name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && a.status === "active") ||
      (filter === "inactive" && a.status === "inactive");
    return matchesSearch && matchesFilter;
  });

  const filters: { label: string; value: Filter }[] = [
    { label: "Todos", value: "all" },
    { label: "Ativos", value: "active" },
    { label: "Inativos", value: "inactive" },
  ];

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-content-primary">
          Meus Alunos(as)
        </h1>
        {profile && <InviteDialog coachId={profile.id} />}
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-line-default bg-bg-elevated pl-9 text-content-primary placeholder:text-content-tertiary"
          />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-pill px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                filter === f.value
                  ? "bg-brand-red text-white"
                  : "bg-bg-elevated text-content-secondary hover:text-content-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-card bg-bg-elevated" />
          ))}
        </div>
      ) : filtered.length === 0 && athletes.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center gap-4 rounded-card border border-line-subtle bg-bg-surface py-16">
          <Image
            src="/brand/LOGO04_BRANCO.png"
            alt="Arthur Armelin"
            width={100}
            height={25}
            className="h-auto w-auto max-w-[100px] opacity-30"
          />
          <p className="text-sm text-content-secondary">
            Nenhum aluno ainda. Convide o primeiro.
          </p>
          {profile && (
            <InviteDialog
              coachId={profile.id}
              trigger={
                <Button className="mt-2 gap-2 rounded-input bg-brand-red text-white hover:bg-brand-red-dark">
                  Convidar Aluno(a)
                </Button>
              }
            />
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-card border border-line-subtle bg-bg-surface p-8 text-center">
          <p className="text-sm text-content-secondary">
            Nenhum resultado para &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((athlete) => (
            <div
              key={athlete.id}
              className="flex items-center gap-4 rounded-card border border-line-subtle bg-bg-surface p-4"
            >
              <Avatar className="size-11">
                <AvatarImage src={athlete.avatar_url ?? undefined} />
                <AvatarFallback className="bg-brand-red text-sm font-semibold text-white">
                  {getInitials(athlete.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-medium text-content-primary truncate">
                    {athlete.full_name}
                  </p>
                  <Badge
                    variant={
                      athlete.status === "active" ? "default" : "secondary"
                    }
                    className={`text-[10px] ${
                      athlete.status === "active"
                        ? "bg-state-success/15 text-state-success"
                        : "bg-bg-elevated text-content-secondary"
                    }`}
                  >
                    {athlete.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="text-xs text-content-secondary">
                  Último treino: {timeAgo(athlete.last_workout_at)}
                </p>
              </div>

              <Link
                href={`/coach/athletes/${athlete.id}`}
                className="shrink-0 rounded-input border border-line-default px-3 py-1.5 text-xs font-medium text-content-primary transition-colors hover:bg-bg-elevated"
              >
                Ver Perfil
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
