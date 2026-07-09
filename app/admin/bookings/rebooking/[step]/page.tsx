"use client";

import { use } from "react";
import { redirect } from "next/navigation";
import {
  AdminWizardLayout,
  AdminWizardField,
} from "@/components/admin/AdminWizard";
import { rebookingSteps } from "@/lib/admin/wizard-configs";
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
      label="Reason for Rebooking:"
      as="select"
      placeholder="Schedule change / Passenger request / Airline cancellation"
    />
  ),
  4: (
    <div className="space-y-4">
      <AdminWizardField label="New Travel Date:" type="date" />
      <AdminWizardField label="Preferred Flight:" placeholder="Search flight number" />
      <AdminWizardField label="Additional Notes:" as="textarea" placeholder="Any special instructions..." />
    </div>
  ),
  5: (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-4 font-bold text-slate-800">Review Rebooking Request</h3>
      <div className="space-y-2 text-sm">
        <p><span className="text-slate-500">PNR:</span> {bookings[0].pnr}</p>
        <p><span className="text-slate-500">Passenger:</span> {bookings[0].passenger}</p>
        <p><span className="text-slate-500">Route:</span> {bookings[0].route}</p>
        <p><span className="text-slate-500">Status:</span> Pending approval</p>
      </div>
    </div>
  ),
};

export default function RebookingStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = use(params);
  const currentStep = parseInt(step, 10);

  if (isNaN(currentStep) || currentStep < 1 || currentStep > rebookingSteps.length) {
    redirect("/admin/bookings/rebooking/1");
  }

  return (
    <AdminWizardLayout
      title={`Rebooking PNR: 28345`}
      steps={rebookingSteps}
      currentStep={currentStep}
      basePath="/admin/bookings/rebooking"
      backHref="/admin/bookings"
    >
      {stepContent[currentStep]}
    </AdminWizardLayout>
  );
}
