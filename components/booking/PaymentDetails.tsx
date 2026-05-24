"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function PaymentDetails({ ticket, isB2B = false }: { ticket?: any; isB2B?: boolean }) {
  const hasLivePassengers = ticket && ticket.passengers_data && ticket.passengers_data.length > 0;
  
  let passengers = [
    { no: 1, name: "CHIRGANIA HARSHIT MR", price: "₹3,500.00", tax: "₹0.00", total: "₹3,500.00" },
    { no: 2, name: "ARORA VAIBHAV MR", price: "₹3,500.00", tax: "₹0.00", total: "₹3,500.00" }
  ];

  if (hasLivePassengers) {
    const count = ticket.passengers_data.length || 1;
    const perPaxPrice = parseFloat(ticket.basic_amount || "0") / count;
    const perPaxTax = parseFloat(ticket.tax_amount || "0") / count;
    const perPaxTotal = parseFloat(ticket.total_amount || "0") / count;

    passengers = ticket.passengers_data.map((pax: any, idx: number) => ({
      no: idx + 1,
      name: `${pax.last_name || ""} ${pax.first_name || ""} ${pax.title || "MR"}`.toUpperCase().trim(),
      price: `₹${perPaxPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      tax: `₹${perPaxTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      total: `₹${perPaxTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    }));
  }

  return (
    <>
      <div className="w-full bg-[#f4f5f7] px-8 py-3.5 border-y border-gray-200">
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
            {passengers.map((p: any) => (
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

export function BookingActions({ ticket, isB2B = false }: { ticket?: any; isB2B?: boolean }) {
  const { logout, openAuthModal } = useAuth();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelStatus, setCancelStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localStatus, setLocalStatus] = useState(ticket?.status || "CONFIRMED");

  const isCancelled = localStatus === "CANCELLED";

  const handleCancelClick = () => {
    if (isCancelled) return;
    setShowConfirm(true);
  };

  const handleConfirmCancel = async () => {
    setShowConfirm(false);
    setIsCancelling(true);
    setCancelStatus("idle");
    setErrorMessage(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const ticketId = ticket?.id;
      if (!ticketId) throw new Error("No ticket ID");

      const res = await fetch(`${apiBase}/tickets/${ticketId}/cancel/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ remarks: "Customer requested cancellation via portal" }),
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
    } catch (e: any) {
      console.error("[BookingActions] Cancel failed:", e);
      setErrorMessage(e.message || "Cancellation failed. Please contact support or try again.");
      setCancelStatus("error");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="w-full mb-10 px-2 lg:px-8">
      {/* Cancel confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-200">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-[20px] font-black text-slate-800 mb-2">Cancel This Booking?</h3>
            <p className="text-[14px] text-slate-500 font-semibold mb-6 leading-relaxed">
              This will send a cancellation request to the airline. If the ticket is refundable, a refund will be processed as per fare rules.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-[46px] rounded-full border border-slate-200 font-bold text-[14px] text-slate-600 hover:bg-slate-50 transition"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 h-[46px] rounded-full bg-[#D60D26] text-white font-bold text-[14px] hover:bg-[#b00b1d] transition shadow-lg shadow-red-200"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
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
        <button
          onClick={handleCancelClick}
          disabled={isCancelled || isCancelling}
          className={`flex-1 min-w-[140px] px-4 py-3.5 rounded-full border text-[16px] font-[800] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center tracking-tight ${
            isCancelled
              ? "border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed"
              : isCancelling
              ? "border-gray-300 text-gray-400 bg-white cursor-wait"
              : "border-gray-300 text-[#1e2329] bg-white hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26]"
          }`}
        >
          {isCancelled ? "Cancelled" : isCancelling ? "Cancelling..." : "Cancel Booking"}
        </button>

        {/* Add Baggage — no API available, show info */}
        <button
          title="Add Baggage requests are handled directly with the airline for this booking."
          className="flex-1 min-w-[140px] px-4 py-3.5 rounded-full border border-gray-300 text-[16px] font-[800] text-[#1e2329] hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white text-center tracking-tight"
        >
          Add Baggage
        </button>

        {/* Check Refund */}
        <button
          title="Refund eligibility is based on your fare rules. Contact support for refund status."
          className="flex-1 min-w-[140px] px-4 py-3.5 rounded-full border border-gray-300 text-[16px] font-[800] text-[#1e2329] hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white text-center tracking-tight"
        >
          Check Refund
        </button>

        {/* Modification */}
        <button
          title="Modifications are handled directly with the airline for this booking."
          className="flex-1 min-w-[140px] px-4 py-3.5 rounded-full border border-gray-300 text-[16px] font-[800] text-[#1e2329] hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white text-center tracking-tight"
        >
          Modification
        </button>

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
