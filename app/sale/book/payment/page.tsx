"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildOfflineTicket,
  clearBookingDraft,
  computeBookingTotal,
  loadBookingDraft,
  loadBookingFormProgress,
  submitFlightBooking,
  type BookingDraft,
  type BookingPassenger,
} from "@/lib/booking";
import { clearOfflineSeatSelection } from "@/lib/sale/offlineBookFlow";
import { OfflineBookContextBar } from "@/components/sale/OfflineBookContextBar";
import { OfflineBookPaymentPanel } from "@/components/sale/OfflineBookPaymentPanel";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation";
import { useAuth } from "@/context/AuthContext";
import { validatePassengerDob, validatePassportExpiry } from "@/lib/passengerAge";
import { isDomesticItinerary, itineraryRequiresTravelDocs } from "@/lib/domesticRoute";

export default function SaleBookPaymentPage() {
  const router = useRouter();
  const { user, access, openAuthModal } = useAuth();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [passengers, setPassengers] = useState<BookingPassenger[]>([]);
  const [contactMobile, setContactMobile] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPnrs, setSuccessPnrs] = useState<string[]>([]);

  useEffect(() => {
    const d = loadBookingDraft();
    if (!d) {
      router.replace("/sale/flight/all");
      return;
    }
    const saved = loadBookingFormProgress();
    const expected = d.adults + d.children + d.infants;
    if (!saved?.passengers?.length || saved.passengers.length !== expected) {
      router.replace("/sale/book/passengers");
      return;
    }
    setDraft(d);
    setPassengers(saved.passengers);
    setContactMobile(saved.contactMobile || "");
    setContactEmail(saved.contactEmail || "");
  }, [router]);

  const pricing = useMemo(
    () => (draft ? computeBookingTotal(draft, passengers) : null),
    [draft, passengers]
  );

  const requiresTravelDocs = useMemo(() => {
    if (!draft) return false;
    const isDomestic = isDomesticItinerary([draft.outbound, draft.returnFlight], [draft.origin, draft.destination]);
    return itineraryRequiresTravelDocs(isDomestic, [draft.outbound, draft.returnFlight]);
  }, [draft]);

  const validateAll = (): string | null => {
    if (!draft) return "Missing booking draft.";
    if (!contactMobile.trim() || !contactEmail.trim()) return "Contact mobile and email are required.";
    for (const p of passengers) {
      if (!p.first_name.trim() || !p.last_name.trim()) {
        return `${p.label}: Name is required.`;
      }
      const dobErr = validatePassengerDob(p.dob, p.pax_type, draft.departureDate, p.label);
      if (dobErr) return dobErr;
      if (requiresTravelDocs) {
        if (!p.passport_number?.trim()) return `${p.label}: Passport number is required.`;
        const passportErr = validatePassportExpiry(p.passport_expiry, draft.departureDate, p.label, {
          required: true,
        });
        if (passportErr) return passportErr;
      }
    }
    return null;
  };

  const completeBooking = async () => {
    if (!draft) return;
    const validationError = validateAll();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!user || !access) {
      openAuthModal();
      return;
    }

    setLoading(true);
    setError(null);
    const token = access;
    const result = await submitFlightBooking(
      draft.outbound,
      draft.returnFlight,
      { mobile: contactMobile, email: contactEmail },
      passengers,
      token,
      [],
      draft.inventoryHoldId ? { holdId: draft.inventoryHoldId } : undefined
    );

    if (result.ok) {
      clearBookingDraft();
      clearOfflineSeatSelection();
      const pnrs = result.tickets
        .map((t: unknown) => (t as { pnr_number?: string })?.pnr_number)
        .filter(Boolean) as string[];
      setSuccessPnrs(pnrs.length ? pnrs : ["CONFIRMED"]);
      setLoading(false);
      return;
    }

    const stored = buildOfflineTicket(draft, passengers, draft.outbound, "Outbound") as Record<string, unknown>;
    try {
      const existing = JSON.parse(localStorage.getItem("offline_bookings") || "[]");
      localStorage.setItem("offline_bookings", JSON.stringify([...existing, stored]));
    } catch {
      /* ignore */
    }
    clearBookingDraft();
    clearOfflineSeatSelection();
    setSuccessPnrs([(stored as { pnr_number: string }).pnr_number]);
    setLoading(false);
  };

  if (!draft) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin h-10 w-10 border-2 border-[#D60D26] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (successPnrs.length) {
    return (
      <>
        <OfflineBookContextBar draft={draft} />
        <div className="w-full max-w-[1280px] mx-auto py-8 px-4">
          <BookingConfirmation
            draft={draft}
            pnrs={successPnrs}
            totalAmount={pricing?.total}
            contactEmail={contactEmail}
            onViewBookings={() => router.push("/sale/booking")}
            onSearchAgain={() => router.push("/sale/flight/all")}
            onHome={() => router.push("/sale")}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <OfflineBookContextBar draft={draft} />
      <div className="w-full max-w-[1280px] mx-auto py-8 px-4 flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm opacity-60 pointer-events-none">
          <div className="w-full px-6 py-3.5 bg-slate-600">
            <h2 className="text-white font-bold text-[15px]">Details / Passenger Data</h2>
          </div>
          <p className="px-6 py-4 text-sm text-slate-500 font-medium">
            Passenger details captured. Review payment below.
          </p>
        </div>
        <OfflineBookPaymentPanel
          draft={draft}
          passengers={passengers}
          pricing={pricing}
          contactEmail={contactEmail}
          contactMobile={contactMobile}
          loading={loading}
          formError={error}
          onPayAndOrder={() => void completeBooking()}
          onHold={() => router.push("/sale/flight/all")}
        />
      </div>
    </>
  );
}
