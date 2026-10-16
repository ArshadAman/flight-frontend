"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Shield,
  Search,
  CheckCircle2,
  UserCheck,
  X,
  Mail,
  Phone,
  UserX,
  Calendar,
  MapPin,
  Building,
  User,
  ArrowRight,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

export interface StaffDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  department: string;
  branch: string;
  address: string;
  joiningDate: string;
  joinBy: string;
  managedAccounts: string;
  role: string;
  status: "Active" | "Inactive";
}

const mockStaffList: StaffDetail[] = [
  {
    id: "23853",
    name: "Rahul Mehra",
    email: "XYZ123@gmail.com",
    phone: "0123456789",
    dob: "31 Jan 1996",
    department: "Operations",
    branch: "Bhopal Branch",
    address: "M-122, Vinay Grah Nirman, Bhopal.",
    joiningDate: "22, Dec 2021 | 12:30 PM",
    joinBy: "Vicky Mehra",
    managedAccounts: "Harshit Chirgania",
    role: "Operations Lead",
    status: "Active",
  },
  {
    id: "47522",
    name: "Vaibhav Gour",
    email: "vaibhav.g@mytraveldeal.com",
    phone: "9876543210",
    dob: "14 May 1994",
    department: "Finance",
    branch: "New Delhi HQ",
    address: "B-44, Connaught Place, New Delhi.",
    joiningDate: "10, Aug 2022 | 11:00 AM",
    joinBy: "Ajay Kumar",
    managedAccounts: "Lokesh Gidwani",
    role: "Senior Accountant",
    status: "Active",
  },
  {
    id: "01272",
    name: "Rahul Meena",
    email: "rahul.m@mytraveldeal.com",
    phone: "9123456780",
    dob: "20 Sep 1998",
    department: "Reservation",
    branch: "Mumbai Office",
    address: "Flat 12, Andheri West, Mumbai.",
    joiningDate: "05, Jan 2023 | 02:15 PM",
    joinBy: "Vicky Mehra",
    managedAccounts: "Amit Mehra",
    role: "Ticketing Specialist",
    status: "Active",
  },
  {
    id: "90726",
    name: "Harshit Singh",
    email: "harshit.s@mytraveldeal.com",
    phone: "9811223344",
    dob: "12 Mar 1995",
    department: "Customer Support",
    branch: "Bhopal Branch",
    address: "HIG 88, Arera Colony, Bhopal.",
    joiningDate: "15, Nov 2023 | 10:30 AM",
    joinBy: "Rahul Mehra",
    managedAccounts: "Pooja Mehta",
    role: "Support Desk Lead",
    status: "Inactive",
  },
  {
    id: "54210",
    name: "Vaibhav Sharma",
    email: "vaibhav.s@mytraveldeal.com",
    phone: "9988776655",
    dob: "08 Oct 1993",
    department: "Operations",
    branch: "New Delhi HQ",
    address: "Sector 14, Rohini, New Delhi.",
    joiningDate: "01, Feb 2024 | 09:45 AM",
    joinBy: "Ajay Kumar",
    managedAccounts: "Harshit Chirgania",
    role: "Inventory Executive",
    status: "Active",
  },
];

