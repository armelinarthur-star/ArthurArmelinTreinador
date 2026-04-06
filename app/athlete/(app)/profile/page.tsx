"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getAthleteProfileData } from "@/app/actions/athlete";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { QuickActions } from "@/components/profile/QuickActions";
import { MenuGroup } from "@/components/profile/MenuGroup";
import { MenuItem } from "@/components/profile/MenuItem";
import {
  User,
  Target,
  Calendar,
  TrendingUp,
  Activity,
  Camera,
  Flame,
  Star,
  Award,
  Bell,
  ClipboardList,
  MessageCircle,
  Scale,
  Globe,
  Edit,
  Lock,
  LogOut,
  HelpCircle,
  AlertCircle,
  FileText,
} from "lucide-react";

interface ProfileData {
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    phone: string | null;
  };
  anamnesis: { primary_goal: string | null; days_per_week: number | null } | null;
  streak: { current_streak: number; longest_streak: number };
  lastWorkoutDate: string | null;
}

export default function AthleteProfilePage() {
  const { profile: authProfile, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Notification toggles (localStorage)
  const [notifWorkout, setNotifWorkout] = useState(false);
  const [notifCheckin, setNotifCheckin] = useState(false);
  const [notifMessages, setNotifMessages] = useState(false);

  // Weight unit toggle
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");

  // Load localStorage on mount
  useEffect(() => {
    setNotifWorkout(localStorage.getItem("notif_workout") === "true");
    setNotifCheckin(localStorage.getItem("notif_checkin") === "true");
    setNotifMessages(localStorage.getItem("notif_messages") === "true");
    setWeightUnit(
      (localStorage.getItem("weight_unit") as "kg" | "lb") || "kg"
    );
  }, []);

  // Fetch profile data
  useEffect(() => {
    if (!authProfile) return;

    async function load() {
      try {
        const result = await getAthleteProfileData(authProfile!.id);
        setData(result as ProfileData);
      } catch {
        // silent
      }
      setLoading(false);
    }

    load();
  }, [authProfile]);

  const handleToggle = useCallback(
    (key: string, setter: (v: boolean) => void) => (val: boolean) => {
      setter(val);
      localStorage.setItem(key, val.toString());
    },
    []
  );

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

  if (authLoading || loading) {
    return (
      <div className="flex-1 p-5">
        {/* Header skeleton */}
        <div className="mb-4 animate-pulse rounded-[16px] bg-[#0D0D0D] p-5" style={{ borderTop: "3px solid #FF0025" }}>
          <div className="flex items-center gap-4">
            <div className="size-[72px] rounded-full bg-[#1A1A1A]" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-36 rounded bg-[#1A1A1A]" />
              <div className="h-4 w-20 rounded bg-[#1A1A1A]" />
            </div>
          </div>
          <div className="mt-4 flex">
            <div className="flex-1 space-y-1.5 text-center">
              <div className="mx-auto h-3 w-16 rounded bg-[#1A1A1A]" />
              <div className="mx-auto h-4 w-12 rounded bg-[#1A1A1A]" />
            </div>
            <div className="h-8 w-px bg-[rgba(255,255,255,0.08)]" />
            <div className="flex-1 space-y-1.5 text-center">
              <div className="mx-auto h-3 w-16 rounded bg-[#1A1A1A]" />
              <div className="mx-auto h-4 w-12 rounded bg-[#1A1A1A]" />
            </div>
          </div>
        </div>

        {/* Menu skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4 animate-pulse rounded-[12px] bg-[#0D0D0D] p-4">
            <div className="h-4 w-24 rounded bg-[#1A1A1A]" />
          </div>
        ))}
      </div>
    );
  }

  if (!data?.profile) return null;

  return (
    <div className="flex-1 space-y-5 p-5">
      {/* SECTION 1 — Header */}
      <ProfileHeader
        profile={data.profile}
        anamnesis={data.anamnesis}
        streak={data.streak}
        lastWorkoutDate={data.lastWorkoutDate}
      />

      {/* SECTION 2 — Quick Actions */}
      <QuickActions />

      {/* SECTION 3 — Menu Groups */}

      {/* Meus Dados */}
      <MenuGroup title="Meus Dados">
        <MenuItem icon={User} label="Dados fisicos" href="/athlete/profile/physical" />
        <MenuItem icon={Target} label="Objetivo atual" href="/athlete/profile/goal" />
        <MenuItem
          icon={Calendar}
          label="Frequencia semanal"
          href="/athlete/profile/frequency"
          isLast
        />
      </MenuGroup>

      {/* Progresso */}
      <MenuGroup title="Progresso">
        <MenuItem icon={TrendingUp} label="Evolucao de carga" badge="Em breve" disabled />
        <MenuItem icon={Activity} label="Peso corporal" badge="Em breve" disabled />
        <MenuItem icon={Camera} label="Fotos de progresso" badge="Em breve" disabled isLast />
      </MenuGroup>

      {/* Conquistas */}
      <MenuGroup title="Conquistas">
        <MenuItem
          icon={Flame}
          label="Streak atual"
          value={
            data.streak.current_streak > 0
              ? `\uD83D\uDD25 ${data.streak.current_streak} dias`
              : "0 dias"
          }
          href="/athlete/achievements"
        />
        <MenuItem icon={Star} label="Pontuacao" badge="Em breve" disabled />
        <MenuItem icon={Award} label="Badges" badge="Em breve" disabled isLast />
      </MenuGroup>

      {/* Notificacoes */}
      <MenuGroup title="Notificacoes">
        <MenuItem
          icon={Bell}
          label="Lembretes de treino"
          toggle
          toggleValue={notifWorkout}
          onToggle={handleToggle("notif_workout", setNotifWorkout)}
        />
        <MenuItem
          icon={ClipboardList}
          label="Check-in semanal"
          toggle
          toggleValue={notifCheckin}
          onToggle={handleToggle("notif_checkin", setNotifCheckin)}
        />
        <MenuItem
          icon={MessageCircle}
          label="Mensagens"
          toggle
          toggleValue={notifMessages}
          onToggle={handleToggle("notif_messages", setNotifMessages)}
          isLast
        />
      </MenuGroup>

      {/* Configuracoes */}
      <MenuGroup title="Configuracoes">
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
        <MenuItem icon={Edit} label="Editar perfil" href="/athlete/profile/edit" />
        <MenuItem icon={Lock} label="Alterar senha" href="/athlete/profile/change-password" />
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

      {/* Bottom spacer for tab bar */}
      <div className="h-4" />
    </div>
  );
}
