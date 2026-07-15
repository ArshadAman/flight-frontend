"use client";

import { useMemo, useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { AdminDetailDrawer } from "@/components/admin/AdminDetailDrawer";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { queries } from "@/lib/admin/mock-data";
import { Code2, Info, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminStatus } from "@/lib/admin/types";

const queryRows = queries.map((q, i) => ({
  ...q,
  queryId: String(23853 + i * 111),
  pnr: "A814Q",
  ticket: String(23853 + i * 111),
  createdBy: q.assignee,
  depName: "Dep. Name",
  createdDate: "22, Dec 2021",
  createdTime: "12:30 PM",
  assignTo: `Staff 0${123 + i}`,
  assignName: "Vicky Mehra",
  queryStatus: (["denied", "closed", "approved"] as AdminStatus[])[i % 3],
  statusLabel: ["Unsolved", "Not assigned", "Solved"][i % 3],
  subjectType: "4 Days",
  descriptions: i % 2 === 0 ? "Error in passport Name" : "----",
}));

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative min-w-[160px] flex-1 rounded-lg border border-[#e8ebef] bg-white px-5 py-4">
      <Code2 className="absolute right-3 top-3 h-4 w-4 text-slate-300" />
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#1c304a]">
        {value} <span className="text-sm font-normal text-slate-400">Today</span>
      </p>
    </div>
  );
}

export default function QueriesPage() {
  const [activeTab, setActiveTab] = useState("Flight Queries");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = queryRows.find((q) => q.id === selectedId) ?? null;

  const columns = useMemo(() => {
    const base = [
      {
        key: "select",
        header: "",
        render: () => (
          <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
        ),
      },
      { key: "queryId", header: "Query Id" },
      ...(activeTab === "Flight Queries"
        ? [
            { key: "pnr", header: "PNR" },
            { key: "ticket", header: "Ticket" },
          ]
        : []),
      {
        key: "createdBy",
        header: "Created By",
        render: (r: (typeof queryRows)[0]) => (
          <div>
            <p className="text-sm">{String(r.createdBy)}</p>
            <p className="text-xs text-slate-400">{String(r.depName)}</p>
          </div>
        ),
      },
      {
        key: "createdDate",
        header: activeTab === "Flight Queries" ? "Created Date" : "Date",
        render: (r: (typeof queryRows)[0]) => (
          <div>
            <p className="text-sm">{String(r.createdDate)}</p>
            <p className="text-xs text-slate-400">{String(r.createdTime)}</p>
          </div>
        ),
      },
      {
        key: "assignTo",
        header: "Assign To",
        render: (r: (typeof queryRows)[0]) => (
          <select
            className="h-8 rounded border border-[#e8ebef] px-2 text-xs"
            defaultValue={String(r.assignTo)}
            onClick={(e) => e.stopPropagation()}
          >
            <option>{String(r.assignTo)}</option>
            <option>Label</option>
          </select>
        ),
      },
      {
        key: "queryStatus",
        header: "Status",
        render: (r: (typeof queryRows)[0]) => (
          <AdminBadge status={r.queryStatus as AdminStatus} label={String(r.statusLabel)} />
        ),
      },
      {
        key: "subjectType",
        header: "Subject/type",
        render: () => (
          <select className="h-8 rounded border border-[#e8ebef] px-2 text-xs" onClick={(e) => e.stopPropagation()}>
            <option>Select</option>
          </select>
        ),
      },
      { key: "descriptions", header: "Descriptions" },
      {
        key: "actions",
        header: "",
        render: (r: (typeof queryRows)[0]) => (
          <div className="flex items-center gap-1">
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
    ];
    return base;
  }, [activeTab, selectedId]);

  return (
    <>
      <AdminListPage
        title="Queries"
        subtitle={`${queryRows.length} Queries`}
        tabs={["Flight Queries", "Other Queries"]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        keyField="id"
        data={queryRows}
        selectedKey={selectedId}
        onRowClick={(row) => setSelectedId(String(row.id))}
        metrics={
          <div className="flex flex-wrap gap-4">
            <MetricCard label="Total Queries" value="42" />
            <MetricCard label="Solved" value="23" />
            <MetricCard label="Pending" value="12" />
            <MetricCard label="Not Assigned" value="08" />
          </div>
        }
        columns={columns}
      />

      <AdminDetailDrawer
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.queryId ?? ""}
        subtitle={selected?.statusLabel}
      >
        {selected && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <AdminBadge
                status={selected.queryStatus as AdminStatus}
                label={String(selected.statusLabel)}
              />
            </div>
            <p className="mb-4 inline-block border-b-2 border-[#D60D26] pb-1 text-sm font-semibold text-[#1c304a]">
              Info
            </p>
            <dl className="space-y-4">
              {[
                ["PNR", selected.pnr],
                ["Tickets Number", selected.ticket],
                ["Created By", `${selected.createdBy}\nDepartment Name`],
                ["Created Date", `${selected.createdDate}\n${selected.createdTime}`],
                ["Assign To", `${selected.assignName}\nDepartment Name`],
                ["Subject / Type", selected.subjectType],
                ["Descriptions", selected.descriptions],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd className="mt-0.5 whitespace-pre-line text-sm font-medium text-[#1c304a]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </AdminDetailDrawer>
    </>
  );
}
