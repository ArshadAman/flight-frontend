
"use client";

import React, { useState, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useGroupTravel } from "@/context/GroupTravelContext";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { PAYMENT_CONFIG } from "@/lib/paymentConfig";

// ---- Inline Toast ----
interface Toast { id: number; type: "success" | "error"; message: string; }
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-white text-[14px] font-medium min-w-[300px] pointer-events-auto ${t.type === "success" ? "bg-green-600" : "bg-[#D60D26]"}`}>
          {t.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

// ---- Static Data ----
const PAYMENT_DATA = {
  requestId: "GRP1134718273",
  groupName: "Harshit786",
  noOfPassengers: "12(12A)",
  acceptedFarePerPax: "INR 18000",
  totalFare: "INR 2,16,000.00",
  pnr: "Group 1",

  flights: [
    {
      route: "DEL-BKK",
      airline: "AIR INDIA",
      flightNo: "AI-105",
      passengers: "12(12A)",
      depart: "19 Aug,25",
      departTime: "(04:00)",
      arrival: "20 Aug,25",
      arrivalTime: "(23:02)",
      groupFare: "INR 10000.00",
    },
    {
      route: "BKK-DEL",
      airline: "AIR INDIA",
      flightNo: "AI-005",
      passengers: "12(12A)",
      depart: "29 Sep,25",
      departTime: "(04:00)",
      arrival: "30 Sep,25",
      arrivalTime: "(23:02)",
      groupFare: "INR 8000.00",
    },
  ],

  paymentInstallments: [
    {
      id: 1,
      phase: "Phase_1",
      payment: "D-50",
      amount: "1,08,000.00",
      dueDate: "08 Aug, 2025 (04:00)",
      status: "Paid",
    },
    {
      id: 2,
      phase: "Phase_2",
      payment: "D-60",
      amount: "1,08,000.00",
      dueDate: "20 Aug, 2025 (04:00)",
      status: "Due",
    },
  ],

  makePaymentRow: {
    requestId: "GRP1134718273",
    pnr: "--",
    groupNumber: "Group 1",
    holdValidity: "08 Aug, 2025",
    holdValidityTime: "(04:00)",
    pnrStatus: "Hold",
    paidAmount: "INR 0",
    totalAmount: "INR 2,16,000.00",
    requestAmount: "INR 1,08,000.00",
  },

  summary: {
    totalPackagePrice: "INR 2,16,000.00",
    totalPaid: "INR 1,08,000.00",
    totalAmountDueLater: "0.00",
    totalAmountDue: "INR 1,08,000.00",
    remainingPercentage: "50%",
  },
};

function PaymentSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id');
  const { requests } = useGroupTravel();
  const req = requests.find((r) => r.requestId === requestId);
  const [checked, setChecked] = useState(true);

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };
  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  let displayData = { ...PAYMENT_DATA };
  if (req) {
     const totalFareInt = parseInt(req.expectedFare || '0') * ((req.adults || 0) + (req.children || 0));
     const formattedTotal = "INR " + totalFareInt.toLocaleString('en-IN') + ".00";
     const formattedHalf = "INR " + (totalFareInt * PAYMENT_CONFIG.splitPercentage).toLocaleString('en-IN') + ".00";
     const isPaid = req.status === "Paid";

     displayData.requestId = req.requestId;
     displayData.groupName = req.groupName || "Group";
     displayData.noOfPassengers = `${req.adults + req.children}(${req.adults}A)`;
     displayData.acceptedFarePerPax = "INR " + (req.expectedFare || '0');
     displayData.totalFare = formattedTotal;

     displayData.paymentInstallments = [
       { ...PAYMENT_DATA.paymentInstallments[0], amount: (totalFareInt * PAYMENT_CONFIG.splitPercentage).toLocaleString('en-IN') + ".00", status: "Paid" },
       { ...PAYMENT_DATA.paymentInstallments[1], amount: (totalFareInt * (1 - PAYMENT_CONFIG.splitPercentage)).toLocaleString('en-IN') + ".00", status: isPaid ? "Paid" : "Due" }
     ];

     displayData.makePaymentRow = {
       ...PAYMENT_DATA.makePaymentRow,
       requestId: req.requestId,
       totalAmount: formattedTotal,
       requestAmount: isPaid ? "INR 0.00" : formattedHalf,
       paidAmount: isPaid ? formattedTotal : "INR 0",
     };

     displayData.summary = {
       totalPackagePrice: formattedTotal,
       totalPaid: isPaid ? formattedTotal : formattedHalf,
       totalAmountDueLater: "0.00",
       totalAmountDue: isPaid ? "INR 0.00" : formattedHalf,
       remainingPercentage: isPaid ? "0%" : `${PAYMENT_CONFIG.splitPercentage * 100}%`,
     };
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <Navbar />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 py-6 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-base text-gray-500 mb-5">
          <Link href="/group-travel/view-request" className="hover:underline">Request</Link>
          <span>›</span>
          <Link href="/group-travel/make-payment" className="hover:underline">Make payment</Link>
          <span>›</span>
          <span className="text-gray-800 font-medium">Payment summary</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h1 className="text-xl font-bold text-gray-900">Payment summary</h1>

          {/* --- Request Details --- */}
          <Section title="Request details">
            <div className="grid grid-cols-3 gap-x-6">
              {/* Left: Group details */}
              <div>
                <ColHeader>Group Details</ColHeader>
                <LabelValue label="Request ID">
                  <span className="text-blue-600 font-semibold text-[15px]">{displayData.requestId}</span>
                </LabelValue>
                <LabelValue label="Group name">
                  <span className="text-gray-800 text-[15px]">{displayData.groupName}</span>
                </LabelValue>
              </div>

              {/* Middle: Details */}
              <div>
                <ColHeader>Details</ColHeader>
                <LabelValue label="No of passengers">
                  <span className="text-gray-800 text-[15px]">{displayData.noOfPassengers}</span>
                </LabelValue>
                <LabelValue label="Accepted fare(per pax)">
                  <span className="text-gray-800 text-[15px]">{displayData.acceptedFarePerPax}</span>
                </LabelValue>
              </div>

              {/* Right: Group fare */}
              <div>
                <ColHeader>Group fare</ColHeader>
                <LabelValue label="Total fare">
                  <span className="text-gray-800 font-semibold text-[15px]">{displayData.totalFare}</span>
                </LabelValue>
                <LabelValue label="PNR">
                  <span className="text-blue-600 font-semibold text-[15px]">{displayData.pnr}</span>
                </LabelValue>
              </div>
            </div>
          </Section>

          {/* ---- Flight Details ---- */}
          <Section title="Flight details">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-gray-400 text-left border-b border-gray-100">
                  <th className="pb-2 font-semibold">Route</th>
                  <th className="pb-2 font-semibold">Flight</th>
                  <th className="pb-2 font-semibold">No. of passengers</th>
                  <th className="pb-2 font-semibold">Depart</th>
                  <th className="pb-2 font-semibold">Arrival</th>
                  <th className="pb-2 font-semibold text-right">Group fare</th>
                </tr>
              </thead>
              <tbody>
                {displayData.flights.map((f, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 font-semibold text-gray-800">{f.route}</td>
                    <td className="py-3">
                      <div className="text-[#D60D26] font-bold text-[13px] uppercase leading-tight">
                        {f.airline}
                      </div>
                      <div className="text-gray-600">{f.flightNo}</div>
                    </td>
                    <td className="py-3 text-gray-700">{f.passengers}</td>
                    <td className="py-3">
                      <div className="text-gray-800 font-medium">{f.depart}</div>
                      <div className="text-gray-400">{f.departTime}</div>
                    </td>
                    <td className="py-3">
                      <div className="text-gray-800 font-medium">{f.arrival}</div>
                      <div className="text-gray-400">{f.arrivalTime}</div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="text-blue-600 font-bold">{f.groupFare}</div>
                      <div className="text-blue-500 text-[11px] cursor-pointer hover:underline">Fare breakdown</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* ---- Payment Details ---- */}
          <Section title="Payment details">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-gray-400 text-left border-b border-gray-100 uppercase text-[12px] tracking-wider">
                  <th className="pb-2 font-semibold">S.no</th>
                  <th className="pb-2 font-semibold">Payment</th>
                  <th className="pb-2 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Due date</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayData.paymentInstallments.map((p, i) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-gray-700">{i + 1}</td>
                    <td className="py-3 text-gray-700">{p.payment}</td>
                    <td className="py-3">
                      <div className="text-blue-600 font-bold">INR {p.amount}</div>
                      <div className="text-blue-500 text-[11px] cursor-pointer hover:underline">Fare breakdown</div>
                    </td>
                    <td className="py-3 text-gray-700">{p.dueDate}</td>
                    <td className={`py-3 font-bold ${p.status === "Paid" ? "text-green-600" : "text-[#D60D26]"}`}>
                      {p.status}
                    </td>
                    <td className="py-3">
                      <div className="w-5 h-5 border border-gray-300 rounded-sm bg-gray-100 opacity-50" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* ---- Make Payment Table ---- */}
          <Section title="Make Payment">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-gray-400 text-left border-b border-gray-100">
                  <th className="pb-2 font-semibold">Request Id</th>
                  <th className="pb-2 font-semibold">PNR</th>
                  <th className="pb-2 font-semibold">Group Number</th>
                  <th className="pb-2 font-semibold">Hold validity</th>
                  <th className="pb-2 font-semibold">PNR status</th>
                  <th className="pb-2 font-semibold">Paid Amount</th>
                  <th className="pb-2 font-semibold">Total Amount</th>
                  <th className="pb-2 font-semibold">Request Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 text-[#D60D26] font-semibold">{displayData.makePaymentRow.requestId}</td>
                  <td className="py-3 text-gray-500">{displayData.makePaymentRow.pnr}</td>
                  <td className="py-3 text-gray-800 font-medium">{displayData.makePaymentRow.groupNumber}</td>
                  <td className="py-3">
                    <div className="text-gray-800">{displayData.makePaymentRow.holdValidity}</div>
                    <div className="text-gray-400">{displayData.makePaymentRow.holdValidityTime}</div>
                  </td>
                  <td className="py-3 text-gray-700">{displayData.makePaymentRow.pnrStatus}</td>
                  <td className="py-3 text-gray-700">{displayData.makePaymentRow.paidAmount}</td>
                  <td className="py-3 text-blue-600 font-semibold">{displayData.makePaymentRow.totalAmount}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-semibold">{displayData.makePaymentRow.requestAmount}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        className="w-4 h-4 accent-[#D60D26] cursor-pointer"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* ---- Payment Summary Totals ---- */}
          <Section title="Make Payment">
            <div className="space-y-3 text-[15px]">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Total Package Price</span>
                <span className="text-blue-600 font-semibold">{displayData.summary.totalPackagePrice}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Total paid</span>
                <span className="text-gray-700 font-semibold">{displayData.summary.totalPaid}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Current remaining percentage</span>
                <span className="text-[#D60D26] font-bold">{displayData.summary.remainingPercentage}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Total amount due later</span>
                <span className="text-gray-700">{displayData.summary.totalAmountDueLater}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-800 font-semibold">Total amount due</span>
                <span className="text-blue-600 font-bold text-[17px] font-semibold">{displayData.summary.totalAmountDue}</span>
              </div>
            </div>
          </Section>

          {/* ---- Action Buttons ---- */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => router.push("/group-travel/make-payment")}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 rounded-full py-3 text-gray-700 font-semibold text-[16px] hover:bg-gray-50 transition-colors"
            >
              Cancel <span className="text-base">↗</span>
            </button>
            <button 
              onClick={() => {
                if (displayData.summary.remainingPercentage === "0%") {
                  showToast("Payment already completed!", "error");
                  return;
                }
                router.push(`/group-travel/make-payment/payment-portal?id=${displayData.requestId}`);
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-[16px] transition-colors ${
                displayData.summary.remainingPercentage === "0%"
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-[#D60D26] hover:bg-[#D60D26] text-white"
              }`}
            >
              Submit <span className="text-base">↗</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentSummaryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 p-10 font-bold text-center">Loading...</div>}>
      <PaymentSummaryContent />
    </Suspense>
  );
}

/* ---------- Helpers ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <div className="bg-[#FFFFFF] border-b border-gray-100 px-4 py-2">
        <span className="text-[#D60D26] font-semibold text-[15px]">{title}</span>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

function ColHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-gray-400 text-[13px] font-semibold uppercase tracking-wide mb-2 border-b border-gray-100 pb-1">
      {children}
    </div>
  );
}

function LabelValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-400 text-[14px] min-w-[100px]">{label}</span>
      <span>{children}</span>
    </div>
  );
}
