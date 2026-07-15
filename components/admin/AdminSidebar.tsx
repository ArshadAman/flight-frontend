"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Plug,
  Users,
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
  Users,
  Briefcase,
  MessageSquare,
  Wallet,
  Settings,
};

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  if (pathname === href) return true;
  if (href === "/admin/bookings" && pathname.startsWith("/admin/bookings/")) return true;
  if (href === "/admin/inventory/search" && pathname.startsWith("/admin/inventory/")) return true;
  if (href === "/admin/api/agent" && pathname.startsWith("/admin/api/agent")) return true;
  if (href === "/admin/queries" && pathname.startsWith("/admin/queries/")) return true;
  if (href === "/admin/agents" && pathname.match(/\/admin\/agents\/AGT-/)) return true;
  if (href === "/admin/staff" && pathname.match(/\/admin\/staff\/STF-/)) return true;
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
    if (!Object.keys(initial).length) initial.dashboard = true;
    return initial;
  });

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <aside className="flex h-full w-[164px] shrink-0 flex-col border-r border-[#e8ebef] bg-white">
      <div className="flex flex-1 flex-col overflow-y-auto pt-2 pb-4">
        <nav className="flex flex-1 flex-col gap-0.5">
          {adminNavSections.map((section) => {
            const Icon = iconMap[section.icon] ?? BarChart3;
            const hasChildren = (section.children?.length ?? 0) > 0;
            const isExpanded = expanded[section.id];
            const active = sectionHasActive(pathname, section);
            const isSetting = section.id === "settings";

            if (!hasChildren && section.href) {
              return (
                <div key={section.id} className={cn(isSetting && "mt-auto pt-8")}>
                  <Link
                    href={section.href}
                    className={cn(
                      "relative flex h-10 items-center gap-2 px-3 text-[12px] font-medium text-[#5b6b7c] hover:text-[#1c304a]",
                      isActive(pathname, section.href) && "font-semibold text-[#c61324]"
                    )}
                  >
                    {isActive(pathname, section.href) && (
                      <span className="absolute left-0 top-1/2 h-[18px] w-[2px] -translate-y-1/2 rounded-r bg-[#c61324]" />
                    )}
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive(pathname, section.href) ? "text-[#c61324]" : "text-[#8a96a5]"
                      )}
                    />
                    <span className="truncate">{section.label}</span>
                  </Link>
                </div>
              );
            }

            return (
              <div key={section.id}>
                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  className={cn(
                    "relative flex h-10 w-full items-center gap-2 px-3 text-left text-[12px] font-medium text-[#5b6b7c] hover:text-[#1c304a]",
                    active && "font-semibold text-[#1c304a]"
                  )}
                >
                  {active && (
                    <span className="absolute right-0 top-0 h-full w-[3px] rounded-l bg-[#c61324]" />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-[#c61324]" : "text-[#8a96a5]"
                    )}
                  />
                  <span className="flex-1 truncate">{section.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-[#8a96a5]" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-[#8a96a5]" />
                  )}
                </button>

                {isExpanded && section.children && (
                  <div className="mb-1 flex flex-col">
                    {section.children.map((child) => {
                      const childActive = isActive(pathname, child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href!}
                          className={cn(
                            "relative flex min-h-[28px] items-center py-1 pl-9 pr-2 text-[11px] text-[#8a96a5] hover:text-[#1c304a]",
                            childActive && "font-medium text-[#c61324]"
                          )}
                        >
                          {childActive && (
                            <span className="absolute left-[22px] top-1/2 h-[14px] w-[2px] -translate-y-1/2 rounded bg-[#c61324]" />
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
