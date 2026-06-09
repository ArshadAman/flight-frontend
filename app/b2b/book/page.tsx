"use client";

import { B2BNavbar } from "@/components/B2BNavbar";
import { FlightBookingForm } from "@/components/booking/FlightBookingForm";

export default function B2BBookPage() {
  return (
    <main className="min-h-screen bg-[#F2FBFF]">
      <B2BNavbar />
      <FlightBookingForm b2b />
    </main>
  );
}
