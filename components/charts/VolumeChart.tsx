"use client";

import type { MuscleGroup } from "@/lib/types/database";

const muscleGroupLabels: Record<string, string> = {
  chest: "Peito",
  back: "Costas",
  shoulders: "Ombros",
  biceps: "Biceps",
  triceps: "Triceps",
  legs: "Pernas",
  glutes: "Gluteos",
  quadriceps: "Quadriceps",
  hamstrings: "Posteriores",
  calves: "Panturrilha",
  abs: "Abdomen",
  full_body: "Full Body",
};

interface VolumeData {
  muscle_group: string;
  sets: number;
}

interface VolumeChartProps {
  data: VolumeData[];
  title?: string;
}

export function VolumeChart({
  data,
  title = "Volume Semanal por Grupo Muscular",
}: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#0D0D0D] p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-[#888888]">
          Nenhum dado de volume disponivel. Atribua treinos com exercicios
          configurados para visualizar.
        </p>
      </div>
    );
  }

  const maxSets = Math.max(...data.map((d) => d.sets));

  return (
    <div className="rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#0D0D0D] p-5">
      <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
      <p className="mb-4 text-[11px] text-[#888888]">
        Series ponderadas por grupo muscular
      </p>

      <div className="space-y-3">
        {data.map((item) => {
          const pct = maxSets > 0 ? (item.sets / maxSets) * 100 : 0;
          const label =
            muscleGroupLabels[item.muscle_group] ?? item.muscle_group;

          return (
            <div key={item.muscle_group}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-[#CCCCCC]">
                  {label}
                </span>
                <span className="font-accent text-xs font-bold text-white">
                  {item.sets % 1 === 0 ? item.sets : item.sets.toFixed(1)}{" "}
                  <span className="font-normal text-[#888888]">series</span>
                </span>
              </div>
              <div className="h-[6px] overflow-hidden rounded-full bg-[#1A1A1A]">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor:
                      pct >= 80
                        ? "#FF0025"
                        : pct >= 50
                        ? "#FF0025CC"
                        : "#FF002580",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-4 flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-3">
        <span className="text-xs text-[#888888]">Total</span>
        <span className="font-accent text-sm font-bold text-white">
          {Math.round(data.reduce((sum, d) => sum + d.sets, 0) * 10) / 10}{" "}
          series
        </span>
      </div>
    </div>
  );
}
