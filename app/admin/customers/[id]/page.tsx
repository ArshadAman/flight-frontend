"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import {
  AdminProfileLayout,
  AdminProfileFields,
} from "@/components/admin/AdminProfileLayout";
import { customers } from "@/lib/admin/mock-data";
import {
  agentApiProfileTabs,
  taxInformationFields,
  bankDetailsFields,
  contactPersonFields,
} from "@/lib/admin/figma-fields";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const customer = customers.find((c) => c.id === id);
  if (!customer) notFound();

  const first = customer.name.split(" ")[0].toUpperCase();

  const agencyValues: Record<string, string> = {
    AgentID: customer.id,
    AgentName: customer.name,
    "Company Name": "Wordlight",
    "Brand Name": customer.name,
    "Register Address": "———",
    "Operation Center": "———",
    "Company Reg. No.": "———",
    "Vat no.": "———",
    "Mobile No. / office No.": customer.phone,
    "Account Email": customer.email,
    "Marketing Email": customer.email,
    "Operational Email": customer.email,
    "Login Id": customer.email,
    Class: "B2C",
    Currency: "INR",
    "Add Role": "Customer",
  };

  return (
    <AdminProfileLayout
      title={`${first}_Profile`}
      tabs={[...agentApiProfileTabs]}
      backHref="/admin/api/customer"
    >
      {(activeTab) => {
        if (activeTab === "Agency Information") {
          return (
            <AdminProfileFields
              fields={["AgentID", "AgentName", "Company Name", "Brand Name", "Register Address", "Operation Center", "Company Reg. No.", "Vat no.", "Mobile No. / office No.", "Account Email", "Marketing Email", "Operational Email", "Login Id", "Class", "Currency", "Add Role"]}
              values={agencyValues}
            />
          );
        }
        if (activeTab === "Product") {
          return (
            <AdminProfileFields
              fields={["B2B API", "B2B", "B2C"]}
              actions={{
                "B2B API": { label: customer.apiAccess ? "Active" : "Activate", variant: "activate" },
                B2B: { label: "Disable", variant: "disable" },
                B2C: { label: customer.apiAccess ? "Active" : "Disable", variant: customer.apiAccess ? "activate" : "disable" },
              }}
            />
          );
        }
        if (activeTab === "Tax Information") {
          return (
            <AdminProfileFields
              fields={[...taxInformationFields]}
              values={{
                "Aadhar Number": "165467812712",
                "PAN Number": "0000-0000-0000",
                "PAN Name Holder": customer.name,
              }}
              fileFields={["Aadhar Documents", "PAN Documents"]}
            />
          );
        }
        if (activeTab === "Bank Details") {
          return (
            <AdminProfileFields
              fields={[...bankDetailsFields]}
              fileFields={["Bank Documents"]}
            />
          );
        }
        return (
          <AdminProfileFields
            fields={[...contactPersonFields]}
            values={Object.fromEntries(contactPersonFields.map((f) => [f, "———"]))}
          />
        );
      }}
    </AdminProfileLayout>
  );
}
