"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AuthCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const logoSrc = mounted && theme === "light"
    ? "/brand/LOGO04_PRETO.png"
    : "/brand/LOGO04_BRANCO.png";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-base px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Theme toggle — top right */}
        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <Image
            src={logoSrc}
            alt="Arthur Armelin Treinador"
            width={200}
            height={50}
            className="h-auto w-auto max-w-[200px]"
            priority
          />
          <div className="h-[2px] w-10 bg-brand-red" />
        </div>

        {/* Card */}
        <div className="rounded-card border border-line-subtle bg-bg-surface p-6">
          {(title || subtitle) && (
            <div className="mb-6 text-center">
              {title && (
                <h1 className="text-lg font-semibold text-content-primary">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-content-secondary">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
