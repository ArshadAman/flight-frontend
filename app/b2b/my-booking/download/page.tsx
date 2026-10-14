"use client";

import { Suspense } from "react";
import { BookingDocuments } from "@/components/b2b/BookingDocuments";

export default function TicketDownloadPage() {
  return (
    <Suspense>
      <BookingDocuments mode="download" />
    </Suspense>
  );
}
