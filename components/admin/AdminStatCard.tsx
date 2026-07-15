import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  footerLink,
  badge,
  iconClassName,
  className,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive: boolean };
  footerLink?: string;
  badge?: { label: string; variant: "enabled" | "disabled" };
  iconClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-[#e8ebef] bg-white p-3.5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500">{title}</p>
          <p className="mt-1 truncate text-lg font-bold text-[#1c304a]">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-2 text-xs font-semibold",
                trend.positive ? "text-emerald-600" : "text-red-500"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
          {footerLink && (
            <button type="button" className="mt-2 text-xs font-medium text-[#006aec] hover:underline">
              {footerLink}
            </button>
          )}
          {badge && (
            <span
              className={cn(
                "mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-semibold",
                badge.variant === "enabled"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              )}
            >
              {badge.label}
            </span>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D60D26]/10",
              iconClassName
            )}
          >
            <Icon className="h-5 w-5 text-[#D60D26]" />
          </div>
        )}
      </div>
    </div>
  );
}
