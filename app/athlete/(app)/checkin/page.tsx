"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getThisWeekCheckin,
  submitCheckin,
  getAthleteCoach,
} from "@/app/actions/athlete";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check } from "lucide-react";
import type { WeeklyCheckin } from "@/lib/types/database";

const energyLabels = ["", "Péssimo", "Ruim", "Ok", "Bom", "Ótimo"];
const sleepLabels = ["", "Péssimo", "Ruim", "Ok", "Bom", "Ótimo"];

function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday.toLocaleDateString("pt-BR"),
    end: sunday.toLocaleDateString("pt-BR"),
  };
}

function RatingCircles({
  value,
  onChange,
  labels,
}: {
  value: number | null;
  onChange: (v: number) => void;
  labels: string[];
}) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className="group flex flex-col items-center gap-1"
        >
          <div
            className={`flex size-9 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all ${
              value === level
                ? "border-brand-red bg-brand-red text-white"
                : "border-line-default text-content-tertiary hover:border-content-secondary"
            }`}
          >
            {level}
          </div>
          <span className="text-[9px] text-content-tertiary">
            {labels[level]}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function CheckinPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const [existingCheckin, setExistingCheckin] = useState<WeeklyCheckin | null>(
    null
  );
  const [coachId, setCoachId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [bodyWeight, setBodyWeight] = useState("");
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [painAreas, setPainAreas] = useState("");
  const [notes, setNotes] = useState("");

  const weekRange = getWeekRange();

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const [checkin, coach] = await Promise.all([
        getThisWeekCheckin(profile!.id),
        getAthleteCoach(profile!.id),
      ]);
      setExistingCheckin(checkin as WeeklyCheckin | null);
      setCoachId(
        coach && typeof coach === "object" && "id" in coach
          ? (coach as { id: string }).id
          : null
      );
      setIsLoading(false);
    }

    load();
  }, [profile]);

  async function handleSubmit() {
    if (!profile || !coachId) return;
    setIsSubmitting(true);
    setError("");

    try {
      await submitCheckin({
        athlete_id: profile.id,
        coach_id: coachId,
        body_weight_kg: bodyWeight ? parseFloat(bodyWeight) : null,
        energy_level: energyLevel,
        sleep_quality: sleepQuality,
        pain_areas: painAreas || null,
        notes: notes || null,
      });

      // Reload to show submitted state
      const checkin = await getThisWeekCheckin(profile.id);
      setExistingCheckin(checkin as WeeklyCheckin | null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar check-in.");
    }

    setIsSubmitting(false);
  }

  const loading = authLoading || isLoading;

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <Skeleton className="mb-2 h-8 w-48 bg-bg-elevated" />
        <Skeleton className="mb-6 h-5 w-64 bg-bg-elevated" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-card bg-bg-elevated" />
          ))}
        </div>
      </div>
    );
  }

  // Already submitted
  if (existingCheckin) {
    return (
      <div className="flex-1 p-6">
        <h1 className="mb-1 font-display text-2xl text-content-primary">
          Check-in da Semana
        </h1>
        <p className="mb-6 text-sm text-content-secondary">
          Semana de {weekRange.start} a {weekRange.end}
        </p>

        <div className="rounded-card border border-state-success/30 bg-state-success/5 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-state-success/15">
              <Check className="size-5 text-state-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-state-success">
                Check-in enviado
              </p>
              <p className="text-xs text-content-secondary">
                Seu treinador já pode ver seus dados.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {existingCheckin.body_weight_kg && (
              <div className="flex justify-between">
                <span className="text-content-secondary">Peso</span>
                <span className="text-content-primary">
                  {existingCheckin.body_weight_kg} kg
                </span>
              </div>
            )}
            {existingCheckin.energy_level && (
              <div className="flex justify-between">
                <span className="text-content-secondary">Energia</span>
                <span className="text-content-primary">
                  {energyLabels[existingCheckin.energy_level]} (
                  {existingCheckin.energy_level}/5)
                </span>
              </div>
            )}
            {existingCheckin.sleep_quality && (
              <div className="flex justify-between">
                <span className="text-content-secondary">Sono</span>
                <span className="text-content-primary">
                  {sleepLabels[existingCheckin.sleep_quality]} (
                  {existingCheckin.sleep_quality}/5)
                </span>
              </div>
            )}
            {existingCheckin.pain_areas && (
              <div className="flex justify-between">
                <span className="text-content-secondary">Dores</span>
                <span className="text-content-primary">
                  {existingCheckin.pain_areas}
                </span>
              </div>
            )}
            {existingCheckin.notes && (
              <div>
                <span className="text-content-secondary">Observações</span>
                <p className="mt-1 text-content-primary">
                  {existingCheckin.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <h1 className="mb-1 font-display text-2xl text-content-primary">
        Check-in da Semana
      </h1>
      <p className="mb-6 text-sm text-content-secondary">
        Semana de {weekRange.start} a {weekRange.end}
      </p>

      <div className="space-y-6">
        {/* Body weight */}
        <div className="space-y-2">
          <label className="text-sm text-content-secondary">
            Peso corporal
          </label>
          <div className="relative">
            <Input
              type="number"
              step="0.1"
              placeholder="0.0"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              className="border-line-default bg-bg-elevated pr-10 text-content-primary placeholder:text-content-tertiary"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-content-tertiary">
              kg
            </span>
          </div>
        </div>

        {/* Energy level */}
        <div className="space-y-2">
          <label className="text-sm text-content-secondary">
            Nível de energia
          </label>
          <RatingCircles
            value={energyLevel}
            onChange={setEnergyLevel}
            labels={energyLabels}
          />
        </div>

        {/* Sleep quality */}
        <div className="space-y-2">
          <label className="text-sm text-content-secondary">
            Qualidade do sono
          </label>
          <RatingCircles
            value={sleepQuality}
            onChange={setSleepQuality}
            labels={sleepLabels}
          />
        </div>

        {/* Pain areas */}
        <div className="space-y-2">
          <label className="text-sm text-content-secondary">
            Dores ou lesões
          </label>
          <Textarea
            placeholder="Alguma dor ou desconforto?"
            value={painAreas}
            onChange={(e) => setPainAreas(e.target.value)}
            className="min-h-[60px] border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm text-content-secondary">Observações</label>
          <Textarea
            placeholder="Como foi a semana?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[60px] border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
          />
        </div>

        {error && (
          <p className="text-sm text-state-error">{error}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="h-12 w-full rounded-input bg-brand-red text-white font-semibold hover:bg-brand-red-dark"
        >
          {isSubmitting ? "Enviando..." : "Enviar Check-in"}
        </Button>
      </div>
    </div>
  );
}
