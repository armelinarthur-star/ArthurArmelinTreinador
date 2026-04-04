"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { StepWrapper } from "@/components/onboarding/StepWrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  Flame,
  Heart,
  Zap,
  Shield,
  Smile,
} from "lucide-react";

const TOTAL_STEPS = 10;

// --- Types ---
interface FormData {
  // Step 1
  full_name: string;
  birth_date: string;
  sex: string;
  // Step 2
  email: string;
  password: string;
  confirm_password: string;
  // Step 3
  height_cm: string;
  weight_kg: string;
  body_fat_pct: string;
  // Step 4
  goals: string[];
  // Step 5
  experience: string;
  // Step 6
  days_per_week: number;
  // Step 7
  health_conditions: string[];
  other_condition: string;
  // Step 8
  has_restrictions: string;
  movement_restrictions: string;
  // Step 9
  activity_level: string;
  sleep_quality: string;
}

const initialData: FormData = {
  full_name: "",
  birth_date: "",
  sex: "",
  email: "",
  password: "",
  confirm_password: "",
  height_cm: "",
  weight_kg: "",
  body_fat_pct: "",
  goals: [],
  experience: "",
  days_per_week: 0,
  health_conditions: [],
  other_condition: "",
  has_restrictions: "",
  movement_restrictions: "",
  activity_level: "",
  sleep_quality: "",
};

const goalOptions = [
  { label: "Ganhar massa muscular", icon: <Dumbbell className="size-5" /> },
  { label: "Emagrecer e perder gordura", icon: <Flame className="size-5" /> },
  { label: "Melhorar condicionamento físico", icon: <Zap className="size-5" /> },
  { label: "Ganhar força e performance", icon: <Shield className="size-5" /> },
  { label: "Saúde e qualidade de vida", icon: <Heart className="size-5" /> },
  { label: "Reabilitação e bem-estar", icon: <Smile className="size-5" /> },
];

const experienceOptions = [
  { label: "Nunca treinei", description: "Completo iniciante" },
  { label: "Menos de 1 ano", description: "Treinei por menos de 1 ano" },
  { label: "1 a 3 anos", description: "Treino de 1 a 3 anos" },
  { label: "Mais de 3 anos", description: "Treino há mais de 3 anos" },
];

const healthOptions = [
  "Hipertensão",
  "Diabetes",
  "Problema na coluna ou hérnia",
  "Lesão em articulação (joelho, ombro, quadril)",
  "Problema cardíaco",
];

const activityOptions = [
  { label: "Muito sedentário", description: "Fico sentado quase o dia todo" },
  { label: "Pouco ativo", description: "Caminho um pouco no dia a dia" },
  { label: "Moderadamente ativo", description: "Trabalho em pé ou me movimento bastante" },
  { label: "Muito ativo", description: "Trabalho físico intenso" },
];

