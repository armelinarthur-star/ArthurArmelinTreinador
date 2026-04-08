"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils/greeting";
import { MenuGroup } from "@/components/profile/MenuGroup";
import { MenuItem } from "@/components/profile/MenuItem";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sun,
  Scale,
  Globe,
  Edit,
  Lock,
  LogOut,
  HelpCircle,
  AlertCircle,
  FileText,
  Users,
  Dumbbell,
  BookOpen,
} from "lucide-react";

export default function CoachProfilePage() {
  const { profile, isLoading, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");

  useEffect(() => {
    setWeightUnit(
      (localStorage.getItem("weight_unit") as "kg" | "lb") || "kg"
    );
  }, []);

  const toggleWeightUnit = useCallback(() => {
    setWeightUnit((prev) => {
      const next = prev === "kg" ? "lb" : "kg";
      localStorage.setItem("weight_unit", next);
      return next;
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push("/");
  }, [signOut, router]);

  if (isLoading) {
    return (
      <div className="flex-1 p-5">
        <div className="mb-6 animate-pulse rounded-[16px] bg-bg-surface p-5" style={{ borderTop: "3px solid #FF0025" }}>
          <div className="flex items-center gap-4">
            <div className="size-[72px] rounded-full bg-bg-elevated" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-36 bg-bg-elevated" />
              <Skeleton className="h-4 w-48 bg-bg-elevated" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex-1 space-y-5 p-5 md:p-8">
      {/* Header */}
      <div
        className="rounded-[16px] border border-line-subtle bg-bg-surface p-5"
        style={{ borderTop: "3px solid #FF0025" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-brand-red">
            <span className="text-2xl font-bold text-white">
              {getInitials(profile.full_name)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-content-primary">
              {profile.full_name}
            </h1>
            <p className="mt-0.5 text-sm text-content-secondary">
              {profile.email}
            </p>
            <span className="mt-1 inline-block rounded-[9999px] bg-brand-red-subtle px-3 py-0.5 text-xs font-medium text-brand-red">
              Treinador
            </span>
          </div>
        </div>
      </div>

      {/* Atalhos */}
      <MenuGroup title="Atalhos">
        <MenuItem icon={Users} label="Meus Alunos(as)" href="/coach/athletes" />
        <MenuItem icon={Dumbbell} label="Treinos" href="/coach/workouts" />
        <MenuItem icon={BookOpen} label="Exercicios" href="/coach/exercises" isLast />
      </MenuGroup>

      {/* Configuracoes */}
      <MenuGroup title="Configuracoes">
        <MenuItem
          icon={Sun}
          label="Tema"
          toggle
          toggleValue={theme === "dark"}
          onToggle={(dark) => setTheme(dark ? "dark" : "light")}
        />
        <MenuItem
          icon={Scale}
          label="Unidade de peso"
          value={weightUnit}
          onPress={toggleWeightUnit}
        />
        <MenuItem icon={Globe} label="Idioma" value="Portugues" isLast />
      </MenuGroup>

      {/* Conta */}
      <MenuGroup title="Conta">
        <MenuItem icon={Edit} label="Editar perfil" href="/coach/profile/edit" />
        <MenuItem icon={Lock} label="Alterar senha" href="/coach/profile/change-password" />
        <MenuItem
          icon={LogOut}
          label="Sair"
          onPress={handleSignOut}
          destructive
          isLast
        />
      </MenuGroup>

      {/* Suporte */}
      <MenuGroup title="Suporte">
        <MenuItem
          icon={HelpCircle}
          label="Ajuda"
          href="mailto:armelin.arthur@gmail.com"
        />
        <MenuItem
          icon={AlertCircle}
          label="Reportar problema"
          href="mailto:armelin.arthur@gmail.com?subject=Reportar%20problema%20-%20Arthur%20Armelin%20Treinador"
        />
        <MenuItem
          icon={FileText}
          label="Termos e privacidade"
          href="/legal/privacy"
          isLast
        />
      </MenuGroup>

      <div className="h-4" />
    </div>
  );
}
