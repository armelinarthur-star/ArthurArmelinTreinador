"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

const actions = [
  { label: "Atualizar dados", href: "/athlete/profile/edit" },
  { label: "Refazer anamnese", href: "/athlete/onboarding" },
];

export function QuickActions() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="shrink-0 rounded-[9999px] border border-[rgba(255,255,255,0.12)] bg-[#1A1A1A] px-4 py-2.5 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-[#242424]"
        >
          {a.label}
        </Link>
      ))}
      <Link
        href="/athlete/messages"
        className="flex shrink-0 items-center gap-1.5 rounded-[9999px] border border-[rgba(255,255,255,0.12)] bg-[#1A1A1A] px-4 py-2.5 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-[#242424]"
      >
        <MessageCircle className="size-3.5" />
        Falar com o Treinador
      </Link>
    </div>
  );
}
