"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  variant?: "icon" | "switch";
}

export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    if (variant === "switch") {
      return <div className="h-[26px] w-[44px] rounded-full bg-bg-elevated" />;
    }
    return <div className="size-9 rounded-full bg-bg-elevated" />;
  }

  const isDark = theme === "dark";

  if (variant === "switch") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-200"
        style={{
          backgroundColor: isDark ? "#FF0025" : "rgba(0,0,0,0.12)",
        }}
      >
        <span
          className="absolute top-[3px] flex size-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{
            transform: isDark ? "translateX(21px)" : "translateX(3px)",
          }}
        >
          {isDark ? (
            <Moon className="size-3 text-[#1C1C1E]" />
          ) : (
            <Sun className="size-3 text-[#F59E0B]" />
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex size-9 items-center justify-center rounded-full border border-line-subtle bg-bg-surface transition-colors duration-200 hover:bg-bg-elevated"
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {isDark ? (
        <Sun className="size-4 text-content-secondary" />
      ) : (
        <Moon className="size-4 text-content-secondary" />
      )}
    </button>
  );
}
