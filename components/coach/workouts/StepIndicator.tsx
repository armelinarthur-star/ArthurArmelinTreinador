"use client";

import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      {steps.map((step, i) => {
        const completed = i < currentStep;
        const active = i === currentStep;

        return (
          <div key={i} className="flex items-center gap-3">
            {i > 0 && (
              <div
                className={`h-[2px] w-8 rounded-full transition-colors ${
                  completed ? "bg-brand-red" : "bg-line-subtle"
                }`}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  completed
                    ? "bg-brand-red text-white"
                    : active
                    ? "border-2 border-brand-red text-brand-red"
                    : "border border-line-default text-content-tertiary"
                }`}
              >
                {completed ? <Check className="size-3.5" /> : i + 1}
              </div>
              <span
                className={`text-sm font-medium ${
                  active ? "text-content-primary" : "text-content-secondary"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
