"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type BookingDraft,
  type BookingPassenger,
  buildInitialPassengers,
  buildOfflineTicket,
  clearBookingDraft,
  computeBookingTotal,
  loadBookingDraft,
  submitFlightBooking,
} from "@/lib/booking";
import { validatePassengerDob } from "@/lib/passengerAge";
import { useAuth } from "@/context/AuthContext";
import { BookingPassengerDataPanel } from "./BookingPassengerDataPanel";
import { BookingConfirmation } from "./BookingConfirmation";

export function FlightBookingForm({ b2b = false }: { b2b?: boolean }) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [passengers, setPassengers] = useState<BookingPassenger[]>([]);
  const [contactMobile, setContactMobile] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successPnrs, setSuccessPnrs] = useState<string[]>([]);

  useEffect(() => {
    const d = loadBookingDraft();
    if (!d) {
      router.replace(b2b ? "/b2b" : "/");
      return;
    }
    setDraft(d);
    setPassengers(buildInitialPassengers(d.adults, d.children, d.infants));
    setContactEmail(user?.email || "");
  }, [b2b, router, user?.email]);

  const pricing = useMemo(
    () => (draft ? computeBookingTotal(draft, passengers) : null),
    [draft, passengers]
  );

  const updatePax = (id: string, field: keyof BookingPassenger, value: string) => {
    setPassengers((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!draft) return;
    if (!user) {
      setError("Please sign in to complete your booking.");
      openAuthModal();
      return;
    }
    if (!contactMobile.trim() || !contactEmail.trim()) {
      setError("Contact mobile and email are required (CTC tab).");
      return;
    }
    for (const p of passengers) {
      if (!p.first_name.trim()) {
        setError(`${p.label}: First name is required.`);
        return;
      }
      if (!p.last_name.trim()) {
        setError(`${p.label}: Last name is required.`);
        return;
      }
      const dobErr = validatePassengerDob(p.dob, p.pax_type, draft.departureDate, p.label);
      if (dobErr) {
        setError(dobErr);
        return;
      }
    }

    // Seats/meals are only available post-booking via Add-ons / SSR.
    const bookingSSRDetails: Array<Record<string, unknown>> = [];

    setLoading(true);
    const token = localStorage.getItem("access_token") || localStorage.getItem("mock-access-token");

    const result = await submitFlightBooking(
      draft.outbound,
      draft.returnFlight,
      { mobile: contactMobile, email: contactEmail },
      passengers,
      token,
      bookingSSRDetails
    );

    if (result.ok) {
      clearBookingDraft();
      const pnrs = result.tickets
        .map((t: unknown) => (t as { pnr_number?: string })?.pnr_number)
        .filter(Boolean) as string[];
      setSuccessPnrs(pnrs.length ? pnrs : ["CONFIRMED"]);
      setLoading(false);
      return;
    }

    const stored: Array<Record<string, unknown>> = [];
    const outboundTicket = buildOfflineTicket(draft, passengers, draft.outbound, "Outbound") as Record<
      string,
      unknown
    >;
    outboundTicket.ssr_data = { BookingSSRDetails: bookingSSRDetails };
    stored.push(outboundTicket);

    if (draft.returnFlight) {
      const returnTicket = buildOfflineTicket(draft, passengers, draft.returnFlight, "Return") as Record<
        string,
        unknown
      >;
      returnTicket.ssr_data = { BookingSSRDetails: bookingSSRDetails };
      stored.push(returnTicket);
    }

    try {
      const existing = JSON.parse(localStorage.getItem("offline_bookings") || "[]");
      localStorage.setItem("offline_bookings", JSON.stringify([...existing, ...stored]));
    } catch {
      /* ignore */
    }
    clearBookingDraft();
    setSuccessPnrs(stored.map((t) => (t as { pnr_number: string }).pnr_number));
    setLoading(false);
  };

  if (!draft) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin h-10 w-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (successPnrs.length && draft) {
    const confirmedTotal = pricing ? pricing.total : undefined;
    return (
      <BookingConfirmation
        draft={draft}
        pnrs={successPnrs}
        totalAmount={confirmedTotal}
        contactEmail={contactEmail}
        onViewBookings={() => router.push(b2b ? "/b2b/my-booking" : "/my-booking")}
        onSearchAgain={() => router.push(b2b ? "/b2b/search" : "/search")}
        onHome={() => router.push(b2b ? "/b2b" : "/")}
      />
    );
  }

  return (
    <BookingPassengerDataPanel
      draft={draft}
      passengers={passengers}
      pricing={pricing}
      ssrTotalFees={0}
      contactMobile={contactMobile}
      contactEmail={contactEmail}
      onContactMobileChange={setContactMobile}
      onContactEmailChange={setContactEmail}
      onUpdatePax={updatePax}
      onConfirmBooking={handleSubmit}
      loading={loading}
      onSearchAgain={() => router.push(b2b ? "/b2b/search" : "/search")}
      formError={error}
    />
  );
}
