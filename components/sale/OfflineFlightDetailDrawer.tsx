"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Plane,
  X,
  Plus,
  Pencil,
  Luggage,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  cityCountryFromCode,
  cityLabelFromCode,
  formatDisplayDateLong,
  formatInrPortal,
  formatShortDate,
  groupPnrFromId,
  listingStatus,
  passengerBookingLabel,
  seatStats,
  stopCount,
  type OfflineInventoryRow,
  type OfflineTicketRow,
} from "@/lib/sale/offlinePortal";
import { saveBookingDraft } from "@/lib/booking";
import { SALE_BOOK_SEAT_PATH } from "@/lib/sale/offlineBookFlow";
import { forSaleItemToFlight, type ForSaleInventoryItem } from "@/lib/forSale";
import { unwrapData } from "@/lib/apiEnvelope";
import { getPublicApiUrl } from "@/lib/apiConfig";
import { useAuth } from "@/context/AuthContext";

function formatClock(iso?: string, withPlusDay?: boolean, depIso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  let plus = "";
  if (withPlusDay && depIso) {
    const dep = new Date(depIso);
    if (d.toDateString() !== dep.toDateString()) plus = "(+1)";
  }
  return `${time}${plus}`;
}

function utcOffsetLabel(iso?: string) {
  if (!iso) return "UTC";
  const d = new Date(iso);
  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `UTC ${sign}${hh}:${mm}`;
}

