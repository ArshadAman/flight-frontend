"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { agents, bookings } from "@/lib/admin/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Code2,
  Download,
  Filter,
  Info,
  MoreVertical,
  Search,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminStatus } from "@/lib/admin/types";

const tabs = [
  "All PNRs",
  "Refunds PNRs",
  "Cancel PNRs",
  "Voided PNRs",
  "Schedule Changes",
  "Rebooking Request",
  "Special Request",
];

const statusMap: Record<number, { status: AdminStatus; label: string }> = {
  0: { status: "denied", label: "Cancel PNR" },
  1: { status: "pending", label: "Pending" },
  2: { status: "open", label: "Rebooking" },
  3: { status: "closed", label: "Rejected" },
};

const pnrRows = bookings.map((b, i) => ({
  id: b.id,
  pnr: String(23853 + i * 111),
  depDate: "22, Dec 2021",
  depTime: "12:30 PM",
  airline: "AIR INDIA",
  flightNo: i % 2 === 0 ? "AI121" : "AI121/AI122",
  originCity: "New Delhi",
  originCode: "DEL",
  destCity: i % 2 === 0 ? "Mumbai" : "Bangkok",
  destCode: i % 2 === 0 ? "BOM" : "BKK",
  trip: ["One way", "Round Trip", "Multi-City"][i % 3],
  pax: 24,
  ...statusMap[i % 4],
}));

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative min-w-[140px] flex-1 rounded-lg border border-[#e8ebef] bg-white px-4 py-3">
      <Code2 className="absolute right-2 top-2 h-3.5 w-3.5 text-slate-300" />
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#1c304a]">{value}</p>
    </div>
  );
}

export default function BookingProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const agent = agents.find((a) => a.id === id);
  const [activeTab, setActiveTab] = useState(tabs[0]);

  if (!agent) notFound();

  const firstName = agent.name.split(" ")[0];

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-[#e8ebef] bg-white px-6 pb-0 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/bookings" className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-[#1c304a]">
            {firstName}&apos;s Profile booking management
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Input placeholder="Search" className="h-9 w-52 border-[#e8ebef] pr-9 text-sm" />
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-[#e8ebef] text-slate-600">
              <Calendar className="h-4 w-4" />
              Last 24 hours
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-[#e8ebef]">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-[#e8ebef]">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-[#e8ebef]">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative pb-2.5 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "text-[#1c304a] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#D60D26]"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-5 p-6">
        <div className="flex flex-wrap gap-3">
          <MetricCard label="No. of Booking" value="42" />
          <MetricCard label="No. of Passengers" value="42 Pax" />
          <MetricCard label="Refunds" value="42" />
          <MetricCard label="PNRs on Hold" value="42 PNRs" />
          <MetricCard label="Cancel PNRs" value="42 PNRs" />
          <MetricCard label="Voided PNRs" value="42 PNRs" />
        </div>

        <p className="text-xs text-slate-500">{pnrRows.length} PNRs</p>

        <AdminDataTable
          keyField="id"
          data={pnrRows}
          onRowClick={(row) => {
            window.location.href = `/admin/bookings/ticket/${row.pnr}`;
          }}
          columns={[
            {
              key: "select",
              header: "",
              render: () => (
                <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
              ),
            },
            { key: "pnr", header: "PNR No." },
            {
              key: "depDate",
              header: "Dep. Date",
              render: (r) => (
                <div>
                  <p className="text-sm">{String(r.depDate)}</p>
                  <p className="text-xs text-[#006aec]">{String(r.depTime)}</p>
                </div>
              ),
            },
            { key: "airline", header: "Airline Name" },
            {
              key: "flightNo",
              header: "Flight No.",
              render: (r) => <span className="text-[#006aec]">{String(r.flightNo)}</span>,
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
            { key: "trip", header: "Trip" },
            {
              key: "pax",
              header: "No. of Pax",
              render: (r) => (
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  {String(r.pax)}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (r) => <AdminBadge status={r.status as AdminStatus} label={String(r.label)} />,
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
      </div>
    </div>
  );
}
