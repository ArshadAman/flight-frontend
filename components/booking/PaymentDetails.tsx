"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type PassengerData = {
  pax_type?: number;
  title?: string;
  first_name?: string;
  last_name?: string;
};

type BookingTicket = {
  id?: string;
  status?: string;
  pnr_number?: string;
  ticket_number?: string;
  passengers_data?: PassengerData[];
  basic_amount?: string | number;
  tax_amount?: string | number;
  total_amount?: string | number;
  cancellation_data?: any;
};

type OfflineBooking = BookingTicket & {
  updated_at?: string;
  [key: string]: unknown;
};

export function PaymentDetails({ ticket, isB2B = false }: { ticket?: BookingTicket; isB2B?: boolean }) {
  const hasLivePassengers = ticket && ticket.passengers_data && ticket.passengers_data.length > 0;
  
  let passengers = [
    { no: 1, name: "CHIRGANIA HARSHIT MR", price: "₹3,500.00", tax: "₹0.00", total: "₹3,500.00" },
    { no: 2, name: "ARORA VAIBHAV MR", price: "₹3,500.00", tax: "₹0.00", total: "₹3,500.00" }
  ];

  if (hasLivePassengers) {
    const count = (ticket.passengers_data?.length) || 1;
    const perPaxPrice = parseFloat(String(ticket.basic_amount || "0")) / count;
    const perPaxTax = parseFloat(String(ticket.tax_amount || "0")) / count;
    const perPaxTotal = parseFloat(String(ticket.total_amount || "0")) / count;

    passengers = (ticket.passengers_data || []).map((pax: PassengerData, idx: number) => ({
      no: idx + 1,
      name: `${pax.last_name || ""} ${pax.first_name || ""} ${pax.title || "MR"}`.toUpperCase().trim(),
      price: `₹${perPaxPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      tax: `₹${perPaxTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      total: `₹${perPaxTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    }));
  }

  return (
    <>
      <div className="w-full bg-[#f4f5f7] px-8 py-3.5 border-y border-gray-200" data-booking-scope={isB2B ? "b2b" : "b2c"}>
        <h3 className="text-[17px] font-[750] text-[#333] tracking-tight">Payments</h3>
      </div>
      <div className="w-full overflow-x-auto p-4 pb-8">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr>
              <th className="py-2 px-8 text-[15px] font-[700] text-gray-400">Price details:</th>
            </tr>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-8 text-[14px] font-[700] text-gray-400">No.</th>
              <th className="py-4 px-2 text-[14px] font-[700] text-gray-400">Pax</th>
              <th className="py-4 px-2 text-[14px] font-[700] text-gray-400 text-right pr-6">Price</th>
              <th className="py-4 px-2 text-[14px] font-[700] text-gray-400 text-right pr-6">Tax</th>
              <th className="py-4 px-8 text-[14px] font-[700] text-gray-400 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((p: { no: number; name: string; price: string; tax: string; total: string }) => (
              <tr key={p.no} className="border-b border-gray-50">
                <td className="py-4 px-8 text-[15px] font-[700] text-gray-700">{p.no}</td>
                <td className="py-4 px-2 text-[15px] font-[700] text-gray-700">{p.name}</td>
                <td className="py-4 px-2 text-[15px] font-[700] text-gray-700 text-right pr-6">{p.price}</td>
                <td className="py-4 px-2 text-[15px] font-[700] text-gray-700 text-right pr-6">{p.tax}</td>
                <td className="py-4 px-8 text-[15px] font-[800] text-gray-800 text-right">{p.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function BookingActions({
  ticket,
  isB2B = false,
  onCancelled,
  onAddBaggageClick,
  onModificationClick,
}: {
  ticket?: BookingTicket;
  isB2B?: boolean;
  onCancelled?: (updatedTicket?: any) => void;
  onAddBaggageClick?: () => void;
  onModificationClick?: () => void;
}) {
  const { logout, openAuthModal } = useAuth();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelStatus, setCancelStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localStatus, setLocalStatus] = useState(ticket?.status || "CONFIRMED");
  const [remarks, setRemarks] = useState<string>("Customer requested cancellation");
  const [showRefundModal, setShowRefundModal] = useState(false);

  const paxCount = ticket?.passengers_data?.length || 1;
  const totalAmount = parseFloat(String(ticket?.total_amount || "0"));
  const basicAmount = parseFloat(String(ticket?.basic_amount || "0"));

  const isCurrentlyCancelled = localStatus === "CANCELLED";
  const cancellationData = ticket?.cancellation_data;

  let paidAmountVal = totalAmount;
  let airlinePenaltyVal = 0;
  let serviceFeeVal = 0;
  let refundAmountVal = totalAmount;
  let cancelledBy = "User";
  let cancelRemarks = "";
  const isEstimate = !isCurrentlyCancelled;

  if (isCurrentlyCancelled && cancellationData && typeof cancellationData === "object") {
    paidAmountVal = parseFloat(String(cancellationData.paid_amount ?? totalAmount));
    airlinePenaltyVal = parseFloat(String(cancellationData.airline_penalty ?? 0));
    serviceFeeVal = parseFloat(String(cancellationData.service_fee ?? 0));
    refundAmountVal = parseFloat(String(cancellationData.refund_amount ?? (paidAmountVal - airlinePenaltyVal - serviceFeeVal)));
    cancelledBy = cancellationData.cancelled_by || "User";
    cancelRemarks = cancellationData.remarks || "";
  } else {
    // Estimations matching backend logic (User cancellation assumed)
    airlinePenaltyVal = Math.min(3000 * paxCount, basicAmount);
    serviceFeeVal = 300 * paxCount;
    refundAmountVal = Math.max(0, paidAmountVal - (airlinePenaltyVal + serviceFeeVal));
  }

  const backendTicketIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  useEffect(() => {
    setLocalStatus(ticket?.status || "CONFIRMED");
  }, [ticket?.status]);

  const isCancelled = localStatus === "CANCELLED";

  const markOfflineBookingCancelled = () => {
    if (typeof window === "undefined") return false;

    const ticketKey = ticket?.id || ticket?.pnr_number || ticket?.ticket_number;
    if (!ticketKey) return false;

    try {
      const stored = localStorage.getItem("offline_bookings");
      if (!stored) return false;

      const parsed: OfflineBooking[] = JSON.parse(stored);
      if (!Array.isArray(parsed)) return false;

      let updated = false;
      const nextBookings = parsed.map((entry: OfflineBooking) => {
        const entryKey = entry.id || entry.pnr_number || entry.ticket_number;
        if (entryKey === ticketKey) {
          updated = true;
          return {
            ...entry,
            status: "CANCELLED",
            updated_at: new Date().toISOString(),
          };
        }
        return entry;
      });

      if (updated) {
        localStorage.setItem("offline_bookings", JSON.stringify(nextBookings));
      }

      return updated;
    } catch (error) {
      console.error("[BookingActions] Failed to cancel offline booking:", error);
      return false;
    }
  };

  const handleCancelClick = () => {
    if (isCancelled) return;
    setRemarks("Customer requested cancellation");
    setShowConfirm(true);
  };

  const handleConfirmCancel = async () => {
    setShowConfirm(false);
    setIsCancelling(true);
    setCancelStatus("idle");
    setErrorMessage(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
      const ticketId = ticket?.id;
      const isBackendTicket = typeof ticketId === "string" && backendTicketIdPattern.test(ticketId);

      if (!ticketId || !isBackendTicket) {
        const cancelledOffline = markOfflineBookingCancelled();
        if (!cancelledOffline) {
          console.warn("[BookingActions] No offline booking record found; applying a local-only cancellation state.");
        }

        setLocalStatus("CANCELLED");
        setCancelStatus("success");
        if (onCancelled) {
          onCancelled();
        }
        return;
      }

      const res = await fetch(`${apiBase}/tickets/${ticketId}/cancel/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          cancellation_type: 0,
          remarks: remarks,
          cancel_code: "005",
        }),
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        openAuthModal();
        throw new Error("Your login session has expired. Please sign in again.");
      }

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      const data = await res.json();
      if (!data.gds_cancelled) {
        throw new Error(data.gds_error || "GDS cancellation rejected by airline provider");
      }

      setLocalStatus("CANCELLED");
      setCancelStatus("success");
      if (onCancelled) {
        onCancelled(data);
      }
    } catch (e: unknown) {
      console.error("[BookingActions] Cancel failed:", e);
      const message = e instanceof Error ? e.message : "Cancellation failed. Please contact support or try again.";
      setErrorMessage(message);
      setCancelStatus("error");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="w-full mb-10 px-2 lg:px-8" data-booking-scope={isB2B ? "b2b" : "b2c"}>
      {/* Cancel confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-200">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-[20px] font-black text-slate-800 mb-2">Cancel This Booking?</h3>
            <p className="text-[13px] text-slate-500 font-semibold mb-6 leading-relaxed">
              Are you sure you want to cancel this booking? This will send a cancellation request to the airline.
            </p>

            {/* Remarks Input */}
            <div className="mb-6 text-left">
              <label className="block text-xs font-[800] text-slate-400 mb-2 uppercase tracking-wider">
                Cancellation Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="E.g., Plan changed, flight time changed..."
                className="w-full h-20 rounded-xl border border-gray-200 p-3 text-sm focus:border-red-500 focus:outline-none transition resize-none font-semibold text-slate-700 placeholder:text-gray-350"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-[46px] rounded-full border border-slate-200 font-[800] text-[14px] text-slate-500 hover:bg-slate-50 transition"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 h-[46px] rounded-full bg-[#D60D26] text-white font-[800] text-[14px] hover:bg-[#b00b1d] transition shadow-lg shadow-red-200"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund details dialog */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full animate-in zoom-in-95 duration-200 text-slate-800 relative">
            <button
              onClick={() => setShowRefundModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition text-xl font-bold p-1"
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="text-4xl mb-3 text-center">💰</div>
            <h3 className="text-[20px] font-black text-slate-800 mb-4 text-center">Refund Breakdown</h3>

            {/* Status Badge */}
            <div className="mb-5 flex justify-center">
              {isEstimate ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-[800] bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Estimated Refund
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-[800] bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Finalized Refund
                </span>
              )}
            </div>

            {/* Breakdown details */}
            <div className="space-y-3 mb-6 text-left border-y border-slate-100 py-3">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Refund Status</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold tracking-tight ${
                  isEstimate 
                    ? "bg-slate-100 text-slate-600 border border-slate-200" 
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {isEstimate ? "Not Initiated" : (cancellationData?.refund_status || "Processed to Source")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Total Paid</span>
                <span className="font-bold text-slate-700">
                  ₹{paidAmountVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Airline Penalty</span>
                <span className="font-bold text-rose-600">
                  - ₹{airlinePenaltyVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Agency Service Fee</span>
                <span className="font-bold text-rose-600">
                  - ₹{serviceFeeVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-slate-800 pt-2 border-t border-dashed border-slate-200">
                <span>{isEstimate ? "Estimated Net Refund" : "Net Refund"}</span>
                <span className="font-black text-emerald-600 text-base">
                  ₹{refundAmountVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Disclosure */}
            {isEstimate ? (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-6 text-[11px] leading-relaxed text-slate-500 font-semibold text-left">
                ⚠️ <span className="font-bold text-slate-700">Disclaimer:</span> This is an estimated breakdown based on standard fare rules (₹3,000 penalty + ₹300 agency fee per passenger). Actual refunds are subject to final validation by the carrier at the time of cancellation.
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-6 text-[11px] leading-relaxed text-slate-500 font-semibold text-left select-text">
                ℹ️ <span className="font-bold text-slate-700">Information:</span> This booking was cancelled by the <span className="font-bold text-slate-700">{cancelledBy}</span>.
                {cancelRemarks && (
                  <p className="mt-1">
                    <span className="font-bold text-slate-700">Remarks:</span> &ldquo;{cancelRemarks}&rdquo;
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => setShowRefundModal(false)}
              className="w-full h-[46px] rounded-full bg-[#1e2329] text-white font-[800] text-[14px] hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Simple Cancelled Status Feedback */}
      {isCancelled && (
        <div className="mb-6 px-5 py-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 font-[800] text-sm flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <span>🚫</span> This booking has been cancelled.
        </div>
      )}

      {/* Status feedback */}
      {cancelStatus === "success" && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top duration-300">
          ✅ Booking cancelled successfully. Refund will be processed as per fare rules.
        </div>
      )}
      {cancelStatus === "error" && (
        <div className="mb-4 px-5 py-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 font-bold text-sm flex flex-col gap-2 shadow-sm animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 text-rose-900 text-base">
            <span>❌</span> GDS Carrier Cancellation Refused
          </div>
          {errorMessage && (
            <div className="text-xs font-semibold text-rose-600 bg-white/70 rounded-lg p-2.5 border border-rose-100 mt-1 leading-normal select-text">
              {errorMessage}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Cancel Booking — wired to cancel API */}
        {!isCancelled && (
          <button
            onClick={handleCancelClick}
            disabled={isCancelling}
            className={`flex-1 min-w-[140px] px-4 py-3.5 rounded-full border text-[16px] font-[800] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center tracking-tight ${
              isCancelling
                ? "border-gray-300 text-gray-400 bg-white cursor-wait"
                : "border-gray-300 text-[#1e2329] bg-white hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26]"
            }`}
          >
            {isCancelling ? "Cancelling..." : "Cancel Booking"}
          </button>
        )}

        {/* Add Baggage — no API available, show info */}
        {!isCancelled && (
          <button
            onClick={onAddBaggageClick}
            title="Add baggage or excess luggage allowance via actual GDS airline updates."
            className="flex-1 min-w-[140px] px-4 py-3.5 rounded-full border border-gray-300 text-[16px] font-[800] text-[#1e2329] hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white text-center tracking-tight"
          >
            Add Baggage
          </button>
        )}

        {/* Check Refund */}
        <button
          onClick={() => setShowRefundModal(true)}
          className="flex-1 min-w-[140px] px-4 py-3.5 rounded-full border border-gray-300 text-[16px] font-[800] text-[#1e2329] hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white text-center tracking-tight"
        >
          Check Refund
        </button>

        {/* Modification */}
        {!isCancelled && (
          <button
            onClick={onModificationClick}
            title="Modify seats or meal choices via actual GDS airline updates."
            className="flex-1 min-w-[140px] px-4 py-3.5 rounded-full border border-gray-300 text-[16px] font-[800] text-[#1e2329] hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white text-center tracking-tight"
          >
            Modification
          </button>
        )}

        {/* Print */}
        <button
          onClick={() => window.print()}
          className="flex-1 min-w-[140px] px-4 py-3.5 rounded-full border border-gray-300 text-[16px] font-[800] text-[#1e2329] hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white text-center tracking-tight"
        >
          Print
        </button>
      </div>
    </div>
  );
}
