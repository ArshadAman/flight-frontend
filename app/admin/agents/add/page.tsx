"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

function Field({
  label,
  required,
  type = "text",
  dropdown,
  file,
  className,
}: {
  label: string;
  required?: boolean;
  type?: string;
  dropdown?: boolean;
  file?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label className="mb-1 block text-[11px] font-medium text-[#5b6b7c]">
        {label}
        {required && <span className="text-[#c61324]">*</span>}
      </label>
      {file ? (
        <div className="flex h-9 items-center gap-2 rounded border border-[#e8ebef] bg-white px-2">
          <button
            type="button"
            className="rounded bg-[#006aec] px-2.5 py-1 text-[10px] font-medium text-white"
          >
            Choose File
          </button>
          <span className="truncate text-[11px] text-slate-400">No file chosen</span>
        </div>
      ) : dropdown ? (
        <div className="relative">
          <select className="h-9 w-full appearance-none rounded border border-[#e8ebef] bg-white px-3 pr-8 text-sm text-[#1c304a]">
            <option value="">Select</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-slate-400" />
        </div>
      ) : (
        <Input type={type} className="h-9 border-[#e8ebef] text-sm" />
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[6px] border border-[#e8ebef] bg-white">
      <div className="border-b border-[#e8ebef] bg-[#f5f7fa] px-5 py-2.5">
        <h2 className="text-sm font-semibold text-[#1c304a]">{title}</h2>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

export default function AddAgentPage() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <AdminPageHeader title="Add Agent" showSearch={false} showFilter={false} />
      <div className="flex-1 space-y-5 p-6">
        <Section title="Agency Information">
          <Field label="Company Name" required />
          <Field label="Brand Name" required />
          <Field label="Register Address" required />
          <Field label="Operation Center" required />
          <Field label="Company Registrations No." required />
          <Field label="Vat No." required />
          <Field label="Mobile Number" required />
          <Field label="Office Number" />
          <Field label="Account Email" required type="email" />
          <Field label="Marketing Email" required type="email" />
          <Field label="Operational Email" required type="email" />
          <Field label="Login ID" required />
          <Field label="Class" required dropdown />
          <Field label="Currency" required dropdown />
          <Field label="Add Role (B2B/B2C)" required dropdown />
        </Section>

        <Section title="Tax Information">
          <Field label="Aadhar Number" required />
          <Field label="PAN Number" required />
          <Field label="PAN Name Holder" required />
          <Field label="Aadhar Document" file />
          <Field label="PAN Document" file />
        </Section>

        <Section title="Bank Details">
          <Field label="Bank Name" required />
          <Field label="Bank Account Number" required />
          <Field label="Account Number" required />
          <Field label="Branch Name" required />
          <Field label="IFSC Code" required />
          <Field label="Bank Document" file />
        </Section>

        <Section title="Contact Person Information">
          <Field label="Name" required />
          <Field label="Designation" required />
          <Field label="Email" required type="email" />
          <Field label="Mobile Number" />
          <Field label="City" required />
          <Field label="State" required dropdown />
          <Field label="Country" required dropdown />
          <Field label="Pincode" required />
          <Field label="Remark" required />
        </Section>

        <div className="flex justify-center pb-8 pt-2">
          <Button className="h-10 gap-1 bg-[#006aec] px-8 hover:bg-[#006aec]/90">
            <Plus className="h-4 w-4" />
            Add Person
          </Button>
        </div>
      </div>
    </div>
  );
}
