"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  applySeatSelectionToDraft,
  defaultSeatSelection,
  loadOfflineSeatSelection,
  saveOfflineSeatSelection,
  SALE_BOOK_PASSENGERS_PATH,
  type OfflineSeatSelection,
} from "@/lib/sale/offlineBookFlow";
import {
  buildInitialPassengers,
  loadBookingDraft,
  saveBookingDraft,
  saveBookingFormProgress,
  type BookingDraft,
} from "@/lib/booking";
import { OfflineBookContextBar } from "@/components/sale/OfflineBookContextBar";
import { OfflineSeatMapPanel } from "@/components/sale/OfflineSeatMapPanel";
import { unwrapData } from "@/lib/apiEnvelope";
import { getPublicApiUrl } from "@/lib/apiConfig";
import { useAuth } from "@/context/AuthContext";

export default function SaleBookSeatPage() {
  const router = useRouter();
  const { access, openAuthModal } = useAuth();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [selection, setSelection] = useState<OfflineSeatSelection | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const d = loadBookingDraft();
    if (!d) {
      router.replace("/sale/flight/all");
      return;
    }
    setDraft(d);
    setSelection(loadOfflineSeatSelection() || defaultSeatSelection(d));
    setReady(true);
  }, [router]);

  const maxSeats = useMemo(() => {
    if (!draft?.outbound) return 1;
    const fromFlight = draft.outbound.seats_available;
    if (typeof fromFlight === "number" && fromFlight > 0) return fromFlight;
    return Math.max(1, draft.adults + draft.children);
  }, [draft]);

  const refreshHold = async (nextDraft: BookingDraft, seats: number) => {
    if (!access) {
      openAuthModal();
      throw new Error("Sign in required");
    }
    const inventoryId = draft?.outbound.agent_flight_id;
    if (!inventoryId) return nextDraft;

    const api = getPublicApiUrl();
    const res = await fetch(`${api}/flights/holds/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inventory: inventoryId,
        seats,
        prefer_waitlist: false,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((json as { detail?: string }).detail || `Hold failed (${res.status})`);
    }
    const hold = unwrapData<{ id?: string; expires_at?: string }>(json);
    return {
      ...nextDraft,
      inventoryHoldId: hold.id ? String(hold.id) : nextDraft.inventoryHoldId,
      holdExpiresAt: hold.expires_at || nextDraft.holdExpiresAt,
    };
  };

  const onContinue = async () => {
    if (!draft || !selection) return;
    setBusy(true);
    try {
      let nextDraft = applySeatSelectionToDraft(draft, selection);
      const paying = selection.adults + selection.children;
      const prevPaying = draft.adults + draft.children;
      if (paying !== prevPaying || !nextDraft.inventoryHoldId) {
        nextDraft = await refreshHold(nextDraft, paying);
      }
      saveBookingDraft(nextDraft);
      saveOfflineSeatSelection(selection);
      const passengers = buildInitialPassengers(selection.adults, selection.children, selection.infants);
      saveBookingFormProgress({
        passengers,
        contactMobile: "",
        contactEmail: "",
      });
      router.push(SALE_BOOK_PASSENGERS_PATH);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not update seat hold");
    } finally {
      setBusy(false);
    }
  };

  if (!ready || !draft || !selection) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin h-10 w-10 border-2 border-[#D60D26] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <OfflineBookContextBar draft={draft} />
      <div className="flex-1 bg-slate-100/80 min-h-[60vh]" />
      <OfflineSeatMapPanel
        draft={draft}
        selection={selection}
        maxSeats={maxSeats}
        onChange={setSelection}
        onClose={() => router.push("/sale/flight/all")}
        onContinue={() => void onContinue()}
        busy={busy}
      />
    </>
  );
}
