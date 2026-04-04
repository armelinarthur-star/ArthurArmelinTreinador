import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-bg-base px-6">
      {/* Content */}
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <Image
          src="/brand/LOGO01_BRANCO.png"
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
            href="/coach/login"
            className="flex h-[52px] items-center justify-center rounded-input bg-brand-red px-8 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-brand-red-dark hover:scale-[0.98]"
          >
            Acessar como Treinador
          </Link>
          <Link
            href="/athlete/login"
            className="flex h-[52px] items-center justify-center rounded-input border border-white/20 px-8 text-[15px] font-semibold text-white transition-all duration-200 hover:border-white/40 hover:scale-[0.98]"
          >
            Acessar como Aluno
          </Link>
        </div>
      </div>

      {/* Decorative lines — bottom right */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 opacity-30">
        <div className="h-px w-16 bg-brand-red" />
        <div className="ml-4 h-px w-12 bg-brand-red" />
        <div className="ml-8 h-px w-8 bg-brand-red" />
      </div>
    </div>
  );
}
