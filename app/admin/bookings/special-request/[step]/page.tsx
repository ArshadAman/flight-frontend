"use client";

import { use } from "react";
import { redirect } from "next/navigation";
import {
  AdminWizardLayout,
  AdminWizardField,
} from "@/components/admin/AdminWizard";
import { specialRequestSteps } from "@/lib/admin/wizard-configs";
import { bookings } from "@/lib/admin/mock-data";

const stepContent: Record<number, React.ReactNode> = {
  1: <AdminWizardField label="Booking:" placeholder="Filekey (PNR)" />,
  2: <AdminWizardField label="Passenger:" placeholder={bookings[0].passenger} />,
  3: (
    <AdminWizardField
      label="Request Type:"
      as="select"
      placeholder="Wheelchair / Meal preference / Seat change / Other"
    />
  ),
  4: <AdminWizardField label="Request Details:" as="textarea" placeholder="Describe the special request..." />,
  5: (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-sm text-slate-500">Drag and drop files here or click to upload</p>
      <p className="mt-1 text-xs text-slate-400">PDF, JPG, PNG up to 5MB</p>
    </div>
  ),
  6: (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-4 font-bold text-slate-800">Submit Special Request</h3>
      <div className="space-y-2 text-sm">
        <p><span className="text-slate-500">PNR:</span> {bookings[0].pnr}</p>
        <p><span className="text-slate-500">Passenger:</span> {bookings[0].passenger}</p>
        <p><span className="text-slate-500">Expected Response:</span> 24-48 hours</p>
      </div>
    </div>
  ),
};

export default function SpecialRequestStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = use(params);
  const currentStep = parseInt(step, 10);

  if (isNaN(currentStep) || currentStep < 1 || currentStep > specialRequestSteps.length) {
    redirect("/admin/bookings/special-request/1");
  }

  return (
    <AdminWizardLayout
      title={`Special Request PNR: 28345`}
      steps={specialRequestSteps}
      currentStep={currentStep}
      basePath="/admin/bookings/special-request"
      backHref="/admin/bookings"
    >
      {stepContent[currentStep]}
    </AdminWizardLayout>
  );
}
