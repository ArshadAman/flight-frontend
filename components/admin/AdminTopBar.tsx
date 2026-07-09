"use client";

import { Bell, HelpCircle, Search, ChevronDown } from "lucide-react";
import { getAdminBreadcrumb } from "@/lib/admin/navigation";
import { usePathname } from "next/navigation";

export function AdminTopBar() {
  const pathname = usePathname();
  const breadcrumb = getAdminBreadcrumb(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#D60D26] text-sm font-bold text-white">
            FF
          </div>
          <span className="text-sm font-bold text-slate-800">FyreFly</span>
        </div>
        <div className="h-5 w-px bg-slate-200" />
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <span>Admin</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
        <div className="hidden items-center gap-1 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 md:flex">
          <Search className="h-3.5 w-3.5" />
          <span>{breadcrumb}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 sm:flex">
          <span className="font-medium">EN</span>
          <ChevronDown className="h-3 w-3" />
        </div>
        <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <Bell className="h-4 w-4" />
        </button>
        <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <HelpCircle className="h-4 w-4" />
        </button>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D60D26] text-xs font-bold text-white">
          A
        </div>
      </div>
    </header>
  );
}
