"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarIcon, ChevronDown, Plus, CheckCircle2, X } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// ---- Validation Schema ----
const passengerSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  dob: z.string().min(1, "Date Of Birth is required"),
  gender: z.string().min(1, "Gender is required"),
  nationality: z.string().min(1, "Nationality is required"),
  passportNumber: z.string().min(1, "Passport Number is required").regex(/^[A-Z0-9]{6,9}$/i, "Invalid Passport Format"),
  issuingCountry: z.string().min(1, "Issuing Country is required"),
  passportExpiry: z.string().min(1, "Passport Expiry is required").refine((date) => {
    const expiry = new Date(date);
    const today = new Date();
    // Expiry must be at least 6 months from today roughly
    const sixMonthsFromNow = new Date(today.setMonth(today.getMonth() + 6));
    return expiry >= sixMonthsFromNow;
  }, { message: "Passport must be valid for at least 6 months" }),
});

const formSchema = z.object({
  passengers: z.array(passengerSchema).min(1, "At least one passenger is required")
});

type FormValues = z.infer<typeof formSchema>;

// ---- Types ----
interface Passenger {
  id: number;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  nationality: string;
  passportNumber: string;
  issuingCountry: string;
  passportExpiry: string;
}

// ---- Static Data ----
const PAX_DATA = {
  pnrDetails: {
    requestId: "GRP1134718273",
    groupName: "Harshit786",
    requestedDate: "20 Aug,25",
    requestedTime: "(04:00)",
    status: "Payment Complete",
    requestedBy: "Sanjay Kushwaha",
  },
  flights: [
    {
      route: "DEL-BKK",
      airline: "AIR INDIA",
      flightNo: "AI-105",
      pnr: "XBYZ102",
      passengers: "12(12A)",
      submitted: "0(0A)",
      action: "Update name list",
    },
    {
      route: "BKK-DEL",
      airline: "AIR INDIA",
      flightNo: "AI-005",
      pnr: "ABYZ902",
      passengers: "12(12A)",
      submitted: "0(0A)",
      action: "",
    },
  ],
  stats: {
    requestId: "GRP1134718273",
    totalPax: "12A",
    updatedPax: "00A",
  }
};

