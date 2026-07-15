"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WizardStep } from "@/lib/admin/wizard-configs";

export function AdminWizardStepper({
  steps,
  currentStep,
}: {
  steps: WizardStep[];
  currentStep: number;
  basePath?: string;
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
                  isActive || isComplete ? "text-slate-900" : "text-slate-500"
                )}
              >
                {step.label}
              </p>
              {step.subtitle && (isActive || isComplete) && (
                <p className="text-xs text-slate-500">{step.subtitle}</p>
              )}
            </div>
          );
        })}
      </div>
      <div
        className="mt-2 h-[3px] rounded-full bg-[#006aec] transition-all"
        style={{ width: `${(currentStep / steps.length) * 100}%`, maxWidth: "100%" }}
      />
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
  hideActions = false,
  contentClassName,
  continueClassName,
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
  hideActions?: boolean;
  contentClassName?: string;
  continueClassName?: string;
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
          <AdminWizardStepper steps={steps} currentStep={currentStep} basePath={basePath} />
          <div className={cn("mx-auto max-w-xl", contentClassName)}>{children}</div>
          {!hideActions && (
            <div className={cn("mx-auto mt-8 flex max-w-xl gap-3", contentClassName)}>
              {showBack && currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} className="rounded-full px-6">
                  Back
                </Button>
              )}
              <Button
                onClick={handleContinue}
                className={cn(
                  "rounded-full bg-[#006aec] px-8 hover:bg-[#006aec]/90",
                  continueClassName
                )}
              >
                {isLast ? continueLabel : continueLabel}
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
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
  variant = "default",
  hideLabel = false,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  as?: "input" | "textarea" | "select";
  rows?: number;
  variant?: "default" | "underline";
  hideLabel?: boolean;
}) {
  const underlineClass =
    "h-auto rounded-none border-0 border-b border-slate-400 bg-transparent px-0 py-3 text-lg shadow-none focus-visible:border-[#006aec] focus-visible:ring-0";

  return (
    <div className="space-y-2">
      {!hideLabel && label && (
        <label
          className={cn(
            "font-medium text-slate-800",
            variant === "underline" ? "text-base" : "text-xl"
          )}
        >
          {label}
        </label>
      )}
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
          className={cn(
            variant === "underline"
              ? underlineClass
              : "h-auto rounded-[10px] border-slate-400/50 px-6 py-5 text-lg"
          )}
        />
      )}
    </div>
  );
}

export function AdminWizardTicketSelection() {
  return (
    <div className="space-y-6">
      <p className="text-xl font-medium text-slate-800">Ticket selection:</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <AdminWizardField label="Ticket Number" variant="underline" placeholder="" />
        <AdminWizardField label="Ticket Name" variant="underline" placeholder="" />
        <AdminWizardField label="Ticket Number" variant="underline" placeholder="" />
        <AdminWizardField label="Ticket Number" variant="underline" placeholder="" />
      </div>
      <label className="flex cursor-pointer items-center gap-3 text-base text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-400" />
        The booking does not contain ticket numbers
      </label>
    </div>
  );
}

export function AdminWizardRadioGroup({
  question,
  options,
  defaultValue,
}: {
  question: string;
  options: string[];
  defaultValue?: number;
}) {
  return (
    <div className="space-y-5">
      <p className="text-xl font-medium text-slate-800">{question}</p>
      <div className="space-y-4">
        {options.map((option, index) => (
          <label key={option} className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="wizard-radio"
              defaultChecked={defaultValue === index}
              className="mt-1 h-4 w-4 border-slate-400 text-[#006aec]"
            />
            <span className="text-base text-slate-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function AdminWizardCheckboxGroup({
  label,
  options,
  defaultChecked,
}: {
  label?: string;
  options: string[];
  defaultChecked?: number[];
}) {
  return (
    <div className="space-y-4">
      {label && <p className="text-base font-medium text-slate-800">{label}</p>}
      <div className="space-y-3">
        {options.map((option, index) => (
          <label key={option} className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              defaultChecked={defaultChecked?.includes(index)}
              className="h-4 w-4 rounded border-slate-400"
            />
            <span className="text-base text-slate-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function AdminWizardFeesBox() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-bold text-slate-800">Fees</h3>
      <div className="space-y-3 text-base text-slate-700">
        <div className="flex justify-between">
          <span>Expected costs</span>
          <span>?</span>
        </div>
        <div className="flex justify-between">
          <span>Consolidator fee</span>
          <span>?</span>
        </div>
        <div className="border-t border-slate-200 pt-3">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>?</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminWizardSuccess({
  title,
  message,
  linkLabel,
  linkHref,
}: {
  title: string;
  message: React.ReactNode;
  linkLabel: string;
  linkHref: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-5 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
          <Check className="h-5 w-5 text-white" />
        </div>
        <p className="text-lg font-bold text-emerald-700">{title}</p>
      </div>
      <div className="space-y-3 text-base leading-relaxed text-slate-700">{message}</div>
      <Link
        href={linkHref}
        className="inline-flex items-center gap-1 text-[#006aec] hover:underline"
      >
        {linkLabel}
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