export function OfflineFlightDetailDrawer({
  flight,
  tickets,
  bookedCount,
  onClose,
  onPublishToggle,
  publishing,
  drawerVariant = "flight",
  allowBookNow = false,
  onEditInventory,
  onTicketSelect,
  onInventoryUpdated,
}: {
  flight: OfflineInventoryRow;
  tickets: OfflineTicketRow[];
  bookedCount: number;
  onClose: () => void;
  onPublishToggle?: () => void;
  publishing?: boolean;
  drawerVariant?: "flight" | "inventory";
  allowBookNow?: boolean;
  onEditInventory?: () => void;
  onTicketSelect?: (ticket: OfflineTicketRow) => void;
  onInventoryUpdated?: () => void;
}) {
  const router = useRouter();
  const { access, openAuthModal } = useAuth();
  type DrawerTab = "Segment" | "Inventory" | "Booking" | "PNR Booking";
  const [activeTab, setActiveTab] = useState<DrawerTab>("Segment");
  const [bookingMsg, setBookingMsg] = useState<string | null>(null);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [showFlightDetails, setShowFlightDetails] = useState(false);
  const [seatsModalOpen, setSeatsModalOpen] = useState(false);
  const [editingSeats, setEditingSeats] = useState(false);
  const [editSeats, setEditSeats] = useState(String(flight.seats_available ?? 0));
  const [editPrice, setEditPrice] = useState(String(Number(flight.price).toFixed(2)));
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [pnrInput, setPnrInput] = useState("");
  const [passengerName, setPassengerName] = useState("");
  const [pnrAmount, setPnrAmount] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [addingPnr, setAddingPnr] = useState(false);
  const [pnrMsg, setPnrMsg] = useState<string | null>(null);
  const [pnrSuccess, setPnrSuccess] = useState(false);

  useEffect(() => {
    setEditSeats(String(flight.seats_available ?? 0));
    setEditPrice(String(Number(flight.price).toFixed(2)));
    setEditingSeats(false);
    setSaveMsg(null);
    setShowFlightDetails(false);
    setSeatsModalOpen(false);
  }, [flight.id, flight.price, flight.seats_available]);

  const segments = useMemo(() => {
    if (flight.segments_data?.length) return flight.segments_data;
    return [
      {
        segment_id: 0,
        origin: flight.origin,
        origin_city: cityLabelFromCode(flight.origin),
        origin_terminal: "Terminal 1",
        destination: flight.destination,
        destination_city: cityLabelFromCode(flight.destination),
        destination_terminal: "Terminal 2",
        departure_datetime: flight.departure_datetime,
        arrival_datetime: flight.arrival_datetime,
        duration: flight.duration || "—",
        stop_over: null,
        flight_number: flight.flight_number,
      },
    ];
  }, [flight]);

  const stats = seatStats(flight, bookedCount);
  const status = listingStatus(flight, bookedCount);
  const canCancel = status === "Open";
  const stops = stopCount(flight);
  const originCity = cityLabelFromCode(flight.origin, segments[0]?.origin_city);
  const destCity = cityLabelFromCode(
    flight.destination,
    segments[segments.length - 1]?.destination_city
  );

  const tabs: DrawerTab[] =
    drawerVariant === "inventory"
      ? ["Segment", "Inventory", "Booking", "PNR Booking"]
      : ["Segment", "Inventory", "Booking"];

  const flightTickets = useMemo(
    () =>
      tickets.filter(
        (t) =>
          String(t.agent_flight_inventory) === String(flight.id) &&
          t.status !== "CANCELLED"
      ),
    [tickets, flight.id]
  );

  const bookNow = async () => {
    if (!access) {
      openAuthModal();
      return;
    }
    setBookingBusy(true);
    setBookingMsg(null);
    try {
      const api = getPublicApiUrl();
      const res = await fetch(`${api}/flights/holds/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inventory: flight.id,
          seats: 1,
          prefer_waitlist: stats.available <= 0,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((json as { detail?: string }).detail || `Hold failed (${res.status})`);
      }
      const hold = unwrapData<{ id?: string; expires_at?: string }>(json);
      const outbound = forSaleItemToFlight(flight as ForSaleInventoryItem);
      saveBookingDraft({
        tripType: "one-way",
        origin: flight.origin,
        destination: flight.destination,
        departureDate: flight.departure_datetime.slice(0, 10),
        cabin: flight.cabin_class || "Economy",
        adults: 1,
        children: 0,
        infants: 0,
        outbound,
        createdAt: new Date().toISOString(),
        inventoryHoldId: hold.id ? String(hold.id) : undefined,
        holdExpiresAt: hold.expires_at || undefined,
      });
      router.push(SALE_BOOK_SEAT_PATH);
    } catch (err) {
      setBookingMsg(err instanceof Error ? err.message : "Could not start booking");
    } finally {
      setBookingBusy(false);
    }
  };

  const saveSeatsAndPrice = async () => {
    if (!access) {
      openAuthModal();
      return;
    }
    const seats = Number(editSeats);
    const price = Number(editPrice);
    if (!Number.isFinite(seats) || seats < 0) {
      setSaveMsg("Enter a valid seat count.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setSaveMsg("Enter a valid price.");
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      const api = getPublicApiUrl();
      const res = await fetch(`${api}/flights/inventory/${flight.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seats_available: seats, price }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { detail?: string }).detail || `Save failed (${res.status})`);
      setSaveMsg("Saved.");
      setEditingSeats(false);
      onInventoryUpdated?.();
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const submitAddPnr = async () => {
    if (!pnrInput.trim()) {
      setPnrMsg("PNR number is required.");
      return;
    }
    if (!access) {
      openAuthModal();
      return;
    }
    setAddingPnr(true);
    setPnrMsg(null);
    setPnrSuccess(false);
    try {
      const api = getPublicApiUrl();
      const res = await fetch(`${api}/tickets/add-pnr/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inventory_id: flight.id,
          pnr_number: pnrInput.trim().toUpperCase(),
          passenger_name: passengerName.trim(),
          total_amount: pnrAmount ? Number(pnrAmount) : 0,
          ticket_number: ticketNumber.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { detail?: string }).detail || `Failed to add PNR (${res.status})`);
      setPnrSuccess(true);
      setPnrMsg(`PNR ${pnrInput.trim().toUpperCase()} added successfully.`);
      setPnrInput("");
      setPassengerName("");
      setPnrAmount("");
      setTicketNumber("");
      onInventoryUpdated?.();
    } catch (err) {
      setPnrMsg(err instanceof Error ? err.message : "Failed to add PNR");
    } finally {
      setAddingPnr(false);
    }
  };

  const bumpSeats = (delta: number) => {
    const next = Math.max(0, Number(editSeats || 0) + delta);
    setEditSeats(String(next));
  };

  return (
    <>
      <div className="w-full xl:w-[420px] bg-white border-l border-slate-200 fixed top-0 xl:top-[96px] right-0 bottom-0 z-50 xl:z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header — Figma: city names + long date */}
        <div className="p-5 bg-[#F5F6F8] border-b border-slate-200 flex items-start justify-between shrink-0">
          <div>
            <div className="font-bold text-[16px] text-slate-800 flex items-center gap-2">
              {originCity} <ArrowRight className="w-4 h-4 text-[#D60D26]" /> {destCity}
            </div>
            <div className="text-[13px] text-slate-500 mt-1">
              {formatDisplayDateLong(flight.departure_datetime)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-slate-200 p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        <div className="flex items-center border-b border-slate-200 shrink-0 overflow-x-auto bg-white">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-2 py-3.5 font-bold text-[12px] whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "text-[#D60D26] border-b-2 border-[#D60D26]"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ─── SEGMENT (Figma timeline) ─── */}
        {activeTab === "Segment" && (
          <>
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {segments.map((segment, index) => {
                const isLast = index === segments.length - 1;
                return (
                  <div key={`${flight.id}-seg-${index}`} className="mb-2">
                    <div className="font-bold text-[15px] text-slate-800 mb-3">
                      {cityCountryFromCode(segment.origin, segment.origin_city)}
                    </div>

                    <div className="flex gap-4 relative">
                      <div className="flex flex-col items-center relative">
                        <div className="w-3 h-3 rounded-full bg-slate-800 relative z-10 shrink-0" />
                        <div className="w-px flex-1 border-l border-dashed border-slate-300 my-1 min-h-[80px]" />
                        {isLast && (
                          <div className="w-3 h-3 rounded-full border-2 border-slate-800 bg-white relative z-10 shrink-0" />
                        )}
                      </div>

                      <div className="flex-1 pb-4">
                        <div className="text-[13px] text-slate-700 font-bold">
                          {formatClock(segment.departure_datetime)}{" "}
                          <span className="text-slate-400 font-medium">
                            ({utcOffsetLabel(segment.departure_datetime)})
                          </span>
                          <span className="text-[#D60D26] mx-1">•</span>
                          {segment.origin}
                          <span className="text-[#D60D26] mx-1">•</span>
                          {segment.origin_terminal || "Terminal"}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 py-5">
                          <div className="w-8 h-8 bg-[#D60D26] rounded flex items-center justify-center shrink-0">
                            <Plane className="w-4 h-4 text-white -rotate-45" />
                          </div>
                          <img
                            src={`/airlines/${flight.airline_code || "AI"}.png`}
                            alt={flight.airline_name || flight.airline_code}
                            className="h-6 w-6 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          {stops > 0 && (
                            <span className="bg-[#377BD7] text-white text-[11px] font-black px-2.5 py-1 rounded">
                              {stops} stop{stops > 1 ? "s" : ""}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowFlightDetails((v) => !v)}
                            className="text-[#D60D26] font-bold text-[13px] underline underline-offset-2 inline-flex items-center gap-1"
                          >
                            See flight details
                            {showFlightDetails ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {showFlightDetails && (
                          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[12px] text-slate-600 space-y-1">
                            <div>
                              <span className="font-bold text-slate-800">Airline:</span>{" "}
                              {flight.airline_name || flight.airline_code} · {flight.flight_number}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800">Duration:</span>{" "}
                              {segment.duration || flight.duration || "—"}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800">Cabin:</span>{" "}
                              {flight.cabin_class || "Economy"}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800">Baggage:</span>{" "}
                              {flight.baggage_check_in || "23 kg"} check-in
                            </div>
                          </div>
                        )}

                        {isLast && (
                          <>
                            <div className="text-[13px] text-slate-700 font-bold mb-3">
                              {formatClock(
                                segment.arrival_datetime,
                                true,
                                segment.departure_datetime
                              )}{" "}
                              <span className="text-slate-400 font-medium">
                                ({utcOffsetLabel(segment.arrival_datetime)})
                              </span>
                              <span className="text-[#D60D26] mx-1">•</span>
                              {segment.destination}
                              <span className="text-[#D60D26] mx-1">•</span>
                              {segment.destination_terminal || "Terminal"}
                            </div>
                            <div className="font-bold text-[15px] text-slate-800">
                              {cityCountryFromCode(segment.destination, segment.destination_city)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col items-center gap-2 shrink-0">
              {allowBookNow ? (
                <>
                  <button
                    type="button"
                    disabled={bookingBusy}
                    onClick={() => void bookNow()}
                    className="w-full bg-[#D60D26] hover:bg-[#30060F] text-white font-bold py-3 rounded-full text-[14px] disabled:opacity-50"
                  >
                    {bookingBusy ? "Starting…" : stats.available > 0 ? "Book Now" : "Join Waitlist"}
                  </button>
                  {bookingMsg && <p className="text-xs text-rose-600 text-center">{bookingMsg}</p>}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={!canCancel}
                    className="text-slate-400 font-bold flex items-center gap-2 text-[14px] cursor-not-allowed"
                  >
                    Cancel Flight <X className="w-4 h-4" />
                  </button>
                  <div className="text-[12px] text-slate-400">
                    Only open &amp; pending flight can be canceled
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* ─── INVENTORY (Figma) ─── */}
        {activeTab === "Inventory" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-7 bg-white">
            {onPublishToggle && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    {flight.is_published === false ? "Closed" : "Open for sale"}
                  </div>
                  <div className="text-[11px] text-slate-500">Toggle marketplace listing</div>
                </div>
                <button
                  type="button"
                  disabled={publishing}
                  onClick={onPublishToggle}
                  className={`rounded-full px-4 py-2 text-xs font-bold ${
                    flight.is_published === false
                      ? "bg-[#D60D26] text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {flight.is_published === false ? "Open" : "Close"}
                </button>
              </div>
            )}

            <div>
              <div className="font-bold text-[15px] text-slate-800 mb-3">Baggage</div>
              <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600 mb-2">
                <Luggage className="w-4 h-4 text-slate-400" />
                Checked baggage options
              </div>
              <input
                type="text"
                readOnly
                value={`${flight.baggage_check_in || "23 kg"}, Included`}
                className="w-full border border-slate-200 rounded-lg p-3 text-[14px] font-bold text-slate-600 bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-[15px] text-slate-800">Tickets Volume</div>
                {editingSeats ? (
                  <button
                    type="button"
                    onClick={() => void saveSeatsAndPrice()}
                    disabled={saving}
                    className="text-[13px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (onEditInventory) {
                        setSeatsModalOpen(true);
                        return;
                      }
                      setSeatsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[13px] font-bold text-[#D60D26]"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>

              {/* Figma: 5 metric boxes — number on top, label below */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {(
                  [
                    ["Total", stats.total],
                    ["Open for sale", stats.available],
                    ["Sold", stats.sold],
                    ["Available", stats.available],
                    ["Reserved", stats.held],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-2.5 text-center"
                  >
                    <div className="text-[16px] font-black text-[#D60D26] leading-none mb-1">
                      {String(value).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 leading-tight">{label}</div>
                  </div>
                ))}
              </div>

              {editingSeats ? (
                <div className="space-y-3 rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between text-[13px] font-bold">
                    <span className="text-slate-600">Total seats</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => bumpSeats(-1)}
                        className="text-[#D60D26] font-black text-lg leading-none"
                      >
                        ‹
                      </button>
                      <span className="w-8 text-center text-slate-800">{editSeats}</span>
                      <button
                        type="button"
                        onClick={() => bumpSeats(1)}
                        className="text-[#D60D26] font-black text-lg leading-none"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                  <label className="block text-[12px] font-bold text-slate-500">
                    Price (INR)
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 pl-7 text-[14px] font-bold"
                      />
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-2.5 text-[13px]">
                  <div className="flex justify-between border-b border-slate-100 py-2">
                    <span className="text-slate-500">Total seats</span>
                    <span className="font-bold text-slate-800">{stats.total}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-2">
                    <span className="text-slate-500">Open for sale</span>
                    <span className="font-bold text-slate-800">{stats.available}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-2">
                    <span className="text-slate-500">Sold seats</span>
                    <span className="font-bold text-slate-800">{stats.sold}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-2">
                    <span className="text-slate-500">Available seats</span>
                    <span className="font-bold text-slate-800">{stats.available}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Reserved seats</span>
                    <span className="font-bold text-slate-800">{stats.held}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="font-bold text-[15px] text-slate-800 mb-2">Price</div>
              <label className="flex items-center gap-2 text-[#D60D26] font-bold text-[12px] mb-2 cursor-default">
                <span className="relative flex h-4 w-4 items-center justify-center">
                  <span className="absolute inset-0 rounded-full border-2 border-[#D60D26]" />
                  <span className="h-2 w-2 rounded-full bg-[#D60D26]" />
                </span>
                ONE WAY
              </label>
              <div className="text-[12px] font-bold text-slate-500 mb-1">Price (INR)</div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="text"
                  readOnly={!editingSeats}
                  value={editingSeats ? editPrice : Number(flight.price).toFixed(2)}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className={`w-full border border-slate-200 rounded-lg p-3.5 pl-8 text-[14px] font-bold text-slate-800 ${
                    editingSeats ? "bg-white" : "bg-slate-50"
                  }`}
                />
              </div>
            </div>

            {saveMsg && (
              <p
                className={`text-xs text-center font-medium ${
                  saveMsg.toLowerCase().includes("save") ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {saveMsg}
              </p>
            )}
          </div>
        )}

        {/* ─── BOOKING (Figma list format) ─── */}
        {activeTab === "Booking" && (
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <div className="font-bold text-[15px] text-slate-800 mb-4">
              Booking({flightTickets.length})
            </div>
            {flightTickets.length === 0 ? (
              <p className="text-slate-500 text-[13px] font-medium">No bookings for this flight yet.</p>
            ) : (
              <div className="space-y-3">
                {flightTickets.map((t) => {
                  const pax = passengerBookingLabel(t.passengers_data);
                  const pnr =
                    t.pnr_number || t.booking_ref || t.id.slice(0, 6).toUpperCase();
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (onTicketSelect) {
                          onTicketSelect(t);
                          return;
                        }
                        router.push(`/my-booking/${t.id}`);
                      }}
                      className="w-full text-left hover:bg-slate-50 p-3.5 rounded-xl border border-slate-100"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-bold text-slate-800 text-[14px]">
                          {pnr}{" "}
                          <span className="text-slate-500 font-semibold">
                            ({pax.count} PAX)
                          </span>
                        </div>
                      </div>
                      <div className="text-[12px] text-slate-500 mt-1 uppercase tracking-wide">
                        {formatInrPortal(t.total_amount || 0)} • {pax.names}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── PNR BOOKING ─── */}
        {activeTab === "PNR Booking" && (
          <div className="flex-1 overflow-y-auto p-6 bg-white space-y-5">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="text-[12px] font-bold text-slate-500 uppercase">Group PNR</div>
              <div className="text-[18px] font-black text-slate-800 mt-1">
                {groupPnrFromId(flight.id)}
              </div>
              <div className="text-[12px] text-slate-500 mt-2">
                {flight.origin} → {flight.destination} · {formatShortDate(flight.departure_datetime)}
              </div>
            </div>

            <div className="rounded-xl border border-[#D60D26]/20 bg-rose-50/30 p-4 space-y-3">
              <div className="flex items-center gap-2 font-bold text-[14px] text-slate-800">
                <Plus className="w-4 h-4 text-[#D60D26]" /> Add PNR
              </div>
              <input
                type="text"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                placeholder="PNR Number *"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] font-bold"
              />
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="Passenger Name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[14px]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  placeholder="Ticket Number"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px]"
                />
                <input
                  type="number"
                  value={pnrAmount}
                  onChange={(e) => setPnrAmount(e.target.value)}
                  placeholder="Amount (₹)"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px]"
                />
              </div>
              <button
                type="button"
                disabled={addingPnr || !pnrInput.trim()}
                onClick={() => void submitAddPnr()}
                className="w-full bg-[#D60D26] hover:bg-[#b80b20] disabled:opacity-50 text-white font-bold py-2.5 rounded-full text-[14px]"
              >
                {addingPnr ? "Adding…" : "Add PNR"}
              </button>
              {pnrMsg && (
                <p
                  className={`text-xs text-center font-medium ${
                    pnrSuccess ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {pnrMsg}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                PNR Booking Details
              </div>
              {flightTickets.length === 0 ? (
                <p className="text-slate-500 text-[13px]">No PNR bookings linked yet.</p>
              ) : (
                flightTickets.map((t) => {
                  const pax = passengerBookingLabel(t.passengers_data);
                  return (
                    <button
                      key={`pnr-${t.id}`}
                      type="button"
                      onClick={() => onTicketSelect?.(t)}
                      className="w-full text-left rounded-xl border border-slate-100 p-4 hover:bg-slate-50"
                    >
                      <div className="font-bold text-[#D60D26] underline underline-offset-2">
                        {t.pnr_number || t.booking_ref || "Pending PNR"}
                      </div>
                      <div className="text-[13px] font-bold text-slate-800 mt-1">
                        {pax.names} ({pax.count} PAX)
                      </div>
                      <div className="text-[12px] text-slate-500 mt-1">
                        {t.status} · {formatInrPortal(t.total_amount || 0)}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Figma: Change seats voloume modal (exact copy) */}
      {seatsModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(18,17,33,0.7)] p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[441px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#fbe6e8] px-[30px] py-5 flex items-center justify-between">
              <h3 className="font-bold text-[18px] text-[#121121] tracking-[0.36px]">
                Change seats voloume
              </h3>
              <button
                type="button"
                onClick={() => setSeatsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/70"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="px-[30px] py-7 space-y-6">
              <div className="space-y-2">
                <div className="text-[16px] font-semibold text-[rgba(18,17,33,0.8)]">
                  If you want go with new GPNR
                </div>
                <p className="text-[14px] font-medium text-[rgba(18,17,33,0.5)]">
                  To change the seat volume:{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setSeatsModalOpen(false);
                      setActiveTab("PNR Booking");
                    }}
                    className="text-[#d60d26] underline underline-offset-2"
                  >
                    Add PNR
                  </button>
                </p>
              </div>
              <div className="border-t border-slate-200" />
              <div className="space-y-2">
                <div className="text-[16px] font-semibold text-[rgba(18,17,33,0.8)]">
                  If you want go with same GPNR
                </div>
                <p className="text-[14px] font-medium text-[rgba(18,17,33,0.5)]">
                  To change the seat volume:{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setSeatsModalOpen(false);
                      if (onEditInventory) {
                        onEditInventory();
                        return;
                      }
                      setEditingSeats(true);
                    }}
                    className="text-[#2b6eff] underline underline-offset-2"
                  >
                    Edit now
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
