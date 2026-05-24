import React from "react";
import { B2BNavbar } from "@/components/B2BNavbar";
import { B2BBookingForm } from "@/components/B2BBookingForm";

export default function B2BBookPage() {
    return (
        <main className="min-h-screen bg-[#F2FBFF]">
            <B2BNavbar />
            <B2BBookingForm />
        </main>
    );
}
