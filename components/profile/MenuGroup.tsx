"use client";

interface MenuGroupProps {
  title: string;
  children: React.ReactNode;
}

export function MenuGroup({ title, children }: MenuGroupProps) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
        {title}
      </p>
      <div className="overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#0D0D0D]">
        {children}
      </div>
    </div>
  );
}
