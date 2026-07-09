"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import {
  AdminProfileLayout,
  AdminProfileFields,
} from "@/components/admin/AdminProfileLayout";
import { agents } from "@/lib/admin/mock-data";
import { agentApiProfileTabs } from "@/lib/admin/wizard-configs";
import { Button } from "@/components/ui/button";

const profileData: Record<string, string> = {
  AgentID: "AGT-001",
  AgentName: "AJAY_Profile",
  "Company Name": "Ajay Travels Pvt Ltd",
  "Brand Name": "Ajay Travels",
  "Register Address": "123 MG Road, Delhi",
  "Operation Center": "Delhi NCR",
  "Company Reg. No.": "U63000DL2020PTC123456",
  "Vat no.": "07AABCA1234A1Z5",
  "Mobile No. / office No.": "+91 98765 43210",
  "Account Email": "accounts@ajaytravels.com",
  "Marketing Email": "marketing@ajaytravels.com",
  "Operational Email": "ops@ajaytravels.com",
  "Login Id": "ajay_travels",
  Class: "Premium",
  Currency: "INR",
  "Add Role": "B2B Agent",
};

export default function AgentApiProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const agent = agents.find((a) => a.id === id);

  if (!agent) notFound();

  return (
    <AdminProfileLayout
      title={`${agent.name.replace(/\s/g, "_")}_Profile`}
      tabs={[...agentApiProfileTabs]}
      backHref="/admin/api/agent"
      action={
        <Button size="sm" className="h-9">
          Save Changes
        </Button>
      }
    >
      {(activeTab) => {
        if (activeTab === "Agency Information") {
          return <AdminProfileFields fields={Object.keys(profileData)} values={profileData} />;
        }
        if (activeTab === "Product") {
          return (
            <AdminProfileFields
              fields={["GDS Access", "Inventory Type", "Domestic", "International", "API Enabled"]}
              values={{
                "GDS Access": "Amadeus, Sabre",
                "Inventory Type": "Published",
                Domestic: "Yes",
                International: "Yes",
                "API Enabled": "Yes",
              }}
            />
          );
        }
        if (activeTab === "Tax Information") {
          return (
            <AdminProfileFields
              fields={["GST Number", "PAN", "TDS Applicable", "Tax Category"]}
              values={{
                "GST Number": "07AABCA1234A1Z5",
                PAN: "AABCA1234A",
                "TDS Applicable": "Yes",
                "Tax Category": "B2B",
              }}
            />
          );
        }
        if (activeTab === "Bank Details") {
          return (
            <AdminProfileFields
              fields={["Bank Name", "Account Number", "IFSC", "Account Holder"]}
              values={{
                "Bank Name": "HDFC Bank",
                "Account Number": "****4567",
                IFSC: "HDFC0001234",
                "Account Holder": "Ajay Travels Pvt Ltd",
              }}
            />
          );
        }
        return (
          <AdminProfileFields
            fields={["Contact Name", "Designation", "Phone", "Email", "Alternate Phone"]}
            values={{
              "Contact Name": "Ajay Kumar",
              Designation: "Director",
              Phone: agent.phone,
              Email: agent.email,
              "Alternate Phone": "+91 98765 00000",
            }}
          />
        );
      }}
    </AdminProfileLayout>
  );
}
