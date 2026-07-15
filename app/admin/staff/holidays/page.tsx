"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminDetailDrawer } from "@/components/admin/AdminDetailDrawer";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { Button } from "@/components/ui/button";
import { Code2, Info, MoreVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminStatus } from "@/lib/admin/types";

const leaveRows = Array.from({ length: 9 }, (_, i) => ({
  id: `LV-${String(i + 1).padStart(3, "0")}`,
  staffId: String(23853 + i * 111).slice(0, 5),
  staff: ["Ajay Mehra", "Vaibhav Gour", "Rahul Meena", "Kusum Meena", "Riya Roy"][i % 5],
  type: ["Annual Leave", "Sick Leave", "Casual Leave"][i % 3],
  from: "22, Dec 2021 12:30 PM",
  to: "24, Dec 2021 12:30 PM",
  days: 2,
  status: (["denied", "pending", "approved"] as AdminStatus[])[i % 3],
  statusLabel: ["Rejected", "Pending", "Approved"][i % 3],
  chargeOfStaff: "Vicky Mehra",
  department: "Department Name",
  totalAnnual: 26,
  available: 21,
}));

const holidayRows = Array.from({ length: 24 }, (_, i) => ({
  id: String(23853 + i * 111).slice(0, 5),
  name: "Diwali Holidays",
  from: "22, Dec 2021 12:30 PM",
  to: "22, Dec 2021 12:30 PM",
  days: 2,
}));

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="relative min-w-[180px] rounded-lg border border-[#e8ebef] bg-white px-5 py-4">
      <Code2 className="absolute right-3 top-3 h-4 w-4 text-slate-300" />
      <p className="text-xs text-slate-500">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-[#1c304a]">{value}</p>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
    </div>
  );
}

export default function StaffHolidaysPage() {
  const [activeTab, setActiveTab] = useState("Staff Leaves");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = leaveRows.find((r) => r.id === selectedId) ?? null;
  const isHolidaysTab = activeTab === "Holidays";

  return (
    <>
      <div className="flex min-h-full flex-col">
        <AdminPageHeader
          title="Holidays & Leaves"
          subtitle={isHolidaysTab ? `${holidayRows.length} Holidays` : `${leaveRows.length} Leaves`}
          tabs={["Staff Leaves", "Holidays"]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          action={
            isHolidaysTab ? (
              <Button size="sm" className="h-9 gap-1 bg-[#006aec] hover:bg-[#006aec]/90">
                <Plus className="h-4 w-4" />
                Add Holiday
              </Button>
            ) : (
              <Button size="sm" className="h-9 gap-1 bg-[#006aec] hover:bg-[#006aec]/90">
                <Plus className="h-4 w-4" />
                Apply Leave
              </Button>
            )
          }
        />
        <div className="flex-1 p-6">
          <div className="mb-4 flex flex-wrap gap-4">
            {isHolidaysTab ? (
              <>
                <MetricCard label="Total Holidays" value="24" hint="per years" />
                <MetricCard label="Remaining Holidays" value="19" hint="per years" />
              </>
            ) : (
              <>
                <MetricCard label="Total Present" value="10/12" />
                <MetricCard label="Total Leaves" value="0" hint="Today" />
                <MetricCard label="Pending" value="0" />
              </>
            )}
          </div>

          {isHolidaysTab ? (
            <AdminDataTable
              keyField="id"
              data={holidayRows}
              columns={[
                {
                  key: "select",
                  header: "",
                  render: () => (
                    <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
                  ),
                },
                { key: "id", header: "Id" },
                { key: "name", header: "Holiday Name" },
                { key: "from", header: "From" },
                { key: "to", header: "To" },
                {
                  key: "days",
                  header: "No. Of Days",
                  render: (r) => (
                    <span className="rounded bg-[#D60D26] px-2 py-0.5 text-[10px] font-medium text-white">
                      {String(r.days)} Days
                    </span>
                  ),
                },
                {
                  key: "actions",
                  header: "",
                  render: () => (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Info className="h-4 w-4" />
                      <MoreVertical className="h-4 w-4" />
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <AdminDataTable
              keyField="id"
              data={leaveRows}
              selectedKey={selectedId}
              onRowClick={(row) => setSelectedId(String(row.id))}
              columns={[
                {
                  key: "select",
                  header: "",
                  render: () => (
                    <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
                  ),
                },
                { key: "staffId", header: "Staff Id" },
                { key: "staff", header: "Staff Name" },
                { key: "type", header: "Leave Type" },
                { key: "from", header: "From" },
                { key: "to", header: "To" },
                {
                  key: "days",
                  header: "Days",
                  render: (r) => (
                    <span className="rounded bg-[#D60D26] px-2 py-0.5 text-[10px] font-medium text-white">
                      {String(r.days)} Days
                    </span>
                  ),
                },
                {
                  key: "status",
                  header: "Action",
                  render: (r) => (
                    <AdminBadge status={r.status as AdminStatus} label={String(r.statusLabel)} />
                  ),
                },
                {
                  key: "icons",
                  header: "",
                  render: (r) => (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Info
                        className={cn(
                          "h-4 w-4",
                          selectedId === r.id ? "text-[#D60D26]" : "text-slate-400"
                        )}
                      />
                      <MoreVertical className="h-4 w-4" />
                    </div>
                  ),
                },
              ]}
            />
          )}
        </div>
      </div>

      <AdminDetailDrawer
        open={!!selected && !isHolidaysTab}
        onClose={() => setSelectedId(null)}
        title={selected?.staffId ?? ""}
        subtitle={selected?.staff}
      >
        {selected && (
          <div>
            <p className="mb-4 inline-block border-b-2 border-[#D60D26] pb-1 text-sm font-semibold text-[#1c304a]">
              Info
            </p>
            <dl className="space-y-4">
              {[
                ["Leave Type", selected.type],
                ["From Date", selected.from],
                ["To Date", selected.to],
                ["No of Days Leaves", `${selected.days} Days`],
                ["Total Annual Leaves", `${selected.totalAnnual} Days`],
                ["Available Leaves", `${selected.available} Days`],
                ["Charge Of Staff", selected.chargeOfStaff],
                ["Department Name", selected.department],
                ["Status", selected.statusLabel],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#1c304a]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </AdminDetailDrawer>
    </>
  );
}
