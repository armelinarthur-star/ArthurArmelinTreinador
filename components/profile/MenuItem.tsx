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
  const iconColor = destructive ? "#FF0025" : "#888888";
  const labelColor = destructive ? "#FF0025" : "#FFFFFF";

  const content = (
    <>
      <Icon className="size-[18px] shrink-0" style={{ color: iconColor }} />
      <span
        className="flex-1 text-sm"
        style={{ color: disabled ? "#555" : labelColor }}
      >
        {label}
      </span>

      {/* Badge "Em breve" */}
      {badge && (
        <span className="rounded-[9999px] bg-[rgba(136,136,136,0.12)] px-2 py-0.5 text-[10px] font-medium text-[#888888]">
          {badge}
        </span>
      )}

      {/* Value text (kg/lb, streak value, etc.) */}
      {value && !toggle && (
        <span className="text-[13px] text-[#888888]">{value}</span>
      )}

      {/* Toggle switch */}
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
              : "rgba(255,255,255,0.12)",
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

      {/* Chevron for links */}
      {!toggle && !disabled && (href || onPress) && (
        <ChevronRight className="size-4 shrink-0 text-[#444]" />
      )}
    </>
  );

  const className = `flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 ${
    !disabled ? "active:bg-[rgba(255,255,255,0.04)]" : ""
  } ${!isLast ? "border-b border-[rgba(255,255,255,0.06)]" : ""}`;

  if (disabled) {
    return (
      <div className={className} style={{ opacity: 0.5 }}>
        {content}
      </div>
    );
  }

  if (href) {
    // External links (mailto)
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
