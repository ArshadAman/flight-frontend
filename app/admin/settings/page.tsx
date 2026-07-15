"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "General",
    fields: [
      { label: "Platform Name", value: "My Travel Deal" },
      { label: "Support Email", value: "support@mytraveldeal.com" },
      { label: "Default Currency", value: "INR" },
    ],
  },
  {
    title: "API",
    fields: [
      { label: "API Rate Limit (req/min)", value: "1000" },
      { label: "Webhook URL", value: "" },
    ],
  },
  {
    title: "Branding",
    fields: [
      { label: "Primary Brand Color", value: "#D60D26" },
      { label: "Workspace Name", value: "Demo_workspace" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader title="Setting" showSearch={false} showFilter={false} />
      <div className="flex-1 space-y-6 p-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-[10px] border border-[#e8ebef] bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 border-b border-[#e8ebef] pb-2 text-sm font-semibold text-[#1c304a]">
              {section.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div key={field.label}>
                  <label className="mb-1 block text-xs font-medium text-[rgba(27,43,65,0.72)]">
                    {field.label}:
                  </label>
                  <Input className="h-9 border-[#e8ebef]" defaultValue={field.value} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button className="bg-[#006aec] hover:bg-[#006aec]/90">Save</Button>
      </div>
    </div>
  );
}
