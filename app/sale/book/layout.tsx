"use client";

import { SaleNavbar } from "@/components/SaleNavbar";
import { Footer } from "@/components/Footer";

export default function SaleBookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col font-sans">
      <SaleNavbar />
      {children}
      <Footer />
    </div>
  );
}
