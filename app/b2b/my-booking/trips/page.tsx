"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { fetchGroupBookings, type GroupBookingRow } from "@/lib/b2b/groupBookings";

export default function TripsPage() {
  const [rows, setRows] = useState<GroupBookingRow[]>([]);
  useEffect(() => {
    fetchGroupBookings().then(setRows);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const { upcoming, recent } = useMemo(() => {
    const upcomingRows = rows.filter((row) => (row.departure_date || "") >= today);
    const recentRows = rows.filter((row) => (row.departure_date || "") < today);
    return { upcoming: upcomingRows, recent: recentRows };
  }, [rows, today]);

  const list = (title: string, items: GroupBookingRow[]) => (
    <section className="mb-8">
      <h2 className="text-lg font-extrabold text-[#0C2342] mb-3">{title}</h2>
      {items.length === 0 && <p className="text-slate-500 text-sm">None yet.</p>}
      <div className="space-y-3">
        {items.map((row) => (
          <Link key={row.id} href="/b2b/group-travel/view-request" className="block bg-white rounded-2xl border border-slate-100 px-5 py-4">
            <p className="font-bold text-[#0C2342]">{row.origin} → {row.destination}</p>
            <p className="text-sm text-slate-500">{row.request_id} · {row.departure_date} · {row.status}</p>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#F2FBFF] flex flex-col">
      <B2BNavbar />
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[28px] font-extrabold text-[#0C2342]">Trips</h1>
          <Link href="/b2b/calendar" className="text-[#D60D26] font-bold">Calendar</Link>
        </div>
        {list("Upcoming", upcoming)}
        {list("Recent", recent)}
      </main>
      <Footer />
    </div>
  );
}
