"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminFieldSection } from "@/components/admin/AdminFieldSection";
import { contactPersonFields } from "@/lib/admin/figma-fields";
import { Button } from "@/components/ui/button";

const customerFields = [
  "Name",
  "Email Address",
  "Mobile Number",
  "City",
  "State",
  "Country",
  "Pincode",
  "Remark",
] as const;

export default function AddCustomerPage() {
  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader title="Add Customer" showSearch={false} showFilter={false} />
      <div className="flex-1 space-y-5 p-6">
        <AdminFieldSection title="Customer Information" fields={customerFields} />
        <AdminFieldSection
          title="Contact Person Information"
          fields={contactPersonFields.filter((f) =>
            ["Name", "Designation", "Email Address", "Mobile Number"].includes(f)
          )}
        />
        <div className="flex gap-3 pb-8">
          <Button className="bg-[#006aec] hover:bg-[#006aec]/90">Submit</Button>
          <Link href="/admin/customers">
            <Button variant="outline" className="border-[#006aec] text-[#006aec]">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
