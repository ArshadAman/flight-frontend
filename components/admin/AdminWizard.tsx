"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WizardStep } from "@/lib/admin/wizard-configs";

export function AdminWizardStepper({
  steps,
  currentStep,
  basePath,
}: {
  steps: WizardStep[];
  currentStep: number;
  basePath: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep;
          return (
            <div key={step.id} className="flex min-w-[100px] flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className={cn(
                      "h-[3px] flex-1 rounded-full",
                      isComplete || isActive ? "bg-[#006aec]" : "bg-slate-200"
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold",
                    isActive
                      ? "bg-[#006aec] text-white"
                      : isComplete
                        ? "bg-[#006aec]/20 text-[#006aec]"
                        : "bg-slate-100 text-slate-400"
                  )}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-[3px] flex-1 rounded-full",
                      isComplete ? "bg-[#006aec]" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
              <p
                className={cn(
                  "mt-2 text-center text-sm font-bold",
                  isActive ? "text-slate-900" : "text-slate-500"
                )}
              >
                {step.label}
              </p>
              {step.subtitle && isActive && (
                <p className="text-xs text-slate-500">{step.subtitle}</p>
              )}
            </div>
          );
        })}
      </div>
      {currentStep === 1 && steps[0]?.subtitle && (
        <div className="mt-2 h-[3px] w-[200px] rounded-full bg-[#006aec]" />
      )}
    </div>
  );
}

export function AdminWizardLayout({
  title,
  steps,
  currentStep,
  basePath,
  backHref,
  children,
  onContinue,
  continueLabel = "Continue",
  showBack = true,
}: {
  title: string;
  steps: WizardStep[];
  currentStep: number;
  basePath: string;
  backHref: string;
  children: React.ReactNode;
  onContinue?: () => void;
  continueLabel?: string;
  showBack?: boolean;
}) {
  const router = useRouter();
  const isLast = currentStep >= steps.length;

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
      return;
    }
    if (isLast) {
      router.push(backHref);
      return;
    }
    router.push(`${basePath}/${currentStep + 1}`);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      router.push(`${basePath}/${currentStep - 1}`);
    } else {
      router.push(backHref);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="rounded-tl-[30px] rounded-tr-[50px] bg-[#f2fbff] p-8 md:p-10">
          <AdminWizardStepper
            steps={steps}
            currentStep={currentStep}
            basePath={basePath}
          />
          <div className="mx-auto max-w-xl">{children}</div>
          <div className="mx-auto mt-8 flex max-w-xl gap-3">
            {showBack && currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} className="rounded-full px-6">
                Back
              </Button>
            )}
            <Button
              onClick={handleContinue}
              className="rounded-full bg-[#006aec] px-8 hover:bg-[#006aec]/90"
            >
              {isLast ? "Submit" : continueLabel}
              {!isLast && <ArrowUpRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminWizardField({
  label,
  placeholder,
  type = "text",
  as = "input",
  rows = 4,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  as?: "input" | "textarea" | "select";
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xl font-medium text-slate-800">{label}</label>
      {as === "textarea" ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-[10px] border border-slate-400/50 bg-white px-6 py-5 text-lg outline-none focus:border-[#006aec] focus:ring-2 focus:ring-[#006aec]/20"
        />
      ) : as === "select" ? (
        <select className="w-full rounded-[10px] border border-slate-400/50 bg-white px-6 py-5 text-lg outline-none focus:border-[#006aec]">
          <option>{placeholder ?? "Select..."}</option>
        </select>
      ) : (
        <Input
          type={type}
          placeholder={placeholder}
          className="h-auto rounded-[10px] border-slate-400/50 px-6 py-5 text-lg"
        />
      )}
    </div>
  );
}
