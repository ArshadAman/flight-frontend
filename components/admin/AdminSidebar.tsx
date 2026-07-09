"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Plug,
  Plane,
  Ticket,
  Users,
  UserCircle,
  Briefcase,
  MessageSquare,
  Wallet,
  Settings,
  ChevronDown,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavSections } from "@/lib/admin/navigation";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Plug,
  Plane,
  Ticket,
  Users,
  UserCircle,
  Briefcase,
  MessageSquare,
  Wallet,
  Settings,
};

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  if (pathname === href) return true;
  // Wizard steps: /admin/bookings/rebooking/2 matches /admin/bookings/rebooking/1 base
  const base = href.replace(/\/\d+$/, "");
  if (base !== href && pathname.startsWith(base + "/")) return true;
  return false;
}

function sectionHasActive(pathname: string, section: (typeof adminNavSections)[0]) {
  if (section.href && isActive(pathname, section.href)) return true;
  return section.children?.some((c) => isActive(pathname, c.href)) ?? false;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    adminNavSections.forEach((s) => {
      if (sectionHasActive(pathname, s)) initial[s.id] = true;
    });
    if (!initial.dashboard) initial.dashboard = true;
    return initial;
  });

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <aside className="flex h-full w-[164px] shrink-0 flex-col border-r border-slate-200 bg-white shadow-[0_6px_17px_-1px_rgba(28,48,74,0.12)]">
      <div className="flex-1 overflow-y-auto pt-4">
        <nav className="flex flex-col gap-3 px-0">
          {adminNavSections.map((section) => {
            const Icon = iconMap[section.icon] ?? BarChart3;
            const hasChildren = (section.children?.length ?? 0) > 0;
            const isExpanded = expanded[section.id];
            const active = sectionHasActive(pathname, section);

            if (!hasChildren && section.href) {
              return (
                <Link
                  key={section.id}
                  href={section.href}
                  className={cn(
                    "relative flex h-10 items-center gap-2 px-4 text-xs font-medium text-slate-600 hover:text-slate-900",
                    isActive(pathname, section.href) && "font-semibold text-slate-900"
                  )}
                >
                  {isActive(pathname, section.href) && (
                    <span className="absolute right-0 top-0 h-full w-[3px] rounded-l bg-[#D60D26]" />
                  )}
                  <Icon className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{section.label}</span>
                </Link>
              );
            }

            return (
              <div key={section.id}>
                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  className={cn(
                    "relative flex h-10 w-full items-center gap-2 px-4 text-left text-xs font-medium text-slate-600 hover:text-slate-900",
                    active && "font-semibold text-slate-900"
                  )}
                >
                  {active && (
                    <span className="absolute right-0 top-0 h-full w-[3px] rounded-l bg-[#D60D26]" />
                  )}
                  <Icon className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="flex-1 truncate">{section.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                  )}
                </button>

                {isExpanded && section.children && (
                  <div className="mt-1 flex flex-col gap-0.5">
                    {section.children.map((child) => {
                      const childActive = isActive(pathname, child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href!}
                          className={cn(
                            "relative flex h-[30px] items-center pl-[30px] pr-3 text-xs text-slate-500 hover:text-slate-800",
                            childActive && "font-medium text-[#c61324]"
                          )}
                        >
                          {childActive && (
                            <span className="absolute left-5 top-1 h-[18px] w-px bg-gradient-to-b from-[#e20b2b] to-[#f54a56]" />
                          )}
                          <span className="truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
