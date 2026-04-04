"use client";

interface StepWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function StepWrapper({ title, subtitle, children }: StepWrapperProps) {
  return (
    <div className="flex flex-col">
      <h2 className="mb-1 text-xl font-bold text-content-primary">{title}</h2>
      {subtitle && (
        <p className="mb-6 text-sm text-content-secondary">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-6" />}
      <div className="space-y-3">{children}</div>
    </div>
  );
}
