"use client";

import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { ForSaleInventoryGrid } from "@/components/ForSaleInventoryGrid";

export default function B2BForSalePage() {
  return (
    <div className="w-full min-h-screen bg-background flex flex-col">
      <B2BNavbar />

      <div className="w-full bg-primary py-12">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h1 className="text-3xl md:text-4xl font-[600] text-white tracking-tight">
            Inventory For Sale (B2B)
          </h1>
          <p className="mt-3 text-white/80 text-sm md:text-base max-w-xl mx-auto">
            Agent-published seats for agency booking — same offline inventory channel.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-6 lg:px-12 py-12 flex-1">
        <ForSaleInventoryGrid
          bookPath="/b2b/book"
          title="Exclusive Agent Travel Deals"
          subtitle="B2B offline inventory from agents — book seats without live GDS."
        />
      </main>

      <Footer />
    </div>
  );
}
