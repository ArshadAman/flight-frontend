"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminProfileLayout,
  AdminProfileFields,
} from "@/components/admin/AdminProfileLayout";
import { agents } from "@/lib/admin/mock-data";
import {
  agentApiProfileTabs,
  agencyInformationFields,
  taxInformationFields,
  bankDetailsFields,
  contactPersonFields,
} from "@/lib/admin/figma-fields";
import { Button } from "@/components/ui/button";

export default function AgentApiProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const agent = agents.find((a) => a.id === id);
  if (!agent) notFound();

  const first = agent.name.split(" ")[0].toUpperCase();

  const agencyValues: Record<string, string> = {
    AgentID: "———",
    AgentName: "———",
    "Company Name": "———",
    "Brand Name": "———",
    "Register Address": "———",
    "Operation Center": "———",
    "Company Reg. No.": "———",
    "Vat no.": "———",
    "Mobile No. / office No.": "———",
    "Account Email": "———",
    "Marketing Email": "———",
    "Operational Email": "———",
    "Login Id": "———",
    Class: "———",
    Currency: "———",
    "Add Role": "———",
  };

  return (
    <AdminProfileLayout
      title={`${first}_Profile`}
      tabs={[...agentApiProfileTabs]}
      backHref="/admin/api/agent"
      action={
        <Button size="sm" className="h-9 bg-[#006aec] hover:bg-[#006aec]/90" asChild>
          <Link href={`/admin/api/agent/${id}/generated`}>View Generated API</Link>
        </Button>
      }
    >
      {(activeTab) => {
        if (activeTab === "Agency Information") {
          return (
            <AdminProfileFields
              fields={["AgentID", ...agencyInformationFields]}
              values={agencyValues}
            />
          );
        }
        if (activeTab === "Product") {
          return (
            <AdminProfileFields
              fields={["B2B API", "B2B", "B2C"]}
              actions={{
                "B2B API": { label: "Activate", variant: "activate" },
                B2B: { label: "Disable", variant: "disable" },
                B2C: { label: "Disable", variant: "disable" },
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
                "PAN Name Holder": "Harshit Chirgania",
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
