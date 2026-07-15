"use client";

import { use, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import {
  AdminWizardLayout,
  AdminWizardField,
  AdminWizardTicketSelection,
  AdminWizardRadioGroup,
  AdminWizardCheckboxGroup,
  AdminWizardFeesBox,
  AdminWizardSuccess,
} from "@/components/admin/AdminWizard";
import { rebookingSteps } from "@/lib/admin/wizard-configs";

function RebookingStepContent({
  step,
  submitted,
}: {
  step: number;
  submitted: boolean;
}) {
  if (submitted && step === 5) {
    return (
      <AdminWizardSuccess
        title="Ticket change request submitted"
        message={
          <p>
            You have successfully submitted your ticket change request. We will process it as
            soon as possible.
          </p>
        }
        linkLabel="Submit Another Rebooking Request"
        linkHref="/admin/bookings/rebooking/1"
      />
    );
  }

  switch (step) {
    case 1:
      return <AdminWizardField label="Booking:" placeholder="Filekey (PNR)" />;
    case 2:
      return <AdminWizardTicketSelection />;
    case 3:
      return (
        <div className="space-y-6">
          <AdminWizardRadioGroup
            question="What is the reason for rebooking?"
            options={[
              "Volunteer rebooking",
              "Flight cancellation or change by the airline (INVOL)",
            ]}
            defaultValue={0}
          />
          <AdminWizardField
            label=""
            as="textarea"
            placeholder="Comment(optional)"
            rows={5}
            hideLabel
          />
        </div>
      );
    case 4:
      return (
        <div className="space-y-6">
          <AdminWizardRadioGroup
            question="What would you like to do?"
            options={["Rebook"]}
            defaultValue={0}
          />
          <AdminWizardField
            label=""
            placeholder="Flight number and date of the flight in question"
            hideLabel
          />
        </div>
      );
    case 5:
      return (
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-400" />
              <span className="text-base text-slate-700">
                Please give me a quote, I can&apos;t figure out the airline cost.
              </span>
            </label>
            <div className="space-y-2">
              <AdminWizardField label="" placeholder="Expected Costs" hideLabel />
              <p className="text-sm text-slate-500">
                How much rebooking costs from the airline do you expect (airline fee + fare
                surcharge + tax surcharge)?
              </p>
            </div>
            <AdminWizardField label="" placeholder="Acceptable Extra Costs" hideLabel />
            <AdminWizardRadioGroup
              question="How should the costs be paid?"
              options={[
                "Total by invoice",
                "Airline costs by credit card, fees by invoice",
                "Total by credit card",
              ]}
              defaultValue={0}
            />
            <AdminWizardCheckboxGroup
              label="Who should receive messages related to this request?"
              options={["booking@mytraveldeal.co.uk", "admin@mytraveldeal.co.uk"]}
              defaultChecked={[0, 1]}
            />
          </div>
          <AdminWizardFeesBox />
        </div>
      );
    default:
      return null;
  }
}

export default function RebookingStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = use(params);
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const currentStep = parseInt(step, 10);

  if (isNaN(currentStep) || currentStep < 1 || currentStep > rebookingSteps.length) {
    redirect("/admin/bookings/rebooking/1");
  }

  const isSuccess = submitted && currentStep === 5;

  return (
    <AdminWizardLayout
      title="Rebooking PNR: 28345"
      steps={rebookingSteps}
      currentStep={currentStep}
      basePath="/admin/bookings/rebooking"
      backHref="/admin/bookings"
      contentClassName={currentStep === 5 ? "max-w-4xl" : undefined}
      continueLabel={currentStep === 5 ? "Request Rebooking" : "Continue"}
      continueClassName={currentStep === 5 ? "bg-[#f4a0a8] hover:bg-[#f4a0a8]/90" : undefined}
      hideActions={isSuccess}
      onContinue={() => {
        if (currentStep === 5) {
          setSubmitted(true);
          return;
        }
        router.push(`/admin/bookings/rebooking/${currentStep + 1}`);
      }}
    >
      <RebookingStepContent step={currentStep} submitted={submitted} />
    </AdminWizardLayout>
  );
}
