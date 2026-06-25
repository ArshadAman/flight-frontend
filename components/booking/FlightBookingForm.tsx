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
import { useAuth } from "@/context/AuthContext";
import PreBookingSSRSelection, { type SelectionsState } from "./PreBookingSSRSelection";
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
  const [ssrSelections, setSsrSelections] = useState<SelectionsState>({});

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

  const ssrTotalFees = useMemo(() => {
    let sum = 0;
    Object.values(ssrSelections).forEach((sel) => {
      if (sel.seat) sum += parseFloat(String(sel.seat.Total_Amount || 0));
      if (sel.meal) sum += parseFloat(String(sel.meal.Total_Amount || 0));
      if (sel.baggage) sum += parseFloat(String(sel.baggage.Total_Amount || 0));
      if (sel.wheelchair) sum += parseFloat(String(sel.wheelchair.Total_Amount || 0));
    });
    return sum;
  }, [ssrSelections]);

  const updatePax = (id: string, field: keyof BookingPassenger, value: string) => {
    setPassengers((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!draft) return;
    if (!user) {
      openAuthModal();
      return;
    }
    if (!contactMobile.trim() || !contactEmail.trim()) {
      setError("Contact mobile and email are required (CTC tab).");
      return;
    }
    for (const p of passengers) {
      if (!p.first_name.trim() || !p.last_name.trim() || !p.dob) {
        setError(`Complete all fields for ${p.label}.`);
        return;
      }
    }

    const bookingSSRDetails: Array<Record<string, unknown>> = [];
    Object.entries(ssrSelections).forEach(([key, sel]) => {
      const [paxIdStr, segmentIdStr] = key.split("-");
      const paxId = parseInt(paxIdStr, 10);
      const segmentId = parseInt(segmentIdStr, 10);

      if (sel.seat?.SSR_Key) {
        bookingSSRDetails.push({
          Pax_Id: paxId,
          SSR_Key: sel.seat.SSR_Key,
          SSR_TypeName: sel.seat.SSR_TypeName,
          SSR_Type: 3,
          Segment_Id: segmentId,
        });
      }
      if (sel.meal?.SSR_Key) {
        bookingSSRDetails.push({
          Pax_Id: paxId,
          SSR_Key: sel.meal.SSR_Key,
          SSR_Code: sel.meal.SSR_Code,
          SSR_TypeDesc: sel.meal.SSR_TypeDesc,
          SSR_Type: 1,
          Segment_Id: segmentId,
        });
      }
      if (sel.baggage?.SSR_Key) {
        bookingSSRDetails.push({
          Pax_Id: paxId,
          SSR_Key: sel.baggage.SSR_Key,
          SSR_Code: sel.baggage.SSR_Code,
          SSR_TypeDesc: sel.baggage.SSR_TypeDesc,
          SSR_Type: 0,
          Segment_Id: segmentId,
        });
      }
      if (sel.wheelchair?.SSR_Key) {
        bookingSSRDetails.push({
          Pax_Id: paxId,
          SSR_Key: sel.wheelchair.SSR_Key,
          SSR_Code: sel.wheelchair.SSR_Code,
          SSR_TypeDesc: sel.wheelchair.SSR_TypeDesc,
          SSR_Type: 4,
          Segment_Id: segmentId,
        });
      }
    });

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
    const outboundTicket = buildOfflineTicket(draft, passengers, draft.outbound, "Outbound") as Record<string, unknown>;
    outboundTicket.ssr_data = { BookingSSRDetails: bookingSSRDetails };
    stored.push(outboundTicket);

    if (draft.returnFlight) {
      const returnTicket = buildOfflineTicket(draft, passengers, draft.returnFlight, "Return") as Record<string, unknown>;
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
    const confirmedTotal = pricing ? pricing.total + ssrTotalFees : undefined;
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
    <>
      <BookingPassengerDataPanel
        draft={draft}
        passengers={passengers}
        pricing={pricing}
        ssrTotalFees={ssrTotalFees}
        contactMobile={contactMobile}
        contactEmail={contactEmail}
        onContactMobileChange={setContactMobile}
        onContactEmailChange={setContactEmail}
        onUpdatePax={updatePax}
        onConfirmBooking={handleSubmit}
        loading={loading}
        onSearchAgain={() => router.push(b2b ? "/b2b/search" : "/search")}
        extraSections={
          <>
            <div className="px-6 pb-6">
              <PreBookingSSRSelection
                searchKey={draft.outbound.search_key || "mock-search-key"}
                outbound={draft.outbound}
                returnFlight={draft.returnFlight}
                passengers={passengers}
                onChange={setSsrSelections}
              />
            </div>
            {error && (
              <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">
                {error}
              </div>
            )}
          </>
        }
      />
    </>
  );
}
