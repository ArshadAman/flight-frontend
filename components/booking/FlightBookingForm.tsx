"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowRight, ArrowUpRight, CheckCircle2, Utensils } from "lucide-react";
import {
  type BookingDraft,
  type BookingPassenger,
  buildInitialPassengers,
  buildOfflineTicket,
  clearBookingDraft,
  computeBookingTotal,
  loadBookingDraft,
  submitFlightBooking,
} from "@/lib/booking";
import { mealOptionsForFlight } from "@/lib/flight";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

function ItineraryLeg({
  label,
  flight,
  date,
}: {
  label: string;
  flight: BookingDraft["outbound"];
  date?: string;
}) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <div className="bg-[#F4F7FC] px-5 py-2.5 border-b border-slate-200">
        <span className="text-xs font-black uppercase tracking-wider text-[#D60D26]">{label}</span>
        {date && (
          <span className="text-xs text-slate-500 ml-2">{format(parseISO(date), "EEE, d MMM yyyy")}</span>
        )}
      </div>
      <div className="p-5 flex flex-wrap gap-4 items-center">
        <div>
          <p className="font-black text-[#D60D26]">{flight.airline}</p>
          <p className="text-sm text-slate-500">{flight.id}</p>
        </div>
        <div className="font-bold text-slate-800">
          {flight.origin} <ArrowRight className="inline w-4 h-4" /> {flight.destination}
        </div>
        <div className="text-sm font-semibold text-slate-600">
          {flight.departureTime} – {flight.arrivalTime}
        </div>
        <div className="text-sm text-slate-500">{flight.duration}</div>
        <div className="text-sm font-semibold">
          {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop(s)`}
        </div>
        {flight.cabin_class && (
          <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">{flight.cabin_class}</span>
        )}
        {flight.baggage_label && (
          <span className="text-xs font-bold bg-[#D60D26] text-white px-2 py-1 rounded">
            Baggage {flight.baggage_label}
          </span>
        )}
        {(flight.meal_available || flight.food_onboard) && (
          <span className="text-xs font-bold text-green-700 flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5" /> Meals available
          </span>
        )}
        <div className="ml-auto text-right">
          <p className="text-xs text-slate-400">Fare</p>
          <p className="text-xl font-black">₹{flight.price.toLocaleString("en-IN")}</p>
        </div>
      </div>
    </div>
  );
}

export function FlightBookingForm({ b2b = false }: { b2b?: boolean }) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [passengers, setPassengers] = useState<BookingPassenger[]>([]);
  const [contactMobile, setContactMobile] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successPnrs, setSuccessPnrs] = useState<string[]>([]);

  useEffect(() => {
    const d = loadBookingDraft();
    if (!d) {
      router.replace(b2b ? "/b2b" : "/");
      return;
    }
    setDraft(d);
    setPassengers(buildInitialPassengers(d.adults, d.children, d.infants));
    setContactEmail(user?.email || "");
  }, [b2b, router, user?.email]);

  const outboundMeals = useMemo(
    () => mealOptionsForFlight(draft?.outbound),
    [draft?.outbound]
  );
  const returnMeals = useMemo(
    () => mealOptionsForFlight(draft?.returnFlight),
    [draft?.returnFlight]
  );

  const pricing = useMemo(
    () => (draft ? computeBookingTotal(draft, passengers) : null),
    [draft, passengers]
  );

  const showOutboundMeals = outboundMeals.length > 1;
  const showReturnMeals =
    draft?.tripType === "round-trip" && draft.returnFlight && returnMeals.length > 1;

  const updatePax = (id: string, field: keyof BookingPassenger, value: string) => {
    setPassengers((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!draft) return;
    if (!user) {
      openAuthModal();
      return;
    }
    if (!contactMobile.trim() || !contactEmail.trim()) {
      setError("Contact mobile and email are required.");
      return;
    }
    for (const p of passengers) {
      if (!p.first_name.trim() || !p.last_name.trim() || !p.dob) {
        setError(`Complete all fields for ${p.label}.`);
        return;
      }
    }

    setLoading(true);
    const token = localStorage.getItem("access_token");

    const result = await submitFlightBooking(
      draft.outbound,
      draft.returnFlight,
      { mobile: contactMobile, email: contactEmail },
      passengers,
      token
    );

    if (result.ok) {
      clearBookingDraft();
      const pnrs = result.tickets
        .map((t: unknown) => (t as { pnr_number?: string })?.pnr_number)
        .filter(Boolean) as string[];
      setSuccessPnrs(pnrs.length ? pnrs : ["CONFIRMED"]);
      setLoading(false);
      return;
    }

    // Offline fallback — save both legs
    const stored: unknown[] = [];
    stored.push(
      buildOfflineTicket(draft, passengers, draft.outbound, "Outbound")
    );
    if (draft.returnFlight) {
      stored.push(
        buildOfflineTicket(draft, passengers, draft.returnFlight, "Return")
      );
    }
    try {
      const existing = JSON.parse(localStorage.getItem("offline_bookings") || "[]");
      localStorage.setItem("offline_bookings", JSON.stringify([...existing, ...stored]));
    } catch {
      /* ignore */
    }
    clearBookingDraft();
    setSuccessPnrs(
      stored.map((t) => (t as { pnr_number: string }).pnr_number)
    );
    setLoading(false);
  };

  if (!draft) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin h-10 w-10 border-2 border-[#D60D26] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (successPnrs.length) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800">Booking confirmed</h2>
        <p className="text-slate-500 mt-2">
          {draft.tripType === "round-trip"
            ? "Your round-trip reservation is complete."
            : "Your flight is booked."}
        </p>
        <div className="mt-6 space-y-2">
          {successPnrs.map((pnr) => (
            <p key={pnr} className="font-bold text-slate-800">
              PNR: <span className="text-[#D60D26]">{pnr}</span>
            </p>
          ))}
        </div>
        <button
          type="button"
          onClick={() => router.push(b2b ? "/b2b/my-booking" : "/my-booking")}
          className="mt-8 bg-[#D60D26] text-white font-bold px-8 py-3 rounded-full"
        >
          View my bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Complete your booking</h1>
          <p className="text-slate-500 text-sm mt-1">
            {draft.origin} → {draft.destination}
            {draft.tripType === "round-trip" ? " · Round trip" : " · One way"} · {draft.cabin}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-bold text-[#D60D26] hover:underline"
        >
          ← Back to results
        </button>
      </div>

      <section className="space-y-4 mb-10">
        <h2 className="font-bold text-slate-800">Itinerary</h2>
        <ItineraryLeg label="Outbound" flight={draft.outbound} date={draft.departureDate} />
        {draft.returnFlight && (
          <ItineraryLeg label="Return" flight={draft.returnFlight} date={draft.returnDate} />
        )}
      </section>

      {pricing && (
        <section className="mb-10 bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-bold text-slate-800 mb-4">Price summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Base fare ({passengers.length} traveller(s))</span>
              <span className="font-semibold">₹{pricing.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Taxes & fees</span>
              <span className="font-semibold">₹{pricing.tax.toLocaleString("en-IN")}</span>
            </div>
            {pricing.meals > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Meals</span>
                <span className="font-semibold">₹{pricing.meals.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-slate-100 text-base">
              <span className="font-bold text-slate-800">Total</span>
              <span className="font-black text-[#D60D26]">
                ₹{pricing.total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="mb-8 bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 mb-4">Contact details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-600">Mobile *</label>
            <input
              type="tel"
              value={contactMobile}
              onChange={(e) => setContactMobile(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold"
              placeholder="+91"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Email *</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold"
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-bold text-slate-800">
          Passengers
          <span className="text-slate-500 font-semibold text-sm ml-2">
            ({draft.adults} adult{draft.adults !== 1 ? "s" : ""}
            {draft.children > 0 ? `, ${draft.children} child${draft.children !== 1 ? "ren" : ""}` : ""}
            {draft.infants > 0 ? `, ${draft.infants} infant${draft.infants !== 1 ? "s" : ""}` : ""})
          </span>
        </h2>

        {passengers.map((pax) => (
          <div key={pax.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <span className="font-bold text-slate-700">{pax.label}</span>
            </div>
            <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600">Title</label>
                <select
                  value={pax.title}
                  onChange={(e) => updatePax(pax.id, "title", e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                >
                  <option value="MR">Mr</option>
                  <option value="MRS">Mrs</option>
                  <option value="MS">Ms</option>
                  <option value="MSTR">Mstr</option>
                  <option value="MISS">Miss</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">First name *</label>
                <input
                  value={pax.first_name}
                  onChange={(e) => updatePax(pax.id, "first_name", e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Last name *</label>
                <input
                  value={pax.last_name}
                  onChange={(e) => updatePax(pax.id, "last_name", e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Gender</label>
                <select
                  value={pax.gender}
                  onChange={(e) => updatePax(pax.id, "gender", e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Date of birth *</label>
                <input
                  type="date"
                  value={pax.dob}
                  onChange={(e) => updatePax(pax.id, "dob", e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Passport (optional)</label>
                <input
                  value={pax.passport_number || ""}
                  onChange={(e) => updatePax(pax.id, "passport_number", e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                />
              </div>

              {showOutboundMeals && (
                <div>
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Utensils className="w-3 h-3" /> Outbound meal
                    {draft.outbound.meal_options?.length ? (
                      <span className="text-[10px] font-normal text-green-600 ml-1">(from airline)</span>
                    ) : null}
                  </label>
                  <select
                    value={pax.outbound_meal}
                    onChange={(e) => updatePax(pax.id, "outbound_meal", e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  >
                    {outboundMeals.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                        {m.description ? ` — ${m.description}` : ""}
                        {m.price > 0 ? ` (+₹${m.price})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {showReturnMeals && (
                <div>
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Utensils className="w-3 h-3" /> Return meal
                    {draft.returnFlight?.meal_options?.length ? (
                      <span className="text-[10px] font-normal text-green-600 ml-1">(from airline)</span>
                    ) : null}
                  </label>
                  <select
                    value={pax.return_meal}
                    onChange={(e) => updatePax(pax.id, "return_meal", e.target.value)}
                    className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  >
                    {returnMeals.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                        {m.description ? ` — ${m.description}` : ""}
                        {m.price > 0 ? ` (+₹${m.price})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 px-4 py-4">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">Total payable</p>
            <p className="text-2xl font-black text-slate-900">
              ₹{pricing?.total.toLocaleString("en-IN") ?? "—"}
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className={cn(
              "w-full sm:w-auto bg-[#D60D26] hover:bg-[#b00b1d] text-white font-bold px-10 py-3.5 rounded-full flex items-center justify-center gap-2 disabled:opacity-60"
            )}
          >
            {loading ? "Processing…" : (
              <>
                Confirm booking <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
