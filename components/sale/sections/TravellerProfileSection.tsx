"use client";

import React, { useState } from "react";
import { Search, User, Globe, Award, Calendar, Eye, X, Phone, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface TravellerItem {
  id: string; // 47522
  name: string; // Harshit Singh
  contactNo: string; // 0987654321
  passport: string; // ND1234567
  nationality: string; // Indian
  totalTrip: number; // 23
  assignedAgent: string; // Ajay Kumar
  lastBooking: string; // 22, Dec 2021 | 12:30 PM
  gender: string;
  email: string;
}

const mockTravellers: TravellerItem[] = [
  {
    id: "47522",
    name: "Harshit Singh",
    contactNo: "0987654321",
    passport: "ND1234567",
    nationality: "Indian",
    totalTrip: 23,
    assignedAgent: "Ajay Kumar",
    lastBooking: "22, Dec 2021 | 12:30 PM",
    gender: "Male",
    email: "harshit.singh@corporate.in",
  },
  {
    id: "23853",
    name: "Vaibhav Gour",
    contactNo: "0981234567",
    passport: "Z9482103",
    nationality: "Indian",
    totalTrip: 43,
    assignedAgent: "Ajay Kumar",
    lastBooking: "18, Dec 2021 | 04:15 PM",
    gender: "Male",
    email: "vaibhav.g@travelcorp.com",
  },
  {
    id: "01272",
    name: "Rahul Meena",
    contactNo: "0976543210",
    passport: "K3391802",
    nationality: "Indian",
    totalTrip: 12,
    assignedAgent: "Vicky Mehra",
    lastBooking: "15, Dec 2021 | 10:00 AM",
    gender: "Male",
    email: "rahul.meena@delhitech.in",
  },
  {
    id: "90726",
    name: "Vaibhav Sharma",
    contactNo: "0988776655",
    passport: "M7194012",
    nationality: "Indian",
    totalTrip: 32,
    assignedAgent: "Lokesh Gidwani",
    lastBooking: "12, Dec 2021 | 08:30 PM",
    gender: "Male",
    email: "sharma.v@global.com",
  },
  {
    id: "90727",
    name: "Lokesh Gidwani",
    contactNo: "0911223344",
    passport: "V8190241",
    nationality: "Indian",
    totalTrip: 54,
    assignedAgent: "Ajay Kumar",
    lastBooking: "08, Dec 2021 | 01:20 PM",
    gender: "Male",
    email: "lokesh.gidwani@agency.com",
  },
  {
    id: "90728",
    name: "Ajay Mehra",
    contactNo: "0922334455",
    passport: "A9102934",
    nationality: "Indian",
    totalTrip: 9,
    assignedAgent: "Harshit Chirgania",
    lastBooking: "01, Dec 2021 | 05:40 PM",
    gender: "Male",
    email: "ajay.mehra@enterprise.in",
  },
];

export function TravellerProfileSection() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TravellerItem | null>(null);

  const filtered = mockTravellers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.passport.toLowerCase().includes(search.toLowerCase()) ||
      t.contactNo.includes(search)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Traveller Profiles</h2>
          <p className="text-xs text-slate-500">
            Corporate & frequent passenger directory with passport, nationality, and agent assignment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name, Passport, ID..."
              className="w-36 bg-transparent outline-none sm:w-48 text-xs"
            />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-[#e8ebef] pb-3">
        <span className="text-xs font-bold text-slate-400">49 Profiles on File</span>
      </div>

      {/* Table matching Figma columns */}
      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Traveller Id</th>
                <th className="px-4 py-3">Traveller Name</th>
                <th className="px-4 py-3">Contact No.</th>
                <th className="px-4 py-3">Passport</th>
                <th className="px-4 py-3">Nationality</th>
                <th className="px-4 py-3 text-center">Total Trip</th>
                <th className="px-4 py-3">Assigned Agent</th>
                <th className="px-4 py-3">Last Booking</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#006aec]">
                    #{item.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-700">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">{item.contactNo}</td>
                  <td className="px-4 py-3 font-mono font-bold text-[#D60D26]">{item.passport}</td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{item.nationality}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                      {item.totalTrip}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.assignedAgent}</td>
                  <td className="px-4 py-3 text-slate-500">{item.lastBooking}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-[#006aec]"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer / Detail Modal matching Figma */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006aec]/10 font-black text-[#006aec]">
                  {selected.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1c304a]">{selected.name}</h3>
                  <p className="text-xs text-slate-400">ID: #{selected.id} · {selected.nationality}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Passport Number</span>
                <span className="font-mono font-bold text-[#D60D26] text-sm">{selected.passport}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact No.</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{selected.contactNo}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Trips Completed</span>
                <span className="font-black text-emerald-700 text-sm">{selected.totalTrip} Flights</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Travel Agent</span>
                <span className="font-bold text-slate-800 text-sm">{selected.assignedAgent}</span>
              </div>
              <div className="col-span-2 rounded-lg bg-slate-50 p-3 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Last Flight Booking</span>
                <span className="font-medium text-slate-700 text-xs">{selected.lastBooking}</span>
              </div>
            </div>

            <div className="flex justify-end border-t pt-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg bg-[#1c304a] px-4 py-2 text-xs font-bold text-white hover:bg-[#2a4568]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
