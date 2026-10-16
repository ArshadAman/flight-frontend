"use client";

import React, { useEffect, useState } from "react";
import { Building2, Save, Upload, CheckCircle2, Shield, Phone, Mail, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

export function CompanyProfileSection() {
  const { access, user } = useAuth();
  const [name, setName] = useState("My Travel Deal Pvt Ltd");
  const [iata, setIata] = useState("1439201");
  const [gstin, setGstin] = useState("07AABCM9124P1Z3");
  const [pan, setPan] = useState("AABCM9124P");
  const [address, setAddress] = useState("Suite 402, Barakhamba Road, Connaught Place");
  const [city, setCity] = useState("New Delhi");
  const [state, setState] = useState("Delhi");
  const [pin, setPin] = useState("110001");
  const [email, setEmail] = useState("support@mytraveldeal.com");
  const [phone, setPhone] = useState("+91 11 4988 2200");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!access) return;
    const fetchProfile = async () => {
      try {
        const apiBase = getPublicApiUrl();
        const res = await fetch(`${apiBase}/agents/company-profile/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (res.ok) {
          const d = await res.json();
          if (d.company_name) setName(d.company_name);
          if (d.iata_number) setIata(d.iata_number);
          if (d.gstin) setGstin(d.gstin);
          if (d.pan) setPan(d.pan);
          if (d.address) setAddress(d.address);
          if (d.city) setCity(d.city);
          if (d.state) setState(d.state);
          if (d.pincode) setPin(d.pincode);
          if (d.email) setEmail(d.email);
          if (d.phone) setPhone(d.phone);
        }
      } catch {
        /* fallback to defaults */
      }
    };
    void fetchProfile();
  }, [access]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast("Agency corporate profile updated successfully!");
    setTimeout(() => setToast(null), 3000);

    if (access) {
      try {
        const apiBase = getPublicApiUrl();
        await fetch(`${apiBase}/agents/company-profile/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({
            company_name: name,
            iata_number: iata,
            gstin,
            pan,
            address,
            city,
            state,
            pincode: pin,
            email,
            phone,
          }),
        });
      } catch {
        /* preserved */
      }
    }
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md">
          ✓ {toast}
        </div>
      )}

      <div>
        <h2 className="text-xl font-black text-[#1c304a]">Company Profile & IATA Credentials</h2>
        <p className="text-xs text-slate-500">
          Manage your travel agency legal registration, tax compliance identifiers, and business contact information.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#1c304a] border-b pb-2">
            1. Legal Entity & Accreditations
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Business Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-[#D60D26]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">IATA Numeric Code</label>
              <input
                value={iata}
                onChange={(e) => setIata(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono font-bold outline-none focus:border-[#D60D26]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN Number</label>
              <input
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono font-bold uppercase outline-none focus:border-[#D60D26]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PAN Card Number</label>
              <input
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono font-bold uppercase outline-none focus:border-[#D60D26]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#1c304a] border-b pb-2">
            2. Registered Office & Contact Details
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-[#D60D26]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-[#D60D26]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State / Province</label>
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-[#D60D26]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PIN / Postal Code</label>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-[#D60D26]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Support Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-[#D60D26]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Helpline Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-[#D60D26]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-[#D60D26] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#b00b1f] shadow-md transition-all"
          >
            <Save className="h-4 w-4" />
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
}
