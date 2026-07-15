"use client";

import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { AdminDetailDrawer } from "@/components/admin/AdminDetailDrawer";
import { Code2, Info, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const agentNames = [
  "Ajay",
  "Vaibhav Gour",
  "Rahul Meena",
  "Kusum Meena",
  "Riya Roy",
  "Vaibhav Raj",
  "Rajat Singh",
  "Lokesh Gidwani",
  "Harshit Chirgania",
];

const rows = Array.from({ length: 19 }, (_, i) => ({
  id: String(23853 + i * 111).slice(0, 5),
  agent: agentNames[i % agentNames.length],
  setBy: "Rahul Mehto",
  currentLimit: 45000,
  newLimit: 50000,
  usedLimit: 23120,
  remaining: 23120,
  setDate: "22, Dec 2021, 12:30 PM",
  setUserId: "A12342",
  setUserName: "Rahul Mehto",
  approvedBy: "Vicky Mehra",
}));

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative min-w-[200px] rounded-lg border border-[#e8ebef] bg-white px-5 py-4">
      <Code2 className="absolute right-3 top-3 h-4 w-4 text-slate-300" />
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#1c304a]">{value}</p>
    </div>
  );
}

export default function SetLimitPage() {
  const [selectedId, setSelectedId] = useState<string | null>(rows[0]?.id ?? null);
  const selected = rows.find((r) => r.id === selectedId) ?? null;

  return (
    <>
      <AdminListPage
        title="Set Limit"
        subtitle={`${rows.length} Agents`}
        keyField="id"
        data={rows}
        selectedKey={selectedId}
        onRowClick={(row) => setSelectedId(String(row.id))}
        metrics={
          <div className="flex flex-wrap gap-4">
            <MetricCard label="Total Current Limit" value="₹45k" />
            <MetricCard label="Total Used Limit" value="₹32k" />
          </div>
        }
        columns={[
          {
            key: "select",
            header: "",
            render: () => (
              <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
            ),
          },
          { key: "id", header: "Agent Id" },
          { key: "agent", header: "Agent Name" },
          { key: "setBy", header: "Set By" },
          {
            key: "currentLimit",
            header: "Current Limit",
            render: (r) => `₹${Number(r.currentLimit).toLocaleString("en-IN")}`,
          },
          {
            key: "newLimit",
            header: "New Limit",
            render: (r) => `₹${Number(r.newLimit).toLocaleString("en-IN")}`,
          },
          {
            key: "actions",
            header: "",
            render: (r) => (
              <div className="flex items-center gap-2">
                <Info
                  className={cn(
                    "h-4 w-4",
                    selectedId === r.id ? "text-[#D60D26]" : "text-slate-400"
                  )}
                />
                <MoreVertical className="h-4 w-4 text-slate-400" />
              </div>
            ),
          },
        ]}
      />

      <AdminDetailDrawer
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title=""
        subtitle=""
      >
        {selected && (
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-[#e8ebef] pb-4">
              <div className="flex flex-1 flex-col items-center">
                <p className="text-lg font-bold text-[#1c304a]">₹45k</p>
                <p className="text-xs text-slate-400">Current Limit</p>
              </div>
              <div className="h-10 w-px bg-[#e8ebef]" />
              <div className="flex flex-1 flex-col items-center">
                <p className="text-lg font-bold text-[#1c304a]">₹23k</p>
                <p className="text-xs text-slate-400">Used Limit</p>
              </div>
            </div>
            <p className="mb-4 inline-block border-b-2 border-[#D60D26] pb-1 text-sm font-semibold text-[#1c304a]">
              Info
            </p>
            <dl className="space-y-4">
              {[
                ["Agent ID", selected.id],
                ["Agent Name", `${selected.agent} Kumar`],
                ["Current Limit", `₹${selected.currentLimit.toLocaleString("en-IN")}`],
                ["Remaining", `₹${selected.remaining.toLocaleString("en-IN")}`],
                ["New Limit", `₹${selected.newLimit.toLocaleString("en-IN")}`],
                ["Set Date", selected.setDate],
                ["Set Limit User ID", selected.setUserId],
                ["Set Limit User Name", selected.setUserName],
                ["Limit Approved By", selected.approvedBy],
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
