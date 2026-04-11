"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAthletes } from "@/app/actions/athletes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sparkles,
  Loader2,
  Check,
  Copy,
  ArrowLeft,
  Save,
  AlertCircle,
  Dumbbell,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Athlete {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface GeneratedExercise {
  name: string;
  method: string;
  sets: number;
  reps: string;
  interval: string;
  observations?: string;
}

interface GeneratedWorkout {
  focus: string;
  exercises: GeneratedExercise[];
}

interface GeneratedPlan {
  workout_split: string[];
  workouts: Record<string, GeneratedWorkout>;
}

const methodColors: Record<string, string> = {
  Tradicional: "bg-blue-500/20 text-blue-400",
  BiSet: "bg-purple-500/20 text-purple-400",
  "Bi-Set": "bg-purple-500/20 text-purple-400",
  DropSet: "bg-orange-500/20 text-orange-400",
  "Pré-Exaustão": "bg-red-500/20 text-red-400",
  "Pico de Contração": "bg-green-500/20 text-green-400",
  "Cluster Set": "bg-yellow-500/20 text-yellow-400",
};

export default function GenerateWorkoutPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [rawText, setRawText] = useState("");
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (user && profile?.role === "coach") {
      getAthletes(user.id).then((data) => {
        if (data) {
          const active = data
            .filter((r) => r.status === "active")
            .map((r) => ({
              id: r.id,
              full_name: r.full_name,
              email: r.email,
              avatar_url: r.avatar_url,
            }));
          setAthletes(active);
        }
      });
    }
  }, [user, profile]);

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId);

  const handleGenerate = useCallback(async () => {
    if (!selectedAthleteId || !selectedAthlete) return;

    setGenerating(true);
    setRawText("");
    setPlan(null);
    setError("");
    setSaved(false);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: selectedAthleteId,
          athleteName: selectedAthlete.full_name,
          extraNotes: extraNotes.trim() || undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro ao gerar treino");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                setError(parsed.error);
                continue;
              }
              if (parsed.text) {
                accumulated += parsed.text;
                setRawText(accumulated);
              }
            } catch {
              // ignore partial JSON
            }
          }
        }
      }

      // Parse the final JSON
      const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as GeneratedPlan;
        setPlan(parsed);
      } else {
        setError("Resposta não contém JSON válido.");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }, [selectedAthleteId, selectedAthlete, extraNotes]);

  const handleCancel = () => {
    abortRef.current?.abort();
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!plan || !user || !selectedAthleteId) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: saveError } = await supabase
        .from("generated_workout_plans")
        .insert({
          coach_id: user.id,
          student_id: selectedAthleteId,
          student_name: selectedAthlete?.full_name ?? "",
          input_profile: {},
          workout_split: plan.workout_split,
          workouts: plan.workouts,
          status: "draft",
        });

      if (saveError) throw saveError;
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (plan) {
      navigator.clipboard.writeText(JSON.stringify(plan, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/coach/workouts"
          className="rounded-lg p-2 text-content-secondary hover:bg-bg-subtle hover:text-content-primary transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-content-primary flex items-center gap-2">
            <Sparkles className="size-5 text-brand-red" />
            Gerar Treino com IA
          </h1>
          <p className="text-sm text-content-secondary mt-0.5">
            Selecione um(a) aluno(a) e gere um programa personalizado
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="rounded-xl border border-line-subtle bg-bg-surface p-5 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-content-primary">
            Aluno(a)
          </label>
          <Select
            value={selectedAthleteId}
            onValueChange={(v) => setSelectedAthleteId(v ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um(a) aluno(a)" />
            </SelectTrigger>
            <SelectContent>
              {athletes.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-content-primary">
            Observacoes adicionais{" "}
            <span className="text-content-secondary font-normal">
              (opcional)
            </span>
          </label>
          <Textarea
            placeholder="Ex: Focar em glúteos e posteriores, evitar exercícios com impacto no joelho..."
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleGenerate}
            disabled={!selectedAthleteId || generating}
            className="bg-brand-red hover:bg-brand-red/90 text-white"
          >
            {generating ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="size-4 mr-2" />
                Gerar Treino
              </>
            )}
          </Button>
          {generating && (
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Erro</p>
            <p className="text-sm text-red-300/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Streaming preview */}
      {generating && rawText && !plan && (
        <div className="rounded-xl border border-line-subtle bg-bg-surface p-5">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="size-4 animate-spin text-brand-red" />
            <span className="text-sm font-medium text-content-primary">
              Gerando programa de treino...
            </span>
          </div>
          <pre className="text-xs text-content-secondary whitespace-pre-wrap max-h-60 overflow-y-auto font-mono">
            {rawText}
          </pre>
        </div>
      )}

      {/* Generated Plan */}
      {plan && (
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-content-primary flex items-center gap-2">
              <Dumbbell className="size-5 text-brand-red" />
              Programa Gerado — Split{" "}
              {plan.workout_split.join("/")}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="text-xs"
              >
                {copied ? (
                  <Check className="size-3.5 mr-1" />
                ) : (
                  <Copy className="size-3.5 mr-1" />
                )}
                {copied ? "Copiado!" : "Copiar JSON"}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || saved}
                className="bg-brand-red hover:bg-brand-red/90 text-white text-xs"
              >
                {saved ? (
                  <>
                    <Check className="size-3.5 mr-1" />
                    Salvo!
                  </>
                ) : saving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="size-3.5 mr-1" />
                    Salvar Rascunho
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Workout cards */}
          {plan.workout_split.map((letter) => {
            const workout = plan.workouts[letter];
            if (!workout) return null;
            return (
              <div
                key={letter}
                className="rounded-xl border border-line-subtle bg-bg-surface overflow-hidden"
              >
                <div className="border-b border-line-subtle px-5 py-3 bg-bg-subtle/50">
                  <h3 className="font-semibold text-content-primary">
                    Treino {letter}
                    {workout.focus && (
                      <span className="font-normal text-content-secondary ml-2">
                        — {workout.focus}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="divide-y divide-line-subtle">
                  {workout.exercises.map((ex, i) => (
                    <div key={i} className="px-5 py-3 flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-content-secondary w-5">
                          {i + 1}.
                        </span>
                        <span className="font-medium text-sm text-content-primary">
                          {ex.name}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            methodColors[ex.method] ??
                            "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {ex.method}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-content-secondary ml-7">
                        {ex.sets && (
                          <span>
                            {ex.sets} serie{ex.sets > 1 ? "s" : ""}
                          </span>
                        )}
                        {ex.reps && <span>{ex.reps} reps</span>}
                        {ex.interval && <span>Descanso: {ex.interval}</span>}
                      </div>
                      {ex.observations && (
                        <p className="text-xs text-content-secondary/70 ml-7 italic">
                          {ex.observations}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
