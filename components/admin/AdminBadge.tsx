"use client";

import { cn } from "@/lib/utils";
import type { AdminStatus } from "@/lib/admin/types";

const statusStyles: Record<AdminStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  denied: "bg-red-50 text-red-700 border-red-200",
  open: "bg-blue-50 text-blue-700 border-blue-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  inactive: "bg-slate-100 text-slate-500 border-slate-200",
};

export function AdminBadge({
  status,
  label,
  className,
}: {
  status: AdminStatus;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status],
        className
      )}
    >
      {label ?? status}
    </span>
  );
}
