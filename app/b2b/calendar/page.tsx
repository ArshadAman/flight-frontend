"use client";

import { useEffect, useMemo, useState } from "react";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { fetchGroupBookings } from "@/lib/b2b/groupBookings";

export default function CalendarPage() {
  const [marks, setMarks] = useState<Record<string, string[]>>({});
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    fetchGroupBookings().then((rows) => {
      const next: Record<string, string[]> = {};
      rows.forEach((row) => {
        if (!row.departure_date) return;
        const label = `${row.origin}-${row.destination}`;
        next[row.departure_date] = [...(next[row.departure_date] || []), label];
      });
      setMarks(next);
    });
  }, []);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const grid: Array<{ day: number | null; key: string }> = [];
    for (let i = 0; i < first; i += 1) grid.push({ day: null, key: `e-${i}` });
    for (let day = 1; day <= days; day += 1) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      grid.push({ day, key });
    }
    return grid;
  }, [cursor]);

  const label = cursor.toLocaleString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#F2FBFF] flex flex-col">
      <B2BNavbar />
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[28px] font-extrabold text-[#0C2342]">{label}</h1>
          <div className="flex gap-2">
            <button type="button" className="bg-white border rounded-full px-4 py-2 font-bold" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>Prev</button>
            <button type="button" className="bg-white border rounded-full px-4 py-2 font-bold" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>Next</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell) => (
            <div key={cell.key} className="min-h-20 bg-white rounded-xl border border-slate-100 p-2 text-left">
              {cell.day && <p className="text-sm font-bold text-[#0C2342]">{cell.day}</p>}
              {(marks[cell.key] || []).slice(0, 2).map((item) => (
                <p key={item} className="text-[11px] font-semibold text-[#D60D26] truncate">{item}</p>
              ))}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
