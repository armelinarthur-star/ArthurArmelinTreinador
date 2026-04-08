"use client";

import { getInitials } from "@/lib/utils/greeting";
import { timeAgo } from "@/lib/utils/greeting";

interface ProfileHeaderProps {
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
  anamnesis: {
    primary_goal: string | null;
    days_per_week: number | null;
  } | null;
  streak: { current_streak: number };
  lastWorkoutDate: string | null;
}

export function ProfileHeader({
  profile,
  anamnesis,
  streak,
  lastWorkoutDate,
}: ProfileHeaderProps) {
  const initials = getInitials(profile.full_name);
  const goal = anamnesis?.primary_goal;
  const frequency = anamnesis?.days_per_week;

  return (
    <div className="rounded-[16px] border border-line-subtle bg-bg-surface p-5" style={{ borderTop: "3px solid #FF0025" }}>
      {/* Avatar + Name + Goal */}
      <div className="flex items-center gap-4">
        <div className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-brand-red">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="size-[72px] rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-white">{initials}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-content-primary">
            {profile.full_name}
          </h1>

          {goal ? (
            <span className="mt-1 inline-block rounded-pill bg-brand-red-subtle px-3 py-0.5 text-xs font-medium text-brand-red">
              {goal}
            </span>
          ) : (
            <span className="mt-1 inline-block rounded-pill bg-bg-elevated px-3 py-0.5 text-xs font-medium text-content-secondary">
              Objetivo nao definido
            </span>
          )}

          {streak.current_streak > 0 && (
            <p className="mt-1.5 text-sm font-bold text-content-primary">
              {"\uD83D\uDD25"} {streak.current_streak} dias
            </p>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-4 flex items-center">
        <div className="flex-1 text-center">
          <p className="text-[11px] text-content-secondary">Frequencia</p>
          <p className="mt-0.5 text-sm font-semibold text-content-primary">
            {frequency ? `${frequency}x/semana` : "-"}
          </p>
        </div>
        <div className="h-8 w-px bg-line-subtle" />
        <div className="flex-1 text-center">
          <p className="text-[11px] text-content-secondary">Ultimo treino</p>
          <p className="mt-0.5 text-sm font-semibold text-content-primary">
            {lastWorkoutDate
              ? timeAgo(lastWorkoutDate)
              : "Primeiro treino pendente"}
          </p>
        </div>
      </div>
    </div>
  );
}
