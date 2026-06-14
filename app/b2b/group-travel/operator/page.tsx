"use client";
import { B2BNavbar } from "@/components/B2BNavbar";
import { OperatorDashboardView } from "@/components/OperatorDashboardView";

export default function B2BOperatorPage() {
  return <OperatorDashboardView NavbarComponent={B2BNavbar} />;
}
