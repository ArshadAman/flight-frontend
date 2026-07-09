import type { AdminNavSection } from "./types";

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
      { label: "Managed API", href: "/admin/api/managed" },
      { label: "Supplier Requests", href: "/admin/api/supplier-requests" },
      { label: "Bulk Actions", href: "/admin/api/bulk-actions" },
      { label: "Agent API", href: "/admin/api/agent" },
      { label: "Agent API Keys", href: "/admin/api/agent/keys" },
      { label: "Integrations Map", href: "/admin/api/agent/integrations" },
      { label: "Customer API", href: "/admin/api/customer" },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: "Plane",
    children: [
      { label: "Search Engine", href: "/admin/inventory/search" },
      { label: "Search Results", href: "/admin/inventory/results" },
    ],
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: "Ticket",
    children: [
      { label: "Booking Management", href: "/admin/bookings" },
      { label: "PNR Details", href: "/admin/bookings/pnr" },
      { label: "Rebooking", href: "/admin/bookings/rebooking/1" },
      { label: "Refund", href: "/admin/bookings/refund/1" },
      { label: "Special Request", href: "/admin/bookings/special-request/1" },
    ],
  },
  {
    id: "agents",
    label: "Agent",
    icon: "Users",
    children: [
      { label: "Agent List", href: "/admin/agents" },
      { label: "Add Agent", href: "/admin/agents/add" },
      { label: "Markup", href: "/admin/agents/markup" },
      { label: "Add Suppliers", href: "/admin/agents/suppliers" },
      { label: "Sales Promotions", href: "/admin/agents/promotions" },
      { label: "Add Discounts", href: "/admin/agents/discounts" },
      { label: "Block Airlines", href: "/admin/agents/block-airlines" },
      { label: "Block Routes", href: "/admin/agents/block-routes" },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    icon: "UserCircle",
    children: [
      { label: "Customer List", href: "/admin/customers" },
      { label: "Add Customer", href: "/admin/customers/add" },
    ],
  },
  {
    id: "staff",
    label: "Staff",
    icon: "Briefcase",
    children: [
      { label: "Staff List", href: "/admin/staff" },
      { label: "Holidays & Leaves", href: "/admin/staff/holidays" },
      { label: "Staff Data", href: "/admin/staff/data" },
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
      if (child.href && pathname.startsWith(child.href.split("/").slice(0, -1).join("/") + "/")) {
        return child.label;
      }
    }
  }
  if (pathname.includes("/rebooking")) return "Rebooking";
  if (pathname.includes("/refund")) return "Refund";
  if (pathname.includes("/special-request")) return "Special Request";
  if (pathname.match(/\/admin\/bookings\/BK-/)) return "PNR Details";
  if (pathname.match(/\/admin\/agents\/AGT-/)) return "Agent Details";
  if (pathname.match(/\/admin\/api\/agent\/AGT-/)) return "Agent API Profile";
  return "Admin";
}
