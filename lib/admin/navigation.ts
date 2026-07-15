import type { AdminNavSection } from "./types";

/**
 * Sidebar from live Figma page screenshots (Business Overview, Managed API, Agent list, Credit Balance).
 * Top-level: Dashboard, API, Agent, Staff, Queries, Balance, Setting.
 */
export const adminNavSections: AdminNavSection[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    children: [
      { label: "Business Overview", href: "/admin/dashboard" },
      { label: "Administration & Perm.", href: "/admin/dashboard/administration" },
      { label: "Platform & API Center", href: "/admin/dashboard/platform-api" },
    ],
  },
  {
    id: "api",
    label: "API",
    icon: "Plug",
    children: [
      { label: "Supplier Inventory", href: "/admin/inventory/search" },
      { label: "API Booking", href: "/admin/api-bookings" },
      { label: "Supplier Booking", href: "/admin/bookings" },
      { label: "Supplier Manage API", href: "/admin/api/managed" },
      { label: "Agent API", href: "/admin/api/agent" },
    ],
  },
  {
    id: "agent",
    label: "Agent",
    icon: "Users",
    children: [
      { label: "Agent list", href: "/admin/agents" },
      { label: "Add Agent", href: "/admin/agents/add" },
    ],
  },
  {
    id: "staff",
    label: "Staff",
    icon: "Briefcase",
    children: [
      { label: "Staff List", href: "/admin/staff" },
      { label: "Holidays & Leaves", href: "/admin/staff/holidays" },
    ],
  },
  {
    id: "queries",
    label: "Queries",
    icon: "MessageSquare",
    href: "/admin/queries",
  },
  {
    id: "balance",
    label: "Balance",
    icon: "Wallet",
    children: [
      { label: "Credit Balance", href: "/admin/balance/credit" },
      { label: "Set Limit", href: "/admin/balance/set-limit" },
      { label: "Accounts", href: "/admin/balance/accounts" },
      { label: "Deposit Request", href: "/admin/balance/deposit-request" },
      { label: "Staff Data", href: "/admin/staff/data" },
    ],
  },
  {
    id: "settings",
    label: "Setting",
    icon: "Settings",
    href: "/admin/settings",
  },
];

export function getAdminBreadcrumb(pathname: string): string {
  for (const section of adminNavSections) {
    if (section.href === pathname) return section.label;
    for (const child of section.children ?? []) {
      if (child.href === pathname) return child.label;
    }
  }
  if (pathname.includes("/api-bookings")) return "API Booking";
  if (pathname.includes("/inventory/book")) return "API Book";
  if (pathname.includes("/rebooking")) return "Rebooking";
  if (pathname.includes("/refund")) return "Refund";
  if (pathname.includes("/special-request")) return "Special Request";
  if (pathname.includes("/bookings/")) return "PNR Details";
  if (pathname.includes("/api/agent/")) return "Agent API Profile";
  if (pathname.includes("/api/customer")) return "Customer API";
  if (pathname.includes("/customers")) return "Customer";
  if (pathname.includes("/inventory/results")) return "Supplier Inventory Results";
  return "Admin";
}
