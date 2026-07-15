"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { SupplierActionModal } from "@/components/admin/modals/SupplierActionModal";
import { SendNotificationModal } from "@/components/admin/modals/SendNotificationModal";
import { apiIntegrations } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Info, MoreVertical, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminStatus } from "@/lib/admin/types";

const actionRows = apiIntegrations.map((a, i) => ({
  id: String(23853 + i * 137),
  supplierName: a.name.includes(" ") ? a.name.split(" ")[0] : a.name,
  agencyName: a.name,
  apiKey: "#1212VC",
  lastUpdate: "22, Dec 2021 12:30 PM",
  status: a.status,
  name: a.name,
}));

const requestRows = apiIntegrations.map((_, i) => ({
  id: String(23853 + i * 111),
  grpPnrs: String(3 + i),
  airline: "AIR INDIA",
  flightNo: "AI121",
  oldDate: "22, Dec 2021",
  oldTime: "12:30 PM",
  newDate: "23, Dec 2021",
  newTime: "02:15 PM",
  originCity: "New Delhi",
  originCode: "DEL",
  destCity: "Mumbai",
  destCode: "BOM",
  status: (["denied", "pending", "approved"] as AdminStatus[])[i % 3],
  statusLabel: ["Rejected", "Pending", "Approved"][i % 3],
}));

const subTabs = ["Schedule", "Flight No.", "Date"];

export default function ManagedApiPage() {
  const [mainTab, setMainTab] = useState("Suppliers Action");
  const [subTab, setSubTab] = useState("Schedule");
  const [actionOpen, setActionOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [menuRow, setMenuRow] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string>();

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="Supplier Manage APIs"
        subtitle={
          mainTab === "Managed Request"
            ? `${requestRows.length} Requests`
            : `${actionRows.length} Supplier`
        }
        tabs={["Suppliers Action", "Managed Request"]}
        activeTab={mainTab}
        onTabChange={setMainTab}
      />

      <div className="flex-1 space-y-4 p-6">
        {mainTab === "Managed Request" ? (
          <>
            <div className="flex gap-6 border-b border-[#e8ebef]">
              {subTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSubTab(tab)}
                  className={cn(
                    "relative pb-2 text-sm font-medium",
                    subTab === tab
                      ? "text-[#006aec] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#006aec]"
                      : "text-slate-400"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <AdminDataTable
              keyField="id"
              data={requestRows}
              columns={[
                {
                  key: "select",
                  header: "",
                  render: () => <input type="checkbox" className="rounded border-slate-300" />,
                },
                { key: "id", header: "Supplier ID" },
                { key: "grpPnrs", header: "Grp. PNRs" },
                { key: "airline", header: "Airline Name" },
                {
                  key: "flightNo",
                  header: "Flight No.",
                  render: (r) => <span className="text-[#006aec]">{String(r.flightNo)}</span>,
                },
                {
                  key: "oldTime",
                  header: "Old Flight Time",
                  render: (r) => (
                    <div>
                      <p className="text-sm">{String(r.oldDate)}</p>
                      <p className="text-xs text-[#006aec]">{String(r.oldTime)}</p>
                    </div>
                  ),
                },
                {
                  key: "newTime",
                  header: "New Flight Time",
                  render: (r) => (
                    <div>
                      <p className="text-sm">{String(r.newDate)}</p>
                      <p className="text-xs text-[#006aec]">{String(r.newTime)}</p>
                    </div>
                  ),
                },
                {
                  key: "origin",
                  header: "Origin",
                  render: (r) => (
                    <div>
                      <p className="text-sm">{String(r.originCity)}</p>
                      <p className="text-sm font-bold">{String(r.originCode)}</p>
                    </div>
                  ),
                },
                {
                  key: "destination",
                  header: "Destination",
                  render: (r) => (
                    <div>
                      <p className="text-sm">{String(r.destCity)}</p>
                      <p className="text-sm font-bold">{String(r.destCode)}</p>
                    </div>
                  ),
                },
                {
                  key: "action",
                  header: "Action",
                  render: (r) => (
                    <AdminBadge status={r.status as AdminStatus} label={String(r.statusLabel)} />
                  ),
                },
                {
                  key: "icons",
                  header: "",
                  render: (r) => (
                    <div className="relative flex items-center gap-2 text-slate-400">
                      <Info className="h-4 w-4" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuRow(menuRow === r.id ? null : String(r.id));
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {menuRow === r.id && (
                        <div className="absolute right-0 top-6 z-20 w-44 rounded-lg border border-[#e8ebef] bg-white py-1 shadow-lg">
                          <button
                            type="button"
                            className="block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuRow(null);
                              setNotifyOpen(true);
                            }}
                          >
                            Send Notification &gt;
                          </button>
                          <button
                            type="button"
                            className="block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuRow(null);
                            }}
                          >
                            Edit Request &gt;
                          </button>
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </>
        ) : (
          <AdminDataTable
            keyField="id"
            data={actionRows}
            columns={[
              {
                key: "select",
                header: "",
                render: () => (
                  <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    onClick={(e) => e.stopPropagation()}
                  />
                ),
              },
              { key: "id", header: "Supplier Id" },
              { key: "supplierName", header: "Supplier Name" },
              { key: "agencyName", header: "Agency Name" },
              { key: "apiKey", header: "API Key" },
              { key: "lastUpdate", header: "Last Update" },
              {
                key: "status",
                header: "Status",
                render: (r) => <AdminBadge status={r.status as AdminStatus} />,
              },
              {
                key: "action",
                header: "Action",
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-7 gap-1 bg-[#006aec] px-2.5 text-[11px] hover:bg-[#006aec]/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSupplier(r.name as string);
                        setActionOpen(true);
                      }}
                    >
                      <Play className="h-3 w-3 fill-white" />
                      Action
                    </Button>
                    <Info className="h-4 w-4 text-slate-400" />
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>

      <SupplierActionModal
        open={actionOpen}
        onOpenChange={setActionOpen}
        variant="single"
        supplierName={selectedSupplier}
      />
      <SendNotificationModal open={notifyOpen} onOpenChange={setNotifyOpen} />
    </div>
  );
}
