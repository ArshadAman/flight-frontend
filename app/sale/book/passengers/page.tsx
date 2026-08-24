"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SALE_BOOK_PAYMENT_PATH } from "@/lib/sale/offlineBookFlow";
import {
  buildInitialPassengers,
  computeBookingTotal,
  loadBookingDraft,
  loadBookingFormProgress,
  saveBookingFormProgress,
  type BookingDraft,
  type BookingPassenger,
} from "@/lib/booking";
import { OfflineBookContextBar } from "@/components/sale/OfflineBookContextBar";
import { BookingPassengerDataPanel } from "@/components/booking/BookingPassengerDataPanel";
import { useAuth } from "@/context/AuthContext";

export default function SaleBookPassengersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [passengers, setPassengers] = useState<BookingPassenger[]>([]);
  const [contactMobile, setContactMobile] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [formReady, setFormReady] = useState(false);

  useEffect(() => {
    const d = loadBookingDraft();
    if (!d) {
      router.replace("/sale/flight/all");
      return;
    }
    setDraft(d);
    const saved = loadBookingFormProgress();
    const expected = d.adults + d.children + d.infants;
    if (saved?.passengers?.length === expected) {
      setPassengers(saved.passengers);
      setContactMobile(saved.contactMobile || "");
      setContactEmail(saved.contactEmail || "");
    } else {
      setPassengers(buildInitialPassengers(d.adults, d.children, d.infants));
    }
    setFormReady(true);
  }, [router]);

  useEffect(() => {
    if (!user || !formReady) return;
    setContactEmail((prev) => prev.trim() || user.email || "");
    const mobile =
      (user as { mobile?: string; phone?: string }).mobile ||
      (user as { mobile?: string; phone?: string }).phone ||
      "";
    if (mobile) setContactMobile((prev) => prev.trim() || mobile);
  }, [user, formReady]);

  useEffect(() => {
    if (!formReady || passengers.length === 0) return;
    saveBookingFormProgress({ passengers, contactMobile, contactEmail });
  }, [formReady, passengers, contactMobile, contactEmail]);

  const pricing = useMemo(
    () => (draft ? computeBookingTotal(draft, passengers) : null),
    [draft, passengers]
  );

  const updatePax = (id: string, field: keyof BookingPassenger, value: string) => {
    setPassengers((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  if (!draft || !formReady) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin h-10 w-10 border-2 border-[#D60D26] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <OfflineBookContextBar draft={draft} />
      <BookingPassengerDataPanel
          draft={draft}
          passengers={passengers}
          pricing={pricing}
          contactMobile={contactMobile}
          contactEmail={contactEmail}
          onContactMobileChange={setContactMobile}
          onContactEmailChange={setContactEmail}
          onUpdatePax={updatePax}
          onConfirmBooking={() => router.push(SALE_BOOK_PAYMENT_PATH)}
          onSearchAgain={() => router.push("/sale/flight/all")}
          flowMode="passengers-only"
          onProceedToPayment={() => router.push(SALE_BOOK_PAYMENT_PATH)}
          showTripHeader={false}
          extraSections={
            draft.inventoryHoldId ? (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900 font-medium mx-6">
                Seat hold is active
                {draft.holdExpiresAt
                  ? ` until ${new Date(draft.holdExpiresAt).toLocaleString("en-IN")}`
                  : " (24 hours)"}
                . Complete passenger details to proceed to payment.
              </div>
            ) : null
          }
        />
    </>
  );
}
