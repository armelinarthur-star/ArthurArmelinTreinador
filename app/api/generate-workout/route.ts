import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "coach")
    return Response.json({ error: "Apenas treinadores" }, { status: 403 });

  const body = await request.json();
  const { athleteId, athleteName, extraNotes } = body as {
    athleteId: string;
    athleteName: string;
    extraNotes?: string;
  };

  // Fetch athlete anamnesis
  const { data: anamnesis } = await supabase
    .from("athlete_anamnesis")
    .select("*")
    .eq("athlete_id", athleteId)
    .single();

  // Fetch prescription examples (few-shot context)
  const { data: examples } = await supabase
    .from("prescription_examples")
    .select("student_key, student_profile, workouts, workout_split")
    .limit(5);

  // Build the athlete profile summary
  const athleteProfile = anamnesis
    ? {
        name: athleteName,
        birth_date: anamnesis.birth_date,
        sex: anamnesis.sex,
        height_cm: anamnesis.height_cm,
        weight_kg: anamnesis.weight_kg,
        body_fat_pct: anamnesis.body_fat_pct,
        primary_goal: anamnesis.primary_goal,
        experience_level: anamnesis.experience_level,
        days_per_week: anamnesis.days_per_week,
        health_conditions: anamnesis.health_conditions,
        movement_restrictions: anamnesis.movement_restrictions,
        activity_level: anamnesis.activity_level,
        sleep_quality: anamnesis.sleep_quality,
      }
    : { name: athleteName, note: "Sem anamnese preenchida" };

  // Build few-shot examples string
  const examplesStr = (examples ?? [])
    .slice(0, 3)
    .map(
      (ex) =>
        `=== Exemplo: ${ex.student_profile?.name ?? ex.student_key} ===\nPerfil: ${JSON.stringify(ex.student_profile)}\nSplit: ${JSON.stringify(ex.workout_split)}\nTreinos: ${JSON.stringify(ex.workouts)}`
    )
    .join("\n\n");

  const systemPrompt = `Você é o Arthur Armelin, treinador pessoal de musculação com anos de experiência prescrevendo treinos individualizados. Você cria treinos de musculação personalizados para cada aluno(a) com base no perfil, histórico e objetivos.

REGRAS IMPORTANTES:
1. Sempre prescreva em PORTUGUÊS (Brasil)
2. Use a nomenclatura técnica correta dos exercícios
3. Indique método (Tradicional, BiSet, DropSet, Pré-Exaustão, etc.)
4. Indique séries, repetições, intervalo de descanso
5. Adicione observações quando relevante (dica de execução, carga sugerida, etc.)
6. Respeite COMPLETAMENTE as limitações/lesões do aluno
7. A divisão de treino (split) deve combinar com a frequência semanal do aluno
8. Cada treino deve ter 5-8 exercícios
9. Sempre considere o nível de experiência ao escolher exercícios

FORMATO DE SAÍDA (JSON estrito):
{
  "workout_split": ["A", "B", "C"],
  "workouts": {
    "A": {
      "focus": "Descrição do foco (ex: Quadríceps e Glúteos)",
      "exercises": [
        {
          "name": "Nome do Exercício",
          "method": "Tradicional",
          "sets": 3,
          "reps": "8-12",
          "interval": "1'30\"",
          "observations": "Dica de execução se necessário"
        }
      ]
    }
  }
}

Responda SOMENTE com o JSON, sem texto adicional antes ou depois.`;

  const userPrompt = `Crie um programa de treino personalizado para este(a) aluno(a):

PERFIL DO ALUNO(A):
${JSON.stringify(athleteProfile, null, 2)}

${extraNotes ? `OBSERVAÇÕES DO TREINADOR:\n${extraNotes}\n` : ""}
EXEMPLOS DE TREINOS QUE VOCÊ JÁ PRESCREVEU (use como referência de estilo e qualidade):

${examplesStr}

Agora, com base no perfil acima, gere o programa de treino personalizado em JSON.`;

  // Stream response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
          stream: true,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao gerar treino";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: message })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
