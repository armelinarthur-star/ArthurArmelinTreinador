"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  BookOpen,
  TrendingUp,
  MessageSquare,
  User,
} from "lucide-react";

const navItems = [
  { label: "Painel", href: "/coach", icon: LayoutDashboard },
  { label: "Alunos", href: "/coach/athletes", icon: Users },
  { label: "Treinos", href: "/coach/workouts", icon: Dumbbell },
  { label: "Exercícios", href: "/coach/exercises", icon: BookOpen },
  { label: "Progresso", href: "/coach/progress", icon: TrendingUp },
  { label: "Mensagens", href: "/coach/messages", icon: MessageSquare },
  { label: "Perfil", href: "/coach/profile", icon: User },
];

export default function CoachDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/coach") return pathname === "/coach";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-dvh bg-bg-base">
      {/* Sidebar — desktop */}
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-line-subtle bg-bg-surface md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center px-5">
          <Image
            src="/brand/LOGO04_BRANCO.png"
            alt="Arthur Armelin Treinador"
            width={140}
            height={35}
            className="h-auto w-auto max-w-[140px]"
          />
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 px-3 pt-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors duration-200 ${
                  active
                    ? "text-content-primary"
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-brand-red" />
                )}
                <Icon className="size-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-14 items-center border-b border-line-subtle bg-bg-surface px-4 md:hidden">
          <Image
            src="/brand/LOGO04_BRANCO.png"
            alt="Arthur Armelin Treinador"
            width={120}
            height={30}
            className="h-auto w-auto max-w-[120px]"
          />
        </header>

        {/* Page content */}
        <main className="flex flex-1 flex-col">{children}</main>

        {/* Bottom tabs — mobile */}
        <nav className="flex h-16 items-center justify-around border-t border-line-subtle bg-bg-surface md:hidden">
          {navItems.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-[10px] transition-colors ${
                  active
                    ? "text-brand-red"
                    : "text-content-secondary"
                }`}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
