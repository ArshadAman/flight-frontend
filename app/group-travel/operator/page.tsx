"use client";
import { Navbar } from "@/components/Navbar";
import { OperatorDashboardView } from "@/components/OperatorDashboardView";

export default function OperatorPage() {
  return <OperatorDashboardView NavbarComponent={Navbar} />;
}
