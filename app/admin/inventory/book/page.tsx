"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  loadBookingDraft,
  clearBookingDraft,
  buildInitialPassengers,
  submitFlightBooking,
  computeBookingTotal,
  type BookingDraft,
  type BookingPassenger,
} from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function AdminInventoryBookPage() {
  const router = useRouter();
  const { access, user, openAuthModal } = useAuth();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [passengers, setPassengers] = useState<BookingPassenger[]>([]);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successIds, setSuccessIds] = useState<string[]>([]);

  useEffect(() => {
    const d = loadBookingDraft();
    if (!d) {
      router.replace("/admin/inventory/search");
      return;
    }
    setDraft(d);
    setPassengers(buildInitialPassengers(d.adults, d.children, d.infants));
    if (user?.email) setEmail(user.email);
  }, [router, user?.email]);

  if (!draft) {
    return <div className="p-6 text-sm text-slate-500">Loading draft…</div>;
  }

  const totals = computeBookingTotal(draft, passengers);

  const updatePax = (id: string, field: keyof BookingPassenger, value: string) => {
    setPassengers((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const onSubmit = async () => {
    if (!access) {
      openAuthModal();
      return;
    }
    if (!mobile || !email) {
      setError("Mobile and email are required.");
      return;
    }
    for (const p of passengers) {
      if (!p.first_name || !p.last_name || !p.dob) {
        setError("Fill all passenger name and DOB fields.");
        return;
      }
    }
    setBusy(true);
    setError(null);
    const result = await submitFlightBooking(draft.outbound, draft.returnFlight, { mobile, email }, passengers, access);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const ids = result.tickets
      .map((t) => (t && typeof t === "object" && "id" in t ? String((t as { id: string }).id) : ""))
      .filter(Boolean);
    setSuccessIds(ids);
    clearBookingDraft();
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-[#e8ebef] bg-white px-6 py-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/inventory/results" className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#1c304a]">API Book · Confirm passengers</h1>
            <p className="text-xs text-slate-500">
              {draft.origin} → {draft.destination} · {draft.outbound.airline} · ₹
              {draft.outbound.price.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 p-6">
        {!access && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Sign in as admin to complete booking.{" "}
            <button type="button" className="underline" onClick={openAuthModal}>
              Open login
            </button>
          </div>
        )}

        {successIds.length > 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-lg font-bold text-emerald-800">Booking created</h2>
            <p className="mt-1 text-sm text-emerald-700">
              Ticket(s) saved via `/api/v1/tickets/buy/`. They now appear under API Booking.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {successIds.map((id) => (
                <Button key={id} className="bg-[#006aec]" asChild>
                  <Link href={`/admin/api-bookings/${id}`}>View {id.slice(0, 8)}…</Link>
                </Button>
              ))}
              <Button variant="outline" asChild>
                <Link href="/admin/api-bookings">All API Bookings</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <section className="rounded-xl border border-[#e8ebef] bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold">Contact</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Mobile</label>
                  <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10-digit mobile" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Email</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#e8ebef] bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold">Passengers</h3>
              <div className="space-y-4">
                {passengers.map((p) => (
                  <div key={p.id} className="grid gap-3 rounded-lg border border-[#eef1f5] p-3 sm:grid-cols-5">
                    <p className="sm:col-span-5 text-xs font-medium text-slate-500">{p.label}</p>
                    <Input
                      placeholder="Title"
                      value={p.title}
                      onChange={(e) => updatePax(p.id, "title", e.target.value)}
                    />
                    <Input
                      placeholder="First name"
                      value={p.first_name}
                      onChange={(e) => updatePax(p.id, "first_name", e.target.value)}
                    />
                    <Input
                      placeholder="Last name"
                      value={p.last_name}
                      onChange={(e) => updatePax(p.id, "last_name", e.target.value)}
                    />
                    <select
                      className="h-9 rounded-md border border-input px-3 text-sm"
                      value={p.gender}
                      onChange={(e) => updatePax(p.id, "gender", e.target.value)}
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                    <Input
                      type="date"
                      value={p.dob}
                      onChange={(e) => updatePax(p.id, "dob", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#e8ebef] bg-white p-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span>₹{totals.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-slate-500">Tax (est.)</span>
                <span>₹{totals.tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="mt-2 flex justify-between text-base font-bold">
                <span>Total</span>
                <span>₹{totals.total.toLocaleString("en-IN")}</span>
              </div>
            </section>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <Button
              className="h-11 w-full bg-[#006aec] hover:bg-[#006aec]/90"
              disabled={busy}
              onClick={() => void onSubmit()}
            >
              {busy ? "Booking…" : "Confirm & buy via API"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
