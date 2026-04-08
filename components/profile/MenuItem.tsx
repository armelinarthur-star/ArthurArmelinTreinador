"use client";

import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onPress?: () => void;
  value?: string;
  badge?: string;
  disabled?: boolean;
  destructive?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  isLast?: boolean;
}

export function MenuItem({
  icon: Icon,
  label,
  href,
  onPress,
  value,
  badge,
  disabled,
  destructive,
  toggle,
  toggleValue,
  onToggle,
  isLast,
}: MenuItemProps) {
  const content = (
    <>
      <Icon
        className={`size-[18px] shrink-0 ${
          destructive ? "text-brand-red" : "text-content-secondary"
        }`}
      />
      <span
        className={`flex-1 text-sm ${
          disabled
            ? "text-content-tertiary"
            : destructive
            ? "text-brand-red"
            : "text-content-primary"
        }`}
      >
        {label}
      </span>

      {badge && (
        <span className="rounded-pill bg-bg-elevated px-2 py-0.5 text-[10px] font-medium text-content-secondary">
          {badge}
        </span>
      )}

      {value && !toggle && (
        <span className="text-[13px] text-content-secondary">{value}</span>
      )}

      {toggle && (
        <button
          type="button"
          role="switch"
          aria-checked={toggleValue}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle?.(!toggleValue);
          }}
          className="relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-200"
          style={{
            backgroundColor: toggleValue
              ? "#FF0025"
              : "var(--aa-line-default)",
          }}
        >
          <span
            className="absolute top-[3px] block size-5 rounded-full bg-white shadow-sm transition-transform duration-200"
            style={{
              transform: toggleValue ? "translateX(21px)" : "translateX(3px)",
            }}
          />
        </button>
      )}

      {!toggle && !disabled && (href || onPress) && (
        <ChevronRight className="size-4 shrink-0 text-content-tertiary" />
      )}
    </>
  );

  const className = `flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 ${
    !disabled ? "active:bg-bg-elevated" : ""
  } ${!isLast ? "border-b border-line-subtle" : ""}`;

  if (disabled) {
    return (
      <div className={className} style={{ opacity: 0.5 }}>
        {content}
      </div>
    );
  }

  if (href) {
    if (href.startsWith("mailto:")) {
      return (
        <a href={href} className={className}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  if (onPress || toggle) {
    return (
      <button type="button" onClick={onPress} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
