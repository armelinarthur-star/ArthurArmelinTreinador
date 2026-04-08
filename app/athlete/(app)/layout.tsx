"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, ClipboardCheck, Trophy, TrendingUp, User } from "lucide-react";

const tabs = [
  { label: "Inicio", href: "/athlete", icon: Home },
  { label: "Treino", href: "/athlete/workout", icon: Dumbbell },
  { label: "Check-in", href: "/athlete/checkin", icon: ClipboardCheck },
  { label: "Conquistas", href: "/athlete/achievements", icon: Trophy },
  { label: "Progresso", href: "/athlete/progress", icon: TrendingUp },
  { label: "Perfil", href: "/athlete/profile", icon: User },
];

export default function AthleteAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/athlete") return pathname === "/athlete";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg-base">
      {/* Page content */}
      <main className="flex flex-1 flex-col pb-16">{children}</main>

      {/* Bottom tabs — scrollable on mobile */}
      <nav className="nav-scroll fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch gap-0 overflow-x-auto border-t border-line-subtle bg-bg-surface/95 backdrop-blur-sm">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-w-[64px] flex-1 flex-col items-center justify-center gap-1 px-2 text-[10px] transition-colors duration-200 ${
                active ? "text-brand-red" : "text-content-secondary"
              }`}
            >
              <Icon className="size-5" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
