"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

const actions = [
  { label: "Atualizar dados", href: "/athlete/profile/edit" },
  { label: "Refazer anamnese", href: "/athlete/onboarding" },
];

export function QuickActions() {
  return (
    <div className="nav-scroll flex gap-2 overflow-x-auto pb-1">
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="shrink-0 rounded-pill border border-line-default bg-bg-elevated px-4 py-2.5 text-[13px] font-medium text-content-primary transition-colors duration-150 hover:bg-bg-overlay"
        >
          {a.label}
        </Link>
      ))}
      <Link
        href="/athlete/messages"
        className="flex shrink-0 items-center gap-1.5 rounded-pill border border-line-default bg-bg-elevated px-4 py-2.5 text-[13px] font-medium text-content-primary transition-colors duration-150 hover:bg-bg-overlay"
      >
        <MessageCircle className="size-3.5" />
        Falar com o Treinador
      </Link>
    </div>
  );
}
