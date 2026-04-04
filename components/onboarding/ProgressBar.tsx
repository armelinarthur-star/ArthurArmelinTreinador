"use client";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
              i < currentStep ? "bg-brand-red" : "bg-bg-elevated"
            }`}
          />
        ))}
      </div>
      <p className="text-[12px] text-content-secondary">
        Etapa {currentStep} de {totalSteps}
      </p>
    </div>
  );
}
