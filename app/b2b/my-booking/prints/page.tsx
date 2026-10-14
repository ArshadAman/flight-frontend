"use client";

import { Suspense } from "react";
import { BookingDocuments } from "@/components/b2b/BookingDocuments";

export default function TicketPrintPage() {
  return (
    <Suspense>
      <BookingDocuments mode="print" />
    </Suspense>
  );
}
