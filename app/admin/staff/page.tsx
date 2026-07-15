"use client";

import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { AdminDetailDrawer } from "@/components/admin/AdminDetailDrawer";
import { staffMembers } from "@/lib/admin/mock-data";
import { Info, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const staffRows = staffMembers.map((s, i) => ({
  ...s,
  staffId: String(23853 + i * 111),
  branchName: s.name.split(" ")[0],
  position: "----",
  department: "Header",
  dob: "31 Jan 1996",
  address: "M-122, Vinay Grah Nirman, Bhopal.",
  joiningDate: "22, Dec 2021 12:30 PM",
  joinBy: "Vicky Mehra (Department Name)",
}));

export default function StaffListPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = staffRows.find((s) => s.id === selectedId) ?? null;

  return (
    <>
      <AdminListPage
        title="Staff list"
        subtitle={`${staffRows.length} Staffs`}
        tabs={["All Staff", "Active", "Inactive"]}
        keyField="id"
        data={staffRows}
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
          { key: "name", header: "Staff Name" },
          { key: "branchName", header: "Branch Name" },
          { key: "department", header: "Department" },
          { key: "position", header: "Position" },
          {
            key: "departmentAccess",
            header: "Department Access",
            render: () => (
              <select
                className="h-8 rounded border border-[#e8ebef] px-2 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <option>Select</option>
              </select>
            ),
          },
          {
            key: "actions",
            header: "",
            render: (r) => (
              <div className="flex items-center gap-2 text-slate-400">
                <Info
                  className={cn(
                    "h-4 w-4",
                    selectedId === r.id ? "text-[#D60D26]" : "text-[#006aec]"
                  )}
                />
                <MoreVertical className="h-4 w-4" />
              </div>
            ),
          },
        ]}
      />

      <AdminDetailDrawer
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.staffId ?? ""}
        subtitle={selected?.name}
      >
        {selected && (
          <div>
            <p className="mb-4 border-b-2 border-[#D60D26] pb-1 text-sm font-semibold text-[#1c304a] inline-block">
              Info
            </p>
            <dl className="space-y-4">
              {[
                ["Date Of Birth", selected.dob],
                ["Department Name", selected.name],
                ["Branch Name", "-----"],
                ["Address", selected.address],
                ["Phone Number", selected.phone],
                ["Joining Date", selected.joiningDate],
                ["Email Address", selected.email],
                ["Staff Join By", selected.joinBy],
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
