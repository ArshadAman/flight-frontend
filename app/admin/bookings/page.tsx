"use client";

import Link from "next/link";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { agents } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info, MoreVertical } from "lucide-react";

const suppliers = agents.map((a, i) => ({
  id: String(23853 + i * 111),
  supplierId: String(23853 + i * 111),
  name: a.name.split(" ")[0],
  agencyName: a.name,
  typeApi: "Flight",
  date: "22, Dec 2021",
  time: "12:30 PM",
  bookings: [42, 28, 35, 19, 12][i % 5],
  pax: [42, 28, 35, 19, 12][i % 5],
  profileId: a.id,
}));

export default function BookingsPage() {
  return (
    <AdminListPage
      title="Supplier Booking Management"
      subtitle={`${suppliers.length} Suppliers`}
      keyField="id"
      data={suppliers}
      columns={[
        {
          key: "select",
          header: "",
          render: () => (
            <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
          ),
        },
        { key: "supplierId", header: "Supplier Id" },
        { key: "name", header: "Supplier Name" },
        { key: "agencyName", header: "Agency Name" },
        {
          key: "typeApi",
          header: "Type API",
          render: (r) => (
            <span className="rounded-full bg-[#e8f2ff] px-2.5 py-0.5 text-xs font-medium text-[#006aec]">
              {String(r.typeApi)}
            </span>
          ),
        },
        {
          key: "date",
          header: "Date",
          render: (r) => (
            <div>
              <p className="text-sm text-[#1c304a]">{String(r.date)}</p>
              <p className="text-xs text-slate-400">{String(r.time)}</p>
            </div>
          ),
        },
        {
          key: "bookings",
          header: "No.of booking",
          render: (r) => `${r.bookings} Booking`,
        },
        {
          key: "pax",
          header: "No.of Pax",
          render: (r) => `${r.pax} Pax`,
        },
        {
          key: "actions",
          header: "Action",
          render: (r) => (
            <div className="flex items-center gap-2">
              <Link href={`/admin/bookings/${r.profileId}`} onClick={(e) => e.stopPropagation()}>
                <Button size="sm" className="h-8 gap-1 bg-[#006aec] hover:bg-[#006aec]/90">
                  View Profile <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
              <Info className="h-4 w-4 text-slate-400" />
              <MoreVertical className="h-4 w-4 text-slate-400" />
            </div>
          ),
        },
      ]}
    />
  );
}
