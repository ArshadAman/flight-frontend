"use client";

import { use } from "react";
import { redirect } from "next/navigation";
import {
  AdminWizardLayout,
  AdminWizardField,
} from "@/components/admin/AdminWizard";
import { refundSteps } from "@/lib/admin/wizard-configs";
import { bookings } from "@/lib/admin/mock-data";

const stepContent: Record<number, React.ReactNode> = {
  1: <AdminWizardField label="Booking:" placeholder="Filekey (PNR)" />,
  2: (
    <div className="space-y-4">
      <AdminWizardField label="Select Ticket:" as="select" placeholder="Ticket 1 - DEL → BOM" />
      <AdminWizardField label="Passenger:" placeholder="Amit Sharma" />
    </div>
  ),
  3: (
    <AdminWizardField
      label="Refund Type:"
      as="select"
      placeholder="Full refund / Partial refund / Airline credit"
    />
  ),
  4: (
    <div className="space-y-4">
      <AdminWizardField label="Original Amount:" placeholder={`₹${bookings[0].amount}`} />
      <AdminWizardField label="Cancellation Charges:" placeholder="₹500" />
      <AdminWizardField label="Refund Amount:" placeholder={`₹${Number(bookings[0].amount) - 500}`} />
    </div>
  ),
  5: <AdminWizardField label="Refund Reason:" as="textarea" placeholder="Reason for refund request..." />,
  6: (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-4 font-bold text-slate-800">Confirm Refund</h3>
      <div className="space-y-2 text-sm">
        <p><span className="text-slate-500">PNR:</span> {bookings[0].pnr}</p>
        <p><span className="text-slate-500">Refund Amount:</span> ₹{Number(bookings[0].amount) - 500}</p>
        <p><span className="text-slate-500">Processing Time:</span> 5-7 business days</p>
      </div>
    </div>
  ),
};

export default function RefundStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = use(params);
  const currentStep = parseInt(step, 10);

  if (isNaN(currentStep) || currentStep < 1 || currentStep > refundSteps.length) {
    redirect("/admin/bookings/refund/1");
  }

  return (
    <AdminWizardLayout
      title={`Refund PNR: 28345`}
      steps={refundSteps}
      currentStep={currentStep}
      basePath="/admin/bookings/refund"
      backHref="/admin/bookings"
    >
      {stepContent[currentStep]}
    </AdminWizardLayout>
  );
}