// ---- Toast ----
interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-white text-[14px] font-medium min-w-[280px] pointer-events-auto ${
            t.type === "success" ? "bg-green-600" : "bg-[#D60D26]"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function AddPaxDetailsPage() {
  const router = useRouter();

  // ---- Toast state ----
  const [toasts, setToasts] = useState<Toast[]>([]);
  let toastCounter = 0;

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = ++toastCounter + Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ---- React Hook Form Setup ----
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengers: [{
        firstName: "",
        lastName: "",
        dob: "",
        gender: "",
        nationality: "",
        passportNumber: "",
        issuingCountry: "",
        passportExpiry: "",
      }]
    }
  });

  const { fields, append } = useFieldArray({
    control,
    name: "passengers"
  });

  const passengersWatch = watch("passengers");

  // ---- Add a new blank passenger ----
  const handleAddPassenger = () => {
    append({
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      nationality: "",
      passportNumber: "",
      issuingCountry: "",
      passportExpiry: "",
    });
  };

  // ---- Submit handler ----
  const onSubmit = (data: FormValues) => {
    console.log("Submitting passengers:", data.passengers);
    showToast(`${data.passengers.length} passenger(s) saved successfully!`, "success");

    // Navigate back after a short delay
    setTimeout(() => router.push("/b2b/group-travel/add-passenger"), 1500);
  };
  
  // Custom error submit handler to show toast for validation failure
  const onError = (errors: any) => {
     showToast(`Please fill in all required passenger fields correctly.`, "error");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <Navbar />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 py-6 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[14px] text-gray-500 mb-6">
          <Link href="/b2b/group-travel/view-request" className="hover:underline">Request</Link>
          <span>›</span>
          <Link href="/b2b/group-travel/add-passenger" className="hover:underline">Add passengers</Link>
          <span>›</span>
          <span className="text-gray-900 font-bold">Add pax details</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-8">
          <h1 className="text-lg font-bold text-gray-900 mb-2">PNR Details</h1>

          {/* --- PNR Details --- */}
          <Section title="Request details">
            <div className="grid grid-cols-4 gap-6">
              {/* Group Details */}
              <div>
                <ColHeader>Group Details</ColHeader>
                <LabelValue label="Request ID">
                  <span className="text-blue-600 font-semibold text-[14px]">{PAX_DATA.pnrDetails.requestId}</span>
                </LabelValue>
                <LabelValue label="Group name">
                  <span className="text-gray-900 font-medium text-[14px]">{PAX_DATA.pnrDetails.groupName}</span>
                </LabelValue>
              </div>

              {/* Requested Date */}
              <div>
                <ColHeader>Requested date</ColHeader>
                <div className="flex flex-col mt-2">
                  <span className="text-gray-900 font-bold text-[15px]">{PAX_DATA.pnrDetails.requestedDate}</span>
                  <span className="text-gray-400 text-[13px]">{PAX_DATA.pnrDetails.requestedTime}</span>
                </div>
              </div>

              {/* Requested Status */}
              <div>
                <ColHeader>Requested Status</ColHeader>
                <div className="mt-2">
                  <span className="text-green-500 font-bold text-[14px]">{PAX_DATA.pnrDetails.status}</span>
                </div>
              </div>

              {/* Requested By */}
              <div>
                <ColHeader>Requested By</ColHeader>
                <div className="mt-2 text-gray-900 text-[13px] font-medium">
                  {PAX_DATA.pnrDetails.requestedBy}
                </div>
              </div>
            </div>
          </Section>

          {/* ---- Booking details ---- */}
          <Section title="Booking details">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-gray-400 text-left border-b border-gray-100">
                  <th className="pb-3 font-semibold">Route</th>
                  <th className="pb-3 font-semibold">Airline</th>
                  <th className="pb-3 font-semibold">PNR</th>
                  <th className="pb-3 font-semibold">No. of passengers</th>
                  <th className="pb-3 font-semibold">Submitted passengers</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {PAX_DATA.flights.map((f, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 font-bold text-gray-900 text-[15px]">{f.route}</td>
                    <td className="py-4">
                      <div className="text-[#D60D26] font-bold text-[13px] uppercase tracking-wide">
                        {f.airline}<sup className="text-[8px]">✈</sup>
                      </div>
                      <div className="text-gray-900 font-bold text-[13px]">{f.flightNo}</div>
                    </td>
                    <td className="py-4">
                      <span className="text-blue-500 hover:underline cursor-pointer font-medium">{f.pnr}</span>
                    </td>
                    <td className="py-4 text-gray-600">{f.passengers}</td>
                    <td className="py-4 text-gray-600">{f.submitted}</td>
                    <td className="py-4">
                      {f.action && (
                        <span className="text-blue-500 text-[13px] font-medium cursor-pointer hover:underline">
                          {f.action}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* ---- Passenger Details List ---- */}
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 mb-4">Passenger Details List</h2>

            <div className="flex items-center gap-6 text-[13px] mb-6">
              <div className="flex gap-2 text-gray-400">
                Request ID <span className="text-blue-500 font-medium hover:underline cursor-pointer">{PAX_DATA.stats.requestId}</span>
              </div>
              <div className="flex gap-2 text-gray-400">
                No of passenger: <span className="text-gray-900 font-bold">{PAX_DATA.stats.totalPax}</span>
              </div>
              <div className="flex gap-2 text-gray-400">
                No of passenger updated: <span className="text-gray-900 font-bold">{fields.length}</span>
              </div>
            </div>

            {/* Dynamic Form Sections */}
            <div className="space-y-6">
              {fields.map((field, index) => (
                <Section key={field.id} title={`Passenger  ${String(index + 1).padStart(2, '0')}`}>
                  <div className="space-y-6 max-w-4xl pt-2 pb-4">

                    {/* Row 1: Passenger details */}
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-800 mb-4">Passenger details:</h3>
                      <div className="grid grid-cols-5 gap-6">
                        {/* First Name */}
                        <div className="border-b border-gray-300 pb-1">
                          <input
                            {...register(`passengers.${index}.firstName`)}
                            type="text"
                            placeholder="First Name"
                            className={`w-full text-[14px] text-gray-900 placeholder:text-gray-500 outline-none border-none py-1 ${errors.passengers?.[index]?.firstName ? 'border-b-red-500 placeholder-red-400 text-red-600' : ''}`}
                          />
                        </div>
                        {/* Last Name */}
                        <div className="border-b border-gray-300 pb-1">
                          <input
                            {...register(`passengers.${index}.lastName`)}
                            type="text"
                            placeholder="Last Name"
                            className={`w-full text-[14px] text-gray-900 placeholder:text-gray-500 outline-none border-none py-1 ${errors.passengers?.[index]?.lastName ? 'border-b-red-500 placeholder-red-400 text-red-600' : ''}`}
                          />
                        </div>
                        {/* Date Of Birth */}
                        <div className="border-b border-gray-300 pb-1 relative">
                          <input
                            {...register(`passengers.${index}.dob`)}
                            type="text"
                            placeholder="Date Of Birth"
                            className={`w-full text-[14px] text-gray-900 placeholder:text-gray-500 outline-none border-none py-1 pr-6 ${errors.passengers?.[index]?.dob ? 'border-b-red-500 placeholder-red-400 text-red-600' : ''}`}
                            onFocus={(e) => (e.target.type = 'date')}
                            onBlur={(e) => {
                              if (e.target.value === '') e.target.type = 'text';
                            }}
                          />
                          <CalendarIcon className="w-4 h-4 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {/* Gender */}
                        <div className="border-b border-gray-300 pb-1 relative">
                          <select
                            {...register(`passengers.${index}.gender`)}
                            className={`w-full text-[14px] text-gray-500 outline-none border-none py-1 appearance-none bg-transparent cursor-pointer pr-6 ${errors.passengers?.[index]?.gender ? 'text-red-500' : ''}`}
                          >
                            <option value="" disabled hidden>Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {/* Nationality */}
                        <div className="border-b border-gray-300 pb-1">
                          <input
                            {...register(`passengers.${index}.nationality`)}
                            type="text"
                            placeholder="Nationality"
                            className={`w-full text-[14px] text-gray-900 placeholder:text-gray-500 outline-none border-none py-1 ${errors.passengers?.[index]?.nationality ? 'border-b-red-500 placeholder-red-400 text-red-600' : ''}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Passport details */}
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-800 mb-4">Passenger passport details:</h3>
                      <div className="grid grid-cols-5 gap-6">
                        {/* Passport Number */}
                        <div className="col-span-2 border-b border-gray-300 pb-1">
                          <input
                            {...register(`passengers.${index}.passportNumber`)}
                            type="text"
                            placeholder="Passport Number (Min 6 chars)"
                            className={`w-full text-[14px] text-gray-900 placeholder:text-gray-500 outline-none border-none py-1 ${errors.passengers?.[index]?.passportNumber ? 'border-b-red-500 placeholder-red-400 text-red-600' : ''}`}
                          />
                          {errors.passengers?.[index]?.passportNumber && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.passengers[index].passportNumber.message}</span>}
                        </div>
                        {/* Issuing Country */}
                        <div className="col-span-2 border-b border-gray-300 pb-1 relative">
                          <select
                            {...register(`passengers.${index}.issuingCountry`)}
                            className={`w-full text-[14px] text-gray-500 outline-none border-none py-1 appearance-none bg-transparent cursor-pointer pr-6 ${errors.passengers?.[index]?.issuingCountry ? 'text-red-500' : ''}`}
                          >
                            <option value="" disabled hidden>Issuing Country</option>
                            <option value="IN">India</option>
                            <option value="US">United States</option>
                            <option value="UK">United Kingdom</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {/* Passport Expiry */}
                        <div className="border-b border-gray-300 pb-1 relative">
                          <input
                            {...register(`passengers.${index}.passportExpiry`)}
                            type="text"
                            placeholder="Passport Expiry"
                            className={`w-full text-[14px] text-gray-900 placeholder:text-gray-500 outline-none border-none py-1 pr-6 ${errors.passengers?.[index]?.passportExpiry ? 'border-b-red-500 placeholder-red-400 text-red-600' : ''}`}
                            onFocus={(e) => (e.target.type = 'date')}
                            onBlur={(e) => {
                              if (e.target.value === '') e.target.type = 'text';
                            }}
                          />
                          <CalendarIcon className="w-4 h-4 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                          {errors.passengers?.[index]?.passportExpiry && <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.passengers[index].passportExpiry.message}</span>}
                        </div>
                      </div>
                    </div>

                  </div>
                </Section>
              ))}
            </div>

            {/* Add Passenger Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleAddPassenger}
                className="flex items-center gap-2 border border-[#D60D26] text-[#D60D26] rounded-full px-6 py-2 text-[14px] font-semibold hover:bg-red-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Passenger
              </button>
            </div>

          </div>

          {/* ---- Action Buttons ---- */}
          <div className="flex gap-4 pt-4 mt-8 border-t border-gray-100">
            <button
              onClick={() => router.back()}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-900 rounded-full py-3 text-gray-900 font-semibold text-[15px] hover:bg-gray-50 transition-colors"
            >
              Cancel <span className="text-[14px]">↗</span>
            </button>
            <button
              onClick={handleSubmit(onSubmit, onError)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-full py-3 font-semibold text-[15px] transition-colors"
            >
              Save Passenger <span className="text-[14px]">↗</span>
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ---------- Helpers ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <div className="bg-[#FFFFFF] border-b border-gray-100 px-4 py-2.5 inline-block min-w-[200px]">
        <span className="text-[#D60D26] font-bold text-[13px]">{title}</span>
      </div>
      <div className="px-5 py-5 bg-[#FFFFFF]">{children}</div>
    </div>
  );
}

function ColHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-gray-400 text-[13px] font-medium tracking-wide mb-2">
      {children}
    </div>
  );
}

function LabelValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-1.5 flex-wrap">
      <span className="text-gray-400 text-[13px] min-w-[80px]">{label}</span>
      <span>{children}</span>
    </div>
  );
}
