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
import { specialRequestSteps } from "@/lib/admin/wizard-configs";

function SpecialRequestStepContent({
  step,
  submitted,
}: {
  step: number;
  submitted: boolean;
}) {
  if (submitted && step === 5) {
    return (
      <AdminWizardSuccess
        title="Special request submitted"
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
        linkLabel="Submit Another Booking For Request"
        linkHref="/admin/bookings/special-request/1"
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
            question="What is the Special Request?"
            options={[
              "Medical Problem",
              "Food Changes",
              "Wheel Chair",
              "Pet Permission",
              "Dead Body",
            ]}
            defaultValue={0}
          />
          <AdminWizardField
            label=""
            as="textarea"
            placeholder="Flight number and date of the flight in question"
            rows={4}
            hideLabel
          />
        </div>
      );
    case 4:
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800">Payment</h3>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-400" />
            <span className="text-base text-slate-700">
              Please Confirm the request and pay the extra fee
            </span>
          </label>
          <AdminWizardFeesBox />
          <AdminWizardCheckboxGroup
            label="Who should receive messages related to this request?"
            options={["booking@mytraveldeal.co.uk", "admin@mytraveldeal.co.uk"]}
            defaultChecked={[0, 1]}
          />
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

export default function SpecialRequestStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = use(params);
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const currentStep = parseInt(step, 10);

  if (
    isNaN(currentStep) ||
    currentStep < 1 ||
    currentStep > specialRequestSteps.length
  ) {
    redirect("/admin/bookings/special-request/1");
  }

  const isSuccess = submitted && currentStep === 5;

  return (
    <AdminWizardLayout
      title="Special Request PNR: 28345"
      steps={specialRequestSteps}
      currentStep={currentStep}
      basePath="/admin/bookings/special-request"
      backHref="/admin/bookings"
      continueLabel={currentStep === 5 ? "Submit" : "Continue"}
      hideActions={isSuccess}
      onContinue={() => {
        if (currentStep === 5) {
          setSubmitted(true);
          return;
        }
        router.push(`/admin/bookings/special-request/${currentStep + 1}`);
      }}
    >
      <SpecialRequestStepContent step={currentStep} submitted={submitted} />
    </AdminWizardLayout>
  );
}
