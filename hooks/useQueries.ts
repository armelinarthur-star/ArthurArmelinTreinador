import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardMetrics, getAthletes } from "@/app/actions/athletes";
import { getWorkouts, searchExercises } from "@/app/actions/workouts";
import {
  getTodayWorkout,
  getAthleteStreak,
  getUpcomingWorkouts,
  getAthleteWorkouts,
  getWorkoutDetail,
  getThisWeekCheckin,
  getAthleteCoach,
  getAthleteProfileData,
} from "@/app/actions/athlete";
import { getAthleteVolumeAnalysis } from "@/app/actions/workouts";
import type { MuscleGroup } from "@/lib/types/database";

// ─── Coach Queries ───

export function useDashboardMetrics() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["dashboard-metrics", profile?.id],
    queryFn: () => getDashboardMetrics(profile!.id),
    enabled: !!profile,
    staleTime: 2 * 60 * 1000, // 2 min — changes with new workouts
  });
}

export function useCoachAthletes() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["coach-athletes", profile?.id],
    queryFn: () => getAthletes(profile!.id),
    enabled: !!profile,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useCoachWorkouts(tab: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["coach-workouts", profile?.id, tab],
    queryFn: () => getWorkouts(profile!.id, tab),
    enabled: !!profile,
    staleTime: 2 * 60 * 1000,
  });
}

export function useExerciseSearch(query: string, muscleFilter?: MuscleGroup) {
  return useQuery({
    queryKey: ["exercises", query, muscleFilter],
    queryFn: () =>
      searchExercises(query, muscleFilter === ("" as MuscleGroup) ? undefined : muscleFilter),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Athlete Queries ───

export function useTodayWorkout() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["today-workout", profile?.id],
    queryFn: () => getTodayWorkout(profile!.id),
    enabled: !!profile,
    staleTime: 60 * 1000, // 1 min — real-time-ish
  });
}

export function useAthleteStreak() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["athlete-streak", profile?.id],
    queryFn: () => getAthleteStreak(profile!.id),
    enabled: !!profile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpcomingWorkouts() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["upcoming-workouts", profile?.id],
    queryFn: () => getUpcomingWorkouts(profile!.id),
    enabled: !!profile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAthleteWorkouts() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["athlete-workouts", profile?.id],
    queryFn: () => getAthleteWorkouts(profile!.id),
    enabled: !!profile,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAthleteVolume() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["athlete-volume", profile?.id],
    queryFn: () => getAthleteVolumeAnalysis(profile!.id),
    enabled: !!profile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useWorkoutDetail(workoutId: string) {
  return useQuery({
    queryKey: ["workout-detail", workoutId],
    queryFn: () => getWorkoutDetail(workoutId),
    enabled: !!workoutId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useWeeklyCheckin() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["weekly-checkin", profile?.id],
    queryFn: () => getThisWeekCheckin(profile!.id),
    enabled: !!profile,
    staleTime: 60 * 1000,
  });
}

export function useAthleteCoach() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["athlete-coach", profile?.id],
    queryFn: () => getAthleteCoach(profile!.id),
    enabled: !!profile,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAthleteProfileData() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["athlete-profile-data", profile?.id],
    queryFn: () => getAthleteProfileData(profile!.id),
    enabled: !!profile,
    staleTime: 5 * 60 * 1000,
  });
}
