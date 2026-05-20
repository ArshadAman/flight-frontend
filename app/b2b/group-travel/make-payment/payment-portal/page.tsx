"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, ChevronRight, CheckCircle2, QrCode, CreditCard, Wallet, X, AlertCircle } from "lucide-react";
import { useGroupTravel } from "@/context/GroupTravelContext";
import { Suspense } from "react";
import { PAYMENT_CONFIG } from "@/lib/paymentConfig";

// ---- Inline Toast ----
interface Toast { id: number; type: "success" | "error"; message: string; }
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-white text-[14px] font-medium min-w-[300px] pointer-events-auto ${ t.type === "success" ? "bg-green-600" : "bg-[#E11D48]" }`}>
          {t.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

function PaymentPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id');
  const { requests, updateRequest } = useGroupTravel();
  const req = requests.find((r) => r.requestId === requestId);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };
  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  let amountToPay = "1,08,000.00";
  if (req && req.expectedFare) {
    const totalFareInt = parseInt(req.expectedFare) * ((req.adults || 0) + (req.children || 0));
    amountToPay = (totalFareInt * PAYMENT_CONFIG.splitPercentage).toLocaleString('en-IN') + ".00";
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      showToast("Please upload the payment screenshot — it is compulsory.", "error");
      return;
    }
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      showToast("Payment screenshot submitted successfully!", "success");
      if (requestId) {
        updateRequest(requestId, { status: "Paid" });
      }
      setTimeout(() => {
        router.push(`/b2b/group-travel/make-payment/payment-summary?id=${requestId || 'GRP1134718273'}`);
      }, 1200);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 py-8 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[14px] text-gray-500 mb-6">
          <Link href="/b2b/group-travel/view-request" className="hover:text-[#E11D48] transition-colors">Request</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/b2b/group-travel/make-payment" className="hover:text-[#E11D48] transition-colors">Make payment</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/b2b/group-travel/make-payment/payment-summary" className="hover:text-[#E11D48] transition-colors">Payment summary</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-semibold">Payment portal</span>
        </div>

        {/* Mandatory Note */}
        <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-lg p-4 mb-8 flex items-start gap-3">
          <div className="bg-[#E11D48] rounded-full p-1 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <p className="text-[#9F1239] text-[15px] font-medium">
            Note: Please submit the screen shot of payment it is compulsory
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Payment Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#E11D48]" />
                Payment Options
              </h2>

              <div className="space-y-4">
                {/* UPI Option */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                        <Wallet className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">UPI Payment</p>
                        <p className="text-xs text-gray-500">Scan to pay instantly</p>
                      </div>
                    </div>
                    <span className="text-[14px] font-bold text-blue-600">INR {amountToPay}</span>
                  </div>
                  
                  <div className="flex flex-col items-center bg-white p-4 rounded-lg border border-gray-100">
                    {/* Placeholder for QR Code */}
                    <div className="w-40 h-40 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200 mb-3">
                      <QrCode className="w-20 h-20 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">UPI ID: {PAYMENT_CONFIG.upiId}</p>
                    <p className="text-xs text-gray-400 mt-1">Merchant Name: My Travel Deal</p>
                  </div>
                </div>

                {/* Bank Details Option */}
                <div className="p-4 rounded-xl border border-gray-100">
                  <p className="font-semibold text-gray-900 mb-3">Bank Transfer Details</p>
                  <div className="space-y-2 text-[14px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Name</span>
                      <span className="font-medium text-gray-800">My Travel Deal Pvt Ltd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Number</span>
                      <span className="font-medium text-gray-800">{PAYMENT_CONFIG.bankAccountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bank Name</span>
                      <span className="font-medium text-gray-800">HDFC Bank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">IFSC Code</span>
                      <span className="font-medium text-gray-800">{PAYMENT_CONFIG.ifscCode}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Confirmation</h2>
            
            <div className="space-y-6">
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                  selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-[#E11D48]/30 hover:bg-gray-100'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {selectedFile ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="font-semibold text-gray-900 truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">File selected successfully</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="mt-4 text-xs text-red-500 font-medium hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-900">Upload Screenshot</p>
                    <p className="text-sm text-gray-500 mt-1">Drag and drop or click to browse</p>
                    <p className="text-[11px] text-gray-400 mt-4 uppercase tracking-wider font-bold">Supported: JPG, PNG, PDF</p>
                  </div>
                )}
              </div>

              <div className="bg-[#FFFBEB] p-4 rounded-xl border border-[#FEF3C7]">
                <p className="text-[13px] text-[#92400E] leading-relaxed">
                  <strong>Important:</strong> After successful transfer, please upload the receipt/screenshot here. Our team will verify it within 24 hours.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className={`w-full py-4 rounded-xl font-bold text-[16px] shadow-lg shadow-[#E11D48]/20 flex items-center justify-center gap-2 transition-all ${
                  isUploading 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-[#E11D48] hover:bg-[#be1238] text-white hover:translate-y-[-2px] active:translate-y-[0px]'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Final Submit <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-10 font-bold bg-gray-50">Loading...</div>}>
      <PaymentPortalContent />
    </Suspense>
  );
}
