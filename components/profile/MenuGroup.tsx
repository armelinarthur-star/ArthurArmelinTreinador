"use client";

interface MenuGroupProps {
  title: string;
  children: React.ReactNode;
}

export function MenuGroup({ title, children }: MenuGroupProps) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-content-secondary">
        {title}
      </p>
      <div className="overflow-hidden rounded-card border border-line-subtle bg-bg-surface">
        {children}
      </div>
    </div>
  );
}
