"use client";

import { use, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import {
  AdminWizardLayout,
  AdminWizardField,
  AdminWizardTicketSelection,
  AdminWizardRadioGroup,
  AdminWizardSuccess,
} from "@/components/admin/AdminWizard";
import { refundSteps } from "@/lib/admin/wizard-configs";

function RefundStepContent({
  step,
  submitted,
}: {
  step: number;
  submitted: boolean;
}) {
  if (submitted && step === 5) {
    return (
      <AdminWizardSuccess
        title="Refund request submitted"
        message={
          <>
            <p>
              You have successfully submitted your refund request. We will process it within the
              next 5 working days.
            </p>
            <p>
              Please note our detailed information regarding refunds here in the Cockpit. You can
              check the status of your refund request at any time with our Refund Status Checker.
            </p>
            <p>
              In order to avoid no-show charges by the airlines and violations of deadlines, we
              will cancel any active flight segments.
            </p>
          </>
        }
        linkLabel="Submit Another Booking For Refund"
        linkHref="/admin/bookings/refund/1"
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
            question="What is the refund type?"
            options={[
              "Refund due to flight cancellation/time change",
              "Refund with airline cancellation fee",
              "Refund without airline cancellation fee",
              "Tax Refund",
              "Partial Refund",
              "Goodwill Refund",
            ]}
            defaultValue={0}
          />
          <AdminWizardField
            label=""
            placeholder="Flight number and date of the flight in question"
            hideLabel
          />
        </div>
      );
    case 4:
      return (
        <div className="space-y-6">
          <AdminWizardRadioGroup
            question="How should the payment be made?"
            options={["Refund back to credit card", "Credit note"]}
            defaultValue={0}
          />
          <AdminWizardField label="" placeholder="Refund amount" hideLabel />
        </div>
      );
    case 5:
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800">Summary</h3>
          <div className="space-y-3 text-base text-slate-700">
            <div className="flex gap-4">
              <span className="font-medium">Booking code:</span>
              <span>XYR9NF</span>
            </div>
            <div className="flex gap-4">
              <span className="font-medium">Tickets:</span>
            </div>
          </div>
          <AdminWizardField label="" as="textarea" placeholder="Message" rows={5} hideLabel />
        </div>
      );
    default:
      return null;
  }
}

export default function RefundStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = use(params);
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const currentStep = parseInt(step, 10);

  if (isNaN(currentStep) || currentStep < 1 || currentStep > refundSteps.length) {
    redirect("/admin/bookings/refund/1");
  }

  const isSuccess = submitted && currentStep === 5;

  return (
    <AdminWizardLayout
      title="Refund PNR: 28345"
      steps={refundSteps}
      currentStep={currentStep}
      basePath="/admin/bookings/refund"
      backHref="/admin/bookings"
      continueLabel={currentStep === 5 ? "Submit" : "Continue"}
      hideActions={isSuccess}
      onContinue={() => {
        if (currentStep === 5) {
          setSubmitted(true);
          return;
        }
        router.push(`/admin/bookings/refund/${currentStep + 1}`);
      }}
    >
      <RefundStepContent step={currentStep} submitted={submitted} />
    </AdminWizardLayout>
  );
}
