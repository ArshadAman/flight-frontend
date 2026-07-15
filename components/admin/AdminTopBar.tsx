"use client";

import Link from "next/link";
import { Bell, HelpCircle, ChevronDown, Calendar, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function AdminTopBar() {
  const { user, access, openAuthModal, logout } = useAuth();
  const initial = (user?.name || user?.username || "H").charAt(0).toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e8ebef] bg-white px-4">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" className="flex w-[148px] items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#D60D26] text-[10px] font-bold text-white">
            MT
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-[#D60D26]">My Travel Deal</p>
          </div>
        </Link>
        <div className="h-5 w-px bg-[#e8ebef]" />
        <button
          type="button"
          className="flex items-center gap-2 rounded border border-[#e8ebef] px-2.5 py-1.5 text-xs text-[#1c304a]"
        >
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          Demo_workspace
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded border border-[#e8ebef] px-2.5 py-1.5 text-xs text-[#1c304a]"
        >
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          Last 24 hours
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </button>
        <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
          <Bell className="h-4 w-4" />
        </button>
        <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
          <HelpCircle className="h-4 w-4" />
        </button>

        {access && user ? (
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] font-medium text-[#1c304a]">{user.name || user.username}</p>
              <p className="text-[10px] text-slate-400">{user.role || "USER"}</p>
            </div>
            <button
              type="button"
              title="Sign out"
              onClick={logout}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5b8def] text-xs font-bold text-white"
            >
              {initial}
            </button>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="h-8 gap-1 border-[#e8ebef] text-xs" onClick={openAuthModal}>
            <LogIn className="h-3.5 w-3.5" />
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
