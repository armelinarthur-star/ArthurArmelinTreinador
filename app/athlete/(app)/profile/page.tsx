"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAthleteCoach, updateAthleteProfile } from "@/app/actions/athlete";
import { getInitials } from "@/lib/utils/greeting";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, LogOut, MessageSquare, X, Check } from "lucide-react";

interface Coach {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export default function AthleteProfilePage() {
  const { profile, isLoading: authLoading, signOut } = useAuth();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const coachData = await getAthleteCoach(profile!.id);
      setCoach(coachData as Coach | null);
      setIsLoading(false);
    }

    load();
  }, [profile]);

  function startEditing() {
    if (!profile) return;
    setEditName(profile.full_name);
    setEditPhone(profile.phone ?? "");
    setIsEditing(true);
  }

  async function handleSave() {
    if (!profile) return;
    setIsSaving(true);
    try {
      await updateAthleteProfile(profile.id, {
        full_name: editName,
        phone: editPhone || null,
      });
      setIsEditing(false);
      window.location.reload();
    } catch {
      // silent
    }
    setIsSaving(false);
  }

  const loading = authLoading || isLoading;

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="size-20 rounded-full bg-bg-elevated" />
          <Skeleton className="h-6 w-40 bg-bg-elevated" />
          <Skeleton className="h-4 w-32 bg-bg-elevated" />
        </div>
        <div className="mt-8 space-y-3">
          <Skeleton className="h-20 rounded-card bg-bg-elevated" />
          <Skeleton className="h-12 rounded-card bg-bg-elevated" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex-1 p-6">
      {/* Avatar + Info */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Avatar className="size-20">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="bg-brand-red text-2xl font-bold text-white">
            {getInitials(profile.full_name)}
          </AvatarFallback>
        </Avatar>

        {isEditing ? (
          <div className="w-full max-w-xs space-y-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nome completo"
              className="border-line-default bg-bg-elevated text-center text-content-primary"
            />
            <Input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="Telefone"
              className="border-line-default bg-bg-elevated text-center text-content-primary"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="flex-1 gap-1 border-line-default text-content-primary hover:bg-bg-elevated"
              >
                <X className="size-3.5" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !editName.trim()}
                className="flex-1 gap-1 bg-brand-red text-white hover:bg-brand-red-dark"
              >
                <Check className="size-3.5" />
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-content-primary">
              {profile.full_name}
            </h1>
            <p className="text-sm text-content-secondary">{profile.email}</p>
            {profile.phone && (
              <p className="text-xs text-content-tertiary">{profile.phone}</p>
            )}
          </>
        )}
      </div>

      {/* Coach card */}
      {coach && (
        <div className="mb-4 rounded-card border border-line-subtle bg-bg-surface p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-content-tertiary">
            Meu Treinador
          </p>
          <div className="flex items-center gap-3">
            <Avatar className="size-11">
              <AvatarImage src={coach.avatar_url ?? undefined} />
              <AvatarFallback className="bg-brand-red text-sm font-semibold text-white">
                {getInitials(coach.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-content-primary">
                {coach.full_name}
              </p>
              <p className="text-xs text-content-secondary">Treinador</p>
            </div>
            <button className="rounded-input p-2 text-content-secondary hover:bg-bg-elevated hover:text-content-primary">
              <MessageSquare className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {!isEditing && (
          <button
            onClick={startEditing}
            className="flex w-full items-center gap-3 rounded-card border border-line-subtle bg-bg-surface p-4 text-left transition-colors hover:border-brand-red/20"
          >
            <Pencil className="size-4 text-content-secondary" />
            <span className="text-sm text-content-primary">
              Editar nome e telefone
            </span>
          </button>
        )}

        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-card border border-line-subtle bg-bg-surface p-4 text-left transition-colors hover:border-state-error/30"
        >
          <LogOut className="size-4 text-content-secondary" />
          <span className="text-sm text-content-primary">Sair</span>
        </button>
      </div>
    </div>
  );
}
