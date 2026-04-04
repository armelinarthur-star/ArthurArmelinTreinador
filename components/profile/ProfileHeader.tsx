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
    <div className="rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[#0D0D0D] p-5" style={{ borderTop: "3px solid #FF0025" }}>
      {/* Avatar + Name + Goal */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
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
          <h1 className="truncate text-xl font-bold text-white">
            {profile.full_name}
          </h1>

          {/* Goal badge */}
          {goal ? (
            <span className="mt-1 inline-block rounded-[9999px] bg-[rgba(255,0,37,0.12)] px-3 py-0.5 text-xs font-medium text-brand-red">
              {goal}
            </span>
          ) : (
            <span className="mt-1 inline-block rounded-[9999px] bg-[rgba(136,136,136,0.12)] px-3 py-0.5 text-xs font-medium text-[#888888]">
              Objetivo nao definido
            </span>
          )}

          {/* Streak */}
          {streak.current_streak > 0 && (
            <p className="mt-1.5 text-sm font-bold text-white">
              {"\uD83D\uDD25"} {streak.current_streak} dias
            </p>
          )}
        </div>
      </div>

      {/* Quick stats divider row */}
      <div className="mt-4 flex items-center">
        {/* Frequency */}
        <div className="flex-1 text-center">
          <p className="text-[11px] text-[#888888]">Frequencia</p>
          <p className="mt-0.5 text-sm font-semibold text-white">
            {frequency ? `${frequency}x/semana` : "-"}
          </p>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-[rgba(255,255,255,0.08)]" />

        {/* Last workout */}
        <div className="flex-1 text-center">
          <p className="text-[11px] text-[#888888]">Ultimo treino</p>
          <p className="mt-0.5 text-sm font-semibold text-white">
            {lastWorkoutDate
              ? timeAgo(lastWorkoutDate)
              : "Primeiro treino pendente"}
          </p>
        </div>
      </div>
    </div>
  );
}
