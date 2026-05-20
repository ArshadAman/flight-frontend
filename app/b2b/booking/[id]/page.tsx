import React from "react";
import { B2BNavbar } from "@/components/B2BNavbar";
import { B2BOrderDetails } from "@/components/B2BOrderDetails";

export default function B2BBookingDetailsPage({ params }: { params: { id: string } }) {
    return (
        <main className="min-h-screen bg-[#F8F9FA]">
            <B2BNavbar />
            <B2BOrderDetails />
        </main>
    );
}
