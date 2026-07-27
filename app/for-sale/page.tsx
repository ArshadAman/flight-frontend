"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ForSaleInventoryGrid } from "@/components/ForSaleInventoryGrid";

export default function ForSalePage() {
  return (
    <div className="w-full min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="w-full bg-primary py-12">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h1 className="text-3xl md:text-4xl font-[600] text-white tracking-tight">
            Inventory For Sale
          </h1>
          <p className="mt-3 text-white/80 text-sm md:text-base max-w-xl mx-auto">
            Offline agent inventory — fixed seats published for direct purchase.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-6 lg:px-12 py-12 flex-1">
        <ForSaleInventoryGrid bookPath="/book" />
      </main>

      <Footer />
    </div>
  );
}