const sleepOptions = [
  { label: "Durmo mal", description: "Menos de 6h ou sono ruim" },
  { label: "Durmo razoável", description: "6-7h, acordo cansado às vezes" },
  { label: "Durmo bem", description: "7-8h com qualidade" },
  { label: "Durmo muito bem", description: "8h+ e acordo disposto" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation
  const [animClass, setAnimClass] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const animateTransition = useCallback(
    (direction: "next" | "prev", callback: () => void) => {
      const exitClass =
        direction === "next"
          ? "-translate-x-full opacity-0"
          : "translate-x-full opacity-0";
      setAnimClass(exitClass);
      setTimeout(() => {
        callback();
        const enterFrom =
          direction === "next"
            ? "translate-x-full opacity-0"
            : "-translate-x-full opacity-0";
        setAnimClass(enterFrom);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimClass("translate-x-0 opacity-100");
          });
        });
      }, 200);
    },
    []
  );

  function goNext() {
    if (step >= TOTAL_STEPS) return;
    animateTransition("next", () => setStep((s) => s + 1));
  }

  function goBack() {
    if (step <= 1) return;
    animateTransition("prev", () => setStep((s) => s - 1));
  }

  function goToStep(target: number) {
    animateTransition(target > step ? "next" : "prev", () => setStep(target));
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function toggleGoal(goal: string) {
    setData((d) => {
      const current = d.goals;
      if (current.includes(goal)) {
        return { ...d, goals: current.filter((g) => g !== goal) };
      }
      if (current.length >= 2) return d;
      return { ...d, goals: [...current, goal] };
    });
  }

  function toggleHealth(condition: string) {
    if (condition === "__none__") {
      setData((d) => ({
        ...d,
        health_conditions: ["Nenhuma das anteriores"],
        other_condition: "",
      }));
      return;
    }
    setData((d) => {
      const current = d.health_conditions.filter(
        (c) => c !== "Nenhuma das anteriores"
      );
      if (current.includes(condition)) {
        return {
          ...d,
          health_conditions: current.filter((c) => c !== condition),
        };
      }
      return { ...d, health_conditions: [...current, condition] };
    });
  }

  // Validation per step
  function canContinue(): boolean {
    switch (step) {
      case 1:
        return !!data.full_name.trim() && !!data.birth_date && !!data.sex;
      case 2:
        return (
          !!data.email.trim() &&
          data.password.length >= 6 &&
          data.password === data.confirm_password
        );
      case 3:
        return !!data.height_cm && !!data.weight_kg;
      case 4:
        return data.goals.length > 0;
      case 5:
        return !!data.experience;
      case 6:
        return data.days_per_week > 0;
      case 7:
        return data.health_conditions.length > 0;
      case 8:
        return (
          data.has_restrictions === "no" ||
          (data.has_restrictions === "yes" &&
            !!data.movement_restrictions.trim())
        );
      case 9:
        return !!data.activity_level && !!data.sleep_quality;
      case 10:
        return true;
      default:
        return false;
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError("");

    const { data: authData, error: signUpError } =
      await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: "athlete",
          },
        },
      });

    if (signUpError) {
      const msg = signUpError.message.includes("already registered")
        ? "Este e-mail já está cadastrado."
        : signUpError.message.includes("least 6")
        ? "A senha deve ter pelo menos 6 caracteres."
        : signUpError.message;
      setError(msg);
      setIsSubmitting(false);
      goToStep(2);
      return;
    }

    if (authData.user) {
      // Save anamnesis
      const conditions = data.health_conditions.filter(
        (c) => c !== "Nenhuma das anteriores"
      );
      if (data.other_condition.trim()) {
        conditions.push(data.other_condition.trim());
      }

      await supabase.from("athlete_anamnesis").insert({
        athlete_id: authData.user.id,
        birth_date: data.birth_date || null,
        sex: data.sex || null,
        height_cm: data.height_cm ? parseFloat(data.height_cm) : null,
        weight_kg: data.weight_kg ? parseFloat(data.weight_kg) : null,
        body_fat_pct: data.body_fat_pct
          ? parseFloat(data.body_fat_pct)
          : null,
        primary_goal: data.goals.join(", ") || null,
        experience_level: data.experience || null,
        days_per_week: data.days_per_week || null,
        health_conditions: conditions.length > 0 ? conditions : null,
        movement_restrictions:
          data.has_restrictions === "yes"
            ? data.movement_restrictions
            : null,
        activity_level: data.activity_level || null,
        sleep_quality: data.sleep_quality || null,
      });

      router.push("/athlete");
    }

    setIsSubmitting(false);
  }

  // Calculate age
  function getAge(): number | null {
    if (!data.birth_date) return null;
    const born = new Date(data.birth_date + "T00:00:00");
    const now = new Date();
    let age = now.getFullYear() - born.getFullYear();
    const m = now.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age--;
    return age;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg-base">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-base px-5 pt-4 pb-3">
        <div className="mb-3 flex items-center gap-4">
          <Image
            src="/brand/LOGO04_BRANCO.png"
            alt="Arthur Armelin"
            width={100}
            height={28}
            className="h-auto w-auto max-h-[28px]"
          />
          <div className="flex-1">
            <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col px-5 pb-40" ref={containerRef}>
        <div
          className={`flex-1 transition-all duration-300 ease-out ${
            animClass || "translate-x-0 opacity-100"
          }`}
        >
          {/* STEP 1 — Identificação */}
          {step === 1 && (
            <StepWrapper title="Vamos começar pelo básico">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-content-secondary">
                    Nome completo
                  </label>
                  <Input
                    placeholder="Seu nome completo"
                    value={data.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-content-secondary">
                    Data de nascimento
                  </label>
                  <Input
                    type="date"
                    value={data.birth_date}
                    onChange={(e) => updateField("birth_date", e.target.value)}
                    className="border-line-default bg-bg-elevated text-content-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-content-secondary">Sexo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <OptionCard
                      label="Masculino"
                      selected={data.sex === "masculino"}
                      onClick={() => updateField("sex", "masculino")}
                    />
                    <OptionCard
                      label="Feminino"
                      selected={data.sex === "feminino"}
                      onClick={() => updateField("sex", "feminino")}
                    />
                  </div>
                </div>
              </div>
            </StepWrapper>
          )}

          {/* STEP 2 — Contato e acesso */}
          {step === 2 && (
            <StepWrapper title="Como o Arthur vai te encontrar?">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-content-secondary">E-mail</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={data.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-content-secondary">Senha</label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={data.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-content-secondary">
                    Confirmar senha
                  </label>
                  <Input
                    type="password"
                    placeholder="Repita a senha"
                    value={data.confirm_password}
                    onChange={(e) =>
                      updateField("confirm_password", e.target.value)
                    }
                    className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                  />
                  {data.confirm_password &&
                    data.password !== data.confirm_password && (
                      <p className="text-xs text-state-error">
                        As senhas não coincidem
                      </p>
                    )}
                </div>
                {error && <p className="text-sm text-state-error">{error}</p>}
                <p className="text-[11px] text-content-tertiary">
                  Você usará este e-mail e senha para acessar a plataforma
                </p>
              </div>
            </StepWrapper>
          )}

          {/* STEP 3 — Medidas */}
          {step === 3 && (
            <StepWrapper
              title="Suas medidas hoje"
              subtitle="Usaremos para acompanhar sua evolução"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-content-secondary">Altura</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="170"
                      value={data.height_cm}
                      onChange={(e) => updateField("height_cm", e.target.value)}
                      className="border-line-default bg-bg-elevated pr-10 text-content-primary placeholder:text-content-tertiary"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-content-tertiary">
                      cm
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-content-secondary">
                    Peso atual
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="75.0"
                      value={data.weight_kg}
                      onChange={(e) => updateField("weight_kg", e.target.value)}
                      className="border-line-default bg-bg-elevated pr-10 text-content-primary placeholder:text-content-tertiary"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-content-tertiary">
                      kg
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-content-secondary">
                    Percentual de gordura{" "}
                    <span className="text-content-tertiary">(opcional)</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Se souber"
                      value={data.body_fat_pct}
                      onChange={(e) =>
                        updateField("body_fat_pct", e.target.value)
                      }
                      className="border-line-default bg-bg-elevated pr-10 text-content-primary placeholder:text-content-tertiary"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-content-tertiary">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </StepWrapper>
          )}

          {/* STEP 4 — Objetivo */}
          {step === 4 && (
            <StepWrapper
              title="O que você quer conquistar?"
              subtitle="Escolha até 2 focos principais"
            >
              {goalOptions.map((g) => (
                <OptionCard
                  key={g.label}
                  label={g.label}
                  icon={g.icon}
                  selected={data.goals.includes(g.label)}
                  onClick={() => toggleGoal(g.label)}
                />
              ))}
            </StepWrapper>
          )}

          {/* STEP 5 — Experiência */}
          {step === 5 && (
            <StepWrapper title="Qual é a sua experiência com musculação?">
              {experienceOptions.map((o) => (
                <OptionCard
                  key={o.label}
                  label={o.label}
                  description={o.description}
                  selected={data.experience === o.label}
                  onClick={() => updateField("experience", o.label)}
                />
              ))}
            </StepWrapper>
          )}

          {/* STEP 6 — Disponibilidade */}
          {step === 6 && (
            <StepWrapper
              title="Quantos dias por semana você pode treinar?"
              subtitle="Seja realista — isso define seu programa"
            >
              <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    onClick={() => updateField("days_per_week", d)}
                    className={`flex flex-col items-center gap-1 rounded-card border p-4 transition-all duration-200 ${
                      data.days_per_week === d
                        ? "border-brand-red bg-brand-red/10"
                        : "border-line-subtle bg-bg-surface hover:border-line-default"
                    }`}
                  >
                    <span
                      className={`text-2xl font-bold ${
                        data.days_per_week === d
                          ? "text-brand-red"
                          : "text-content-primary"
                      }`}
                    >
                      {d}
                    </span>
                    <span className="text-[10px] text-content-secondary">
                      dias
                    </span>
                  </button>
                ))}
              </div>
            </StepWrapper>
          )}

          {/* STEP 7 — Saúde */}
          {step === 7 && (
            <StepWrapper
              title="Você possui alguma dessas condições?"
              subtitle="Selecione todas que se aplicam"
            >
              {healthOptions.map((c) => (
                <OptionCard
                  key={c}
                  label={c}
                  selected={data.health_conditions.includes(c)}
                  onClick={() => toggleHealth(c)}
                />
              ))}
              <OptionCard
                label="Nenhuma das anteriores"
                selected={data.health_conditions.includes(
                  "Nenhuma das anteriores"
                )}
                onClick={() => toggleHealth("__none__")}
              />
              {!data.health_conditions.includes("Nenhuma das anteriores") && (
                <div className="space-y-2 pt-2">
                  <label className="text-sm text-content-secondary">
                    Outra condição (opcional)
                  </label>
                  <Input
                    placeholder="Descreva aqui"
                    value={data.other_condition}
                    onChange={(e) =>
                      updateField("other_condition", e.target.value)
                    }
                    className="border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                  />
                </div>
              )}
            </StepWrapper>
          )}

          {/* STEP 8 — Restrições */}
          {step === 8 && (
            <StepWrapper
              title="Tem algum exercício ou movimento que deve evitar?"
              subtitle="Isso ajuda a personalizar seu treino com segurança"
            >
              <OptionCard
                label="Não tenho restrições"
                selected={data.has_restrictions === "no"}
                onClick={() =>
                  updateField("has_restrictions", "no")
                }
              />
              <OptionCard
                label="Tenho restrições"
                selected={data.has_restrictions === "yes"}
                onClick={() =>
                  updateField("has_restrictions", "yes")
                }
              />
              {data.has_restrictions === "yes" && (
                <div className="space-y-2 pt-2">
                  <Textarea
                    placeholder="Descreva brevemente quais movimentos evitar"
                    value={data.movement_restrictions}
                    onChange={(e) =>
                      updateField("movement_restrictions", e.target.value)
                    }
                    className="min-h-[80px] border-line-default bg-bg-elevated text-content-primary placeholder:text-content-tertiary"
                  />
                </div>
              )}
            </StepWrapper>
          )}

          {/* STEP 9 — Rotina */}
          {step === 9 && (
            <StepWrapper
              title="Como é sua rotina hoje?"
              subtitle="Queremos entender seu estilo de vida"
            >
              <p className="text-xs font-medium text-content-secondary mb-2">
                Nível de atividade fora da academia
              </p>
              {activityOptions.map((o) => (
                <OptionCard
                  key={o.label}
                  label={o.label}
                  description={o.description}
                  selected={data.activity_level === o.label}
                  onClick={() => updateField("activity_level", o.label)}
                />
              ))}
              <div className="my-3 h-px bg-line-subtle" />
              <p className="text-xs font-medium text-content-secondary mb-2">
                Qualidade do sono
              </p>
              {sleepOptions.map((o) => (
                <OptionCard
                  key={o.label}
                  label={o.label}
                  description={o.description}
                  selected={data.sleep_quality === o.label}
                  onClick={() => updateField("sleep_quality", o.label)}
                />
              ))}
            </StepWrapper>
          )}

          {/* STEP 10 — Revisão */}
          {step === 10 && (
            <StepWrapper
              title={`Tudo certo, ${data.full_name.split(" ")[0]}!`}
              subtitle="Revise suas informações antes de criar sua conta"
            >
              <div className="space-y-3">
                <div className="rounded-card border border-line-subtle bg-bg-surface p-4">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-content-tertiary">
                    Dados Pessoais
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="text-content-primary">{data.full_name}</p>
                    <p className="text-content-secondary">
                      {data.sex === "masculino" ? "Masculino" : "Feminino"}
                      {getAge() !== null && ` · ${getAge()} anos`}
                    </p>
                    <p className="text-content-secondary">
                      {data.height_cm}cm · {data.weight_kg}kg
                    </p>
                  </div>
                </div>

                <div className="rounded-card border border-line-subtle bg-bg-surface p-4">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-content-tertiary">
                    Objetivo
                  </p>
                  <p className="text-sm text-content-primary">
                    {data.goals.join(", ")}
                  </p>
                </div>

                <div className="rounded-card border border-line-subtle bg-bg-surface p-4">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-content-tertiary">
                    Treino
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="text-content-primary">
                      {data.days_per_week} dias por semana
                    </p>
                    <p className="text-content-secondary">
                      Experiência: {data.experience}
                    </p>
                  </div>
                </div>

                {!data.health_conditions.includes("Nenhuma das anteriores") &&
                  data.health_conditions.length > 0 && (
                    <div className="rounded-card border border-line-subtle bg-bg-surface p-4">
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-content-tertiary">
                        Saúde
                      </p>
                      <p className="text-sm text-content-primary">
                        {data.health_conditions.join(", ")}
                        {data.other_condition && `, ${data.other_condition}`}
                      </p>
                    </div>
                  )}

                {error && (
                  <p className="text-sm text-state-error">{error}</p>
                )}
              </div>
            </StepWrapper>
          )}
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-bg-base/95 px-5 pb-6 pt-3 backdrop-blur-sm">
        {step > 1 && (
          <button
            onClick={goBack}
            className="mb-2 w-full py-2 text-center text-sm text-content-secondary hover:text-content-primary transition-colors"
          >
            Voltar
          </button>
        )}
        <Button
          onClick={step === TOTAL_STEPS ? handleSubmit : goNext}
          disabled={!canContinue() || isSubmitting}
          className="h-[52px] w-full rounded-input bg-brand-red text-[15px] font-semibold text-white hover:bg-brand-red-dark disabled:opacity-40 transition-all duration-200"
        >
          {step === TOTAL_STEPS
            ? isSubmitting
              ? "Criando conta..."
              : "Criar minha conta"
            : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
