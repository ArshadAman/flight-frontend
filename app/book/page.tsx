"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FlightBookingForm } from "@/components/booking/FlightBookingForm";

export default function BookPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <div className="animate-spin h-10 w-10 border-2 border-[#D60D26] border-t-transparent rounded-full" />
          </div>
        }
      >
        <FlightBookingForm />
      </Suspense>
      <Footer />
    </main>
  );
}
