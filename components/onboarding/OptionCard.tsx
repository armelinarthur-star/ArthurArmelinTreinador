"use client";

interface OptionCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  description?: string;
}

export function OptionCard({
  label,
  selected,
  onClick,
  icon,
  description,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-card border p-4 text-left transition-all duration-200 ${
        selected
          ? "border-brand-red bg-brand-red/10"
          : "border-line-subtle bg-bg-surface hover:border-line-default"
      }`}
    >
      {icon && (
        <span
          className={`text-lg transition-colors ${
            selected ? "text-brand-red" : "text-content-secondary"
          }`}
        >
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium transition-colors ${
            selected ? "text-content-primary" : "text-content-primary"
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-[11px] text-content-secondary">
            {description}
          </p>
        )}
      </div>
      <div
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
          selected
            ? "border-brand-red bg-brand-red"
            : "border-line-default"
        }`}
      >
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </button>
  );
}
