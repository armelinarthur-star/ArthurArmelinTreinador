"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const logoSrc =
    mounted && theme === "light"
      ? "/brand/LOGO01_PRETO.png"
      : "/brand/LOGO01_BRANCO.png";

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-bg-base px-6">
      {/* Theme toggle */}
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <Image
          src={logoSrc}
          alt="Arthur Armelin Treinador"
          width={320}
          height={160}
          priority
          className="h-auto w-auto max-w-[320px]"
        />

        {/* Brand bar */}
        <div className="h-[2px] w-[60px] rounded-full bg-brand-red" />

        {/* Tagline */}
        <p className="text-[13px] uppercase tracking-[0.12em] text-content-secondary">
          Inspirando Capacidades
        </p>

        {/* Buttons */}
        <div className="mt-4 flex w-full max-w-[320px] flex-col gap-3">
          <Link
            href="/athlete/onboarding"
            className="flex h-[52px] items-center justify-center rounded-input bg-brand-red px-8 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-brand-red-dark hover:scale-[0.98]"
          >
            Acessar como Aluno(a)
          </Link>
          <Link
            href="/coach/login"
            className="flex h-[52px] items-center justify-center rounded-input border border-line-strong px-8 text-[15px] font-semibold text-content-primary transition-all duration-200 hover:bg-bg-elevated hover:scale-[0.98]"
          >
            Acessar como Treinador
          </Link>
        </div>
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 opacity-30">
        <div className="h-px w-16 bg-brand-red" />
        <div className="ml-4 h-px w-12 bg-brand-red" />
        <div className="ml-8 h-px w-8 bg-brand-red" />
      </div>
    </div>
  );
}
