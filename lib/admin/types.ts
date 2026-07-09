import type { ReactNode } from "react";

export type AdminStatus =
  | "active"
  | "pending"
  | "approved"
  | "denied"
  | "open"
  | "closed"
  | "inactive";

export interface AdminNavItem {
  label: string;
  href?: string;
  children?: AdminNavItem[];
}

export interface AdminNavSection {
  id: string;
  label: string;
  icon: string;
  href?: string;
  children?: AdminNavItem[];
}

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}