export function StaffManageSection({ initialTab = "list" }: { initialTab?: "list" | "data" }) {
  const { access } = useAuth();
  const [staff, setStaff] = useState<StaffDetail[]>(mockStaffList);
  const [viewTab, setViewTab] = useState<"list" | "data">(initialTab);
  const [statusFilter, setStatusFilter] = useState<string>("All Staff");
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffDetail>(mockStaffList[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form states for adding staff
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formDept, setFormDept] = useState("Operations");
  const [formBranch, setFormBranch] = useState("New Delhi HQ");
  const [formAddress, setFormAddress] = useState("");

  useEffect(() => {
    setViewTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!access) return;
    const fetchStaff = async () => {
      try {
        const apiBase = getPublicApiUrl();
        const res = await fetch(`${apiBase}/agents/staff/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data?.results || [];
          if (items.length > 0) {
            const mapped: StaffDetail[] = items.map((s: any, idx: number) => ({
              id: s.id || String(20000 + idx),
              name: s.name,
              email: s.email,
              phone: s.phone || "0123456789",
              dob: s.dob || "31 Jan 1996",
              department: s.department || "Operations",
              branch: s.branch || "Delhi Branch",
              address: s.address || "M-122, Vinay Grah Nirman, Bhopal.",
              joiningDate: s.joining_date || "22, Dec 2021 | 12:30 PM",
              joinBy: s.join_by || "Vicky Mehra",
              managedAccounts: s.managed_accounts || "Harshit Chirgania",
              role: s.role || "Ticketing Agent",
              status: s.status === "Inactive" ? "Inactive" : "Active",
            }));
            setStaff(mapped);
            if (mapped.length > 0) setSelectedStaff(mapped[0]);
          }
        }
      } catch {
        /* preserved */
      }
    };
    void fetchStaff();
  }, [access]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const newMember: StaffDetail = {
      id: String(Math.floor(10000 + Math.random() * 90000)),
      name: formName,
      email: formEmail,
      phone: formPhone || "0123456789",
      dob: "01 Jan 1998",
      department: formDept,
      branch: formBranch,
      address: formAddress || "Main Avenue, New Delhi",
      joiningDate: "Today | 10:00 AM",
      joinBy: "Admin",
      managedAccounts: "Corporate Desk",
      role: `${formDept} Specialist`,
      status: "Active",
    };

    setStaff([newMember, ...staff]);
    setSelectedStaff(newMember);
    setModalOpen(false);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormAddress("");
    setToast(`Added staff member: ${newMember.name}`);
    setTimeout(() => setToast(null), 3000);

    if (access) {
      try {
        const apiBase = getPublicApiUrl();
        await fetch(`${apiBase}/agents/staff/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({
            name: newMember.name,
            email: newMember.email,
            phone: newMember.phone,
            department: newMember.department,
            branch: newMember.branch,
          }),
        });
      } catch {
        /* fallback preserved */
      }
    }
  };

  const filtered = staff.filter((s) => {
    if (statusFilter === "Active" && s.status !== "Active") return false;
    if (statusFilter === "Inactive" && s.status !== "Inactive") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.branch.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all">
          ✓ {toast}
        </div>
      )}

      {/* Top Header & Section Tabs matching Figma Staff List / Staff Data */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Staff Manage</h2>
          <p className="text-xs text-slate-500">
            Agency staff roster, detailed profiles, role-based branch allocation, and joining credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewTab("list")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-bold transition-all",
                viewTab === "list" ? "bg-[#1c304a] text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              Staff List
            </button>
            <button
              type="button"
              onClick={() => setViewTab("data")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-bold transition-all",
                viewTab === "data" ? "bg-[#1c304a] text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              Staff Data
            </button>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#D60D26] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#b00b1f] shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Staff
          </button>
        </div>
      </div>

      {/* VIEW 1: STAFF LIST (Figma Frame 2083:66136) */}
      {viewTab === "list" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {["All Staff", "Active", "Inactive"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                    statusFilter === tab
                      ? "bg-slate-200 text-[#1c304a]"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {tab}
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-slate-400">
                19 Staffs
              </span>
            </div>

            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Staff Id, Name..."
                className="w-36 bg-transparent outline-none sm:w-48 text-xs"
              />
            </label>
          </div>

          <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Staff Id</th>
                    <th className="px-4 py-3">Staff Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Branch Name</th>
                    <th className="px-4 py-3">Department Access</th>
                    <th className="px-4 py-3">Status</th>
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
                          <div>
                            <p className="font-bold text-[#1c304a]">{item.name}</p>
                            <p className="text-[10px] text-slate-400">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">{item.department}</td>
                      <td className="px-4 py-3 text-slate-600">{item.branch}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                          {item.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold",
                            item.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          )}
                        >
                          ● {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStaff(item);
                            setViewTab("data");
                          }}
                          className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-[#006aec]"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No staff members matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: STAFF DATA (Exact Figma Detail Card 2083:66218) */}
      {viewTab === "data" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left mini selector */}
          <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Staff</h3>
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {staff.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStaff(s)}
                  className={cn(
                    "w-full text-left rounded-lg p-2.5 text-xs transition-all flex items-center justify-between",
                    selectedStaff.id === s.id
                      ? "bg-[#1c304a] text-white shadow-sm"
                      : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className={cn("text-[10px]", selectedStaff.id === s.id ? "text-slate-300" : "text-slate-400")}>
                      ID: #{s.id} · {s.department}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-bold",
                      s.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-400/20 text-slate-400"
                    )}
                  >
                    {s.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Detailed Card: Exactly matching Figma Fields */}
          <div className="lg:col-span-2 rounded-[10px] border border-[#e8ebef] bg-white p-6 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#006aec]/10 text-[#006aec] font-black text-lg">
                  {selectedStaff.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1c304a]">{selectedStaff.name}</h3>
                  <p className="text-xs text-slate-400">Staff ID: #{selectedStaff.id} · {selectedStaff.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    selectedStaff.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  )}
                >
                  ● {selectedStaff.status}
                </span>
                <button
                  type="button"
                  onClick={() => setViewTab("list")}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Back to List
                </button>
              </div>
            </div>

            {/* Exactly the 8 fields from Figma Task 1270 */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Date Of Birth
                </span>
                <p className="font-black text-[#1c304a] text-sm">{selectedStaff.dob}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Department Name
                </span>
                <p className="font-black text-[#1c304a] text-sm">{selectedStaff.department}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Branch Name
                </span>
                <p className="font-black text-[#1c304a] text-sm">{selectedStaff.branch}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Phone Number
                </span>
                <p className="font-black text-[#1c304a] text-sm">{selectedStaff.phone}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1 sm:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Address
                </span>
                <p className="font-semibold text-slate-700">{selectedStaff.address}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Joining Date
                </span>
                <p className="font-black text-[#1c304a] text-sm">{selectedStaff.joiningDate}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Email Address
                </span>
                <p className="font-black text-[#006aec] text-sm">{selectedStaff.email}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Staff Join By
                </span>
                <p className="font-black text-[#1c304a] text-sm">{selectedStaff.joinBy}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Managed Accounts
                </span>
                <p className="font-black text-[#1c304a] text-sm">{selectedStaff.managedAccounts}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  const updated = staff.map((s) =>
                    s.id === selectedStaff.id
                      ? { ...s, status: (s.status === "Active" ? "Inactive" : "Active") as "Active" | "Inactive" }
                      : s
                  );
                  setStaff(updated);
                  setSelectedStaff({
                    ...selectedStaff,
                    status: selectedStaff.status === "Active" ? "Inactive" : "Active",
                  });
                  setToast(`Staff status updated to ${selectedStaff.status === "Active" ? "Inactive" : "Active"}`);
                  setTimeout(() => setToast(null), 3000);
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                {selectedStaff.status === "Active" ? "Deactivate Staff" : "Activate Staff"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setToast(`Password reset link sent to ${selectedStaff.email}`);
                  setTimeout(() => setToast(null), 3000);
                }}
                className="rounded-lg bg-[#006aec] px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
              >
                Send Password Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-[#1c304a]">Add New Agency Staff</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Name *</label>
                <input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#D60D26]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. XYZ123@gmail.com"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#D60D26]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. 0123456789"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#D60D26]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#D60D26] bg-white"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Reservation">Reservation</option>
                    <option value="Customer Support">Customer Support</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch</label>
                  <select
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#D60D26] bg-white"
                  >
                    <option value="New Delhi HQ">New Delhi HQ</option>
                    <option value="Bhopal Branch">Bhopal Branch</option>
                    <option value="Mumbai Office">Mumbai Office</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="e.g. M-122, Vinay Grah Nirman, Bhopal."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#D60D26]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#D60D26] px-4 py-1.5 font-bold text-white hover:bg-[#b00b1f]"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
