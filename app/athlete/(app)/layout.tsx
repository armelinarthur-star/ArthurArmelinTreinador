"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, ClipboardCheck, Trophy, User } from "lucide-react";

const tabs = [
  { label: "Início", href: "/athlete", icon: Home },
  { label: "Treino", href: "/athlete/workout", icon: Dumbbell },
  { label: "Check-in", href: "/athlete/checkin", icon: ClipboardCheck },
  { label: "Conquistas", href: "/athlete/achievements", icon: Trophy },
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

      {/* Bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-line-subtle bg-bg-surface/95 backdrop-blur-sm">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 text-[10px] transition-colors duration-200 ${
                active
                  ? "text-brand-red"
                  : "text-content-secondary"
              }`}
            >
              <Icon className="size-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
