"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Plane,
  X,
  Pencil,
  Luggage,
  ChevronDown,
  ChevronUp,
  Clock,
  Ban,
  RefreshCw,
  CircleDollarSign,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  cityCountryFromCode,
  cityLabelFromCode,
  formatDisplayDateLong,
  formatGenderLabel,
  formatInrPortal,
  formatPassengerDisplayName,
  formatShortDate,
  groupPnrFromId,
  groupPnrBookingRows,
  listingStatus,
  passengerBookingLabel,
  salesClosingFromEnding,
  salesEndingFromClosing,
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
import Link from "next/link";

function formatTicketModalSubtitle(ticket: OfflineTicketRow, fallbackOrigin: string, fallbackDest: string) {
  const origin = (ticket.origin || fallbackOrigin || "").toUpperCase();
  const dest = (ticket.destination || fallbackDest || "").toUpperCase();
  const iso = ticket.departure_datetime;
  if (!iso) return `${origin} to ${dest}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return `${origin} to ${dest}`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${origin} to ${dest}, ${d.getFullYear()} ${months[d.getMonth()]} ${d.getDate()}, ${hh}:${mm}`;
}

function formatPassengerBorn(dob?: string | null) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function statusLabel(status?: string) {
  const s = (status || "").toUpperCase();
  if (s === "CONFIRMED") return "Confirmed";
  if (s === "PENDING") return "Pending";
  if (s === "CANCELLED") return "Cancelled";
  return status || "—";
}

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
  const [selectedTicket, setSelectedTicket] = useState<OfflineTicketRow | null>(null);
  const [expandedPassengerIdx, setExpandedPassengerIdx] = useState<number | null>(null);
  const [pnrCopied, setPnrCopied] = useState(false);
  const [editingSeats, setEditingSeats] = useState(false);
  const [editSeats, setEditSeats] = useState(String(flight.seats_available ?? 0));
  const [editPrice, setEditPrice] = useState(String(Number(flight.price).toFixed(2)));
  const [editingBaggage, setEditingBaggage] = useState(false);
  const [editCheckIn, setEditCheckIn] = useState(flight.baggage_check_in || "15 kg");
  const [editHand, setEditHand] = useState(flight.baggage_hand || "7 kg");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [salesEndHours, setSalesEndHours] = useState("56");
  const [salesEndUnit, setSalesEndUnit] = useState<"hours" | "days">("hours");
  const [policyTexts, setPolicyTexts] = useState({
    cancellation: "",
    change: "",
    refund: "",
  });
  const [openPolicy, setOpenPolicy] = useState<"cancellation" | "change" | "refund" | null>(null);

  useEffect(() => {
    setEditSeats(String(flight.seats_available ?? 0));
    setEditPrice(String(Number(flight.price).toFixed(2)));
    setEditingSeats(false);
    setEditingBaggage(false);
    setEditCheckIn(flight.baggage_check_in || "15 kg");
    setEditHand(flight.baggage_hand || "7 kg");
    setSaveMsg(null);
    setShowFlightDetails(false);
    setSeatsModalOpen(false);
    setSelectedTicket(null);
    setExpandedPassengerIdx(null);
    setPnrCopied(false);
    setOpenPolicy(null);
    setPolicyTexts({
      cancellation: flight.policies?.cancellation || "",
      change: flight.policies?.change || "",
      refund: flight.policies?.refund || "",
    });
    const ending = salesEndingFromClosing(
      flight.departure_datetime,
      flight.sales_closing_datetime
    );
    setSalesEndHours(ending.amount);
    setSalesEndUnit(ending.unit);
  }, [
    flight.id,
    flight.price,
    flight.seats_available,
    flight.baggage_check_in,
    flight.baggage_hand,
    flight.policies,
    flight.departure_datetime,
    flight.sales_closing_datetime,
  ]);

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

  const pnrBookingGroups = useMemo(
    () => groupPnrBookingRows(flightTickets),
    [flightTickets]
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

  const salesCloseLabel = useMemo(() => {
    const dep = new Date(flight.departure_datetime);
    if (Number.isNaN(dep.getTime())) return "—";
    const amount = Number(salesEndHours) || 0;
    const ms = salesEndUnit === "days" ? amount * 24 * 60 * 60 * 1000 : amount * 60 * 60 * 1000;
    const closeAt = new Date(dep.getTime() - ms);
    return closeAt.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });
  }, [flight.departure_datetime, salesEndHours, salesEndUnit]);

  const saveSeatsAndPrice = async (extra?: {
    policies?: Record<string, string>;
    includeSalesClosing?: boolean;
    baggage?: { checkIn: string; hand: string };
  }) => {
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
      const body: Record<string, unknown> = { seats_available: seats, price };
      if (extra?.policies) body.policies = extra.policies;
      if (extra?.baggage) {
        body.baggage_check_in = extra.baggage.checkIn.trim() || "15 kg";
        body.baggage_hand = extra.baggage.hand.trim() || "7 kg";
      }
      if (extra?.includeSalesClosing !== false) {
        const closing = salesClosingFromEnding(
          flight.departure_datetime,
          Number(salesEndHours) || 0,
          salesEndUnit
        );
        body.sales_closing_datetime = closing;
      }
      const res = await fetch(`${api}/flights/inventory/${flight.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { detail?: string }).detail || `Save failed (${res.status})`);
      setSaveMsg("Saved.");
      setEditingSeats(false);
      setEditingBaggage(false);
      setOpenPolicy(null);
      onInventoryUpdated?.();
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveSalesEnding = async () => {
    await saveSeatsAndPrice({ includeSalesClosing: true });
  };

  const saveBaggage = async () => {
    await saveSeatsAndPrice({
      baggage: { checkIn: editCheckIn, hand: editHand },
    });
  };

  const savePolicy = async (key: "cancellation" | "change" | "refund") => {
    const policies: Record<string, string> = {};
    for (const k of ["cancellation", "change", "refund"] as const) {
      const val = (policyTexts[k] || "").trim();
      if (val) policies[k] = val;
    }
    await saveSeatsAndPrice({ policies });
  };

  const bumpSeats = (delta: number) => {
    const next = Math.max(0, Number(editSeats || 0) + delta);
    setEditSeats(String(next));
  };

  const policyRows = [
    { key: "cancellation" as const, label: "Cancellation policy", Icon: Ban },
    { key: "change" as const, label: "Change policy", Icon: RefreshCw },
    { key: "refund" as const, label: "Refund policy", Icon: CircleDollarSign },
  ];

  return (
    <>
      <div className="w-full xl:w-[360px] bg-white border-l border-slate-200 fixed top-0 xl:top-[96px] right-0 bottom-0 z-50 xl:z-40 flex flex-col shadow-xl animate-in slide-in-from-right duration-300">
        {/* Header — compact Figma slider */}
        <div className="px-4 py-3.5 bg-white border-b border-slate-200 flex items-start justify-between shrink-0">
          <div className="min-w-0 pr-2">
            <div className="font-bold text-[15px] text-slate-800 flex items-center gap-1.5">
              <span className="truncate">{originCity}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D60D26] shrink-0" />
              <span className="truncate">{destCity}</span>
            </div>
            <div className="text-[12px] text-slate-500 mt-0.5 truncate">
              {formatDisplayDateLong(flight.departure_datetime)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-slate-100 p-1 rounded-full transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-slate-700" />
          </button>
        </div>

        <div className="flex items-center border-b border-slate-200 shrink-0 overflow-x-auto bg-white">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-1.5 py-2.5 font-bold text-[11px] whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "text-[#D60D26] border-b-2 border-[#D60D26] bg-[#FBE6E8]/60"
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
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {segments.map((segment, index) => {
                const isLast = index === segments.length - 1;
                return (
                  <div key={`${flight.id}-seg-${index}`} className="mb-1">
                    <div className="font-bold text-[14px] text-slate-800 mb-2">
                      {cityCountryFromCode(segment.origin, segment.origin_city)}
                    </div>

                    <div className="flex gap-3 relative">
                      <div className="flex flex-col items-center relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-800 relative z-10 shrink-0" />
                        <div className="w-px flex-1 border-l border-dashed border-slate-300 my-1 min-h-[64px]" />
                        {isLast && (
                          <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-800 bg-white relative z-10 shrink-0" />
                        )}
                      </div>

                      <div className="flex-1 pb-3">
                        <div className="text-[12px] text-slate-700 font-bold">
                          {formatClock(segment.departure_datetime)}{" "}
                          <span className="text-slate-400 font-medium">
                            ({utcOffsetLabel(segment.departure_datetime)})
                          </span>
                          <span className="text-[#D60D26] mx-1">•</span>
                          {segment.origin}
                          <span className="text-[#D60D26] mx-1">•</span>
                          {segment.origin_terminal || "Terminal"}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 py-3">
                          <div className="w-7 h-7 bg-[#D60D26] rounded flex items-center justify-center shrink-0">
                            <Plane className="w-3.5 h-3.5 text-white -rotate-45" />
                          </div>
                          <img
                            src={`/airlines/${flight.airline_code || "AI"}.png`}
                            alt={flight.airline_name || flight.airline_code}
                            className="h-5 w-5 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          {stops > 0 && (
                            <span className="bg-[#377BD7] text-white text-[10px] font-black px-2 py-0.5 rounded">
                              {stops} stop{stops > 1 ? "s" : ""}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowFlightDetails((v) => !v)}
                            className="text-[#D60D26] font-bold text-[12px] underline underline-offset-2 inline-flex items-center gap-1"
                          >
                            See flight details
                            {showFlightDetails ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {showFlightDetails && (
                          <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-600 space-y-1">
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
                            <div className="text-[12px] text-slate-700 font-bold mb-2">
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
                            <div className="font-bold text-[14px] text-slate-800">
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

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex flex-col items-center gap-1.5 shrink-0">
              {allowBookNow ? (
                <>
                  <button
                    type="button"
                    disabled={bookingBusy}
                    onClick={() => void bookNow()}
                    className="w-full bg-[#D60D26] hover:bg-[#30060F] text-white font-bold py-2.5 rounded-full text-[13px] disabled:opacity-50"
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
                    className="text-slate-400 font-bold flex items-center gap-2 text-[13px] cursor-not-allowed"
                  >
                    Cancel Flight <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-[11px] text-slate-400">
                    Only open &amp; pending flight can be canceled
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* ─── INVENTORY (Figma: Price + Sales ending + Policies) ─── */}
        {activeTab === "Inventory" && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 bg-white">
            {onPublishToggle && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <div>
                  <div className="text-[13px] font-bold text-slate-800">
                    {flight.is_published === false ? "Closed" : "Open for sale"}
                  </div>
                  <div className="text-[10px] text-slate-500">Marketplace listing</div>
                </div>
                <button
                  type="button"
                  disabled={publishing}
                  onClick={onPublishToggle}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
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
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-[14px] text-slate-800">Price</div>
                <button
                  type="button"
                  onClick={() => {
                    if (editingSeats) void saveSeatsAndPrice();
                    else setEditingSeats(true);
                  }}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-[#D60D26]"
                >
                  <Pencil className="w-3 h-3" /> {editingSeats ? (saving ? "Saving…" : "Save") : "Edit"}
                </button>
              </div>
              <label className="flex items-center gap-2 text-[#D60D26] font-bold text-[11px] mb-2 cursor-default">
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <span className="absolute inset-0 rounded-full border-2 border-[#D60D26]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D60D26]" />
                </span>
                ONE WAY
              </label>
              <div className="text-[11px] font-bold text-slate-500 mb-1">Price (INR)</div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[13px]">
                  ₹
                </span>
                <input
                  type="text"
                  readOnly={!editingSeats}
                  value={editingSeats ? editPrice : Number(flight.price).toFixed(2)}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className={`w-full border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 text-[13px] font-bold text-slate-800 ${
                    editingSeats ? "bg-white" : "bg-slate-50"
                  }`}
                />
              </div>
              {editingSeats && (
                <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-bold">
                  <span className="text-slate-600">Total seats</span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => bumpSeats(-1)} className="text-[#D60D26] font-black text-base">
                      ‹
                    </button>
                    <span className="w-7 text-center text-slate-800">{editSeats}</span>
                    <button type="button" onClick={() => bumpSeats(1)} className="text-[#D60D26] font-black text-base">
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="font-bold text-[14px] text-slate-800 mb-1">Sales ending</div>
              <div className="text-[12px] text-slate-500 mb-2">End selling before departure</div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  min={0}
                  value={salesEndHours}
                  onChange={(e) => setSalesEndHours(e.target.value)}
                  className="w-16 border border-slate-200 rounded-lg px-2.5 py-2 text-[13px] font-bold text-slate-800"
                />
                <select
                  value={salesEndUnit}
                  onChange={(e) => setSalesEndUnit(e.target.value as "hours" | "days")}
                  className="border border-slate-200 rounded-lg px-2.5 py-2 text-[13px] font-bold text-slate-700 bg-white"
                >
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveSalesEnding()}
                  className="ml-auto text-[11px] font-bold text-[#2B7BB9] hover:underline disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
              <div className="flex items-start gap-1.5 text-[11px] text-slate-500 font-medium leading-snug">
                <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                <span>Sales close at {salesCloseLabel}</span>
              </div>
            </div>

            <div>
              <div className="font-bold text-[14px] text-slate-800 mb-2">Policies</div>
              <div className="rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {policyRows.map(({ key, label, Icon }) => {
                  const hasValue = Boolean(policyTexts[key]?.trim());
                  const isOpen = openPolicy === key;
                  return (
                    <div key={key} className="bg-white">
                      <div className="flex items-center gap-2.5 px-3 py-2.5 border-l-4 border-slate-900">
                        <Icon className="w-4 h-4 text-slate-600 shrink-0" />
                        <div className="flex-1 min-w-0 text-[13px] font-bold text-slate-700 truncate">
                          {label}
                        </div>
                        <button
                          type="button"
                          onClick={() => setOpenPolicy(isOpen ? null : key)}
                          className="inline-flex items-center gap-1 text-[#D60D26] font-bold text-[12px] shrink-0"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#D60D26] text-white text-[12px] leading-none flex items-center justify-center">
                            {isOpen ? "−" : "+"}
                          </span>
                          {hasValue ? (isOpen ? "Hide" : "Edit") : "Add"}
                        </button>
                      </div>
                      {isOpen && (
                        <div className="px-3 pb-3 space-y-2">
                          <textarea
                            value={policyTexts[key]}
                            onChange={(e) =>
                              setPolicyTexts((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            rows={3}
                            placeholder={`Add ${label.toLowerCase()}...`}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] text-slate-700 outline-none"
                          />
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void savePolicy(key)}
                            className="w-full rounded-full bg-[#D60D26] hover:bg-[#30060F] text-white font-bold py-2 text-[12px] disabled:opacity-50"
                          >
                            {saving ? "Saving…" : "Save policy"}
                          </button>
                        </div>
                      )}
                      {hasValue && !isOpen && (
                        <p className="px-3 pb-2.5 text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                          {policyTexts[key]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-[14px] text-slate-800">Tickets Volume</div>
                <button
                  type="button"
                  onClick={() => {
                    // GPNR / Add PNR choice only on Inventory; Flight edits seats inline
                    if (drawerVariant === "inventory") {
                      setSeatsModalOpen(true);
                      return;
                    }
                    if (editingSeats) void saveSeatsAndPrice();
                    else setEditingSeats(true);
                  }}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-[#D60D26]"
                >
                  <Pencil className="w-3 h-3" />{" "}
                  {drawerVariant !== "inventory" && editingSeats
                    ? saving
                      ? "Saving…"
                      : "Save"
                    : "Edit"}
                </button>
              </div>
              {drawerVariant !== "inventory" && editingSeats && (
                <div className="mb-2 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-bold">
                  <span className="text-slate-600">Total seats</span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => bumpSeats(-1)} className="text-[#D60D26] font-black text-base">
                      ‹
                    </button>
                    <span className="w-7 text-center text-slate-800">{editSeats}</span>
                    <button type="button" onClick={() => bumpSeats(1)} className="text-[#D60D26] font-black text-base">
                      ›
                    </button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-5 gap-1.5">
                {(
                  [
                    ["Total", stats.total],
                    ["Open", stats.available],
                    ["Sold", stats.sold],
                    ["Avail.", stats.available],
                    ["Held", stats.held],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-slate-200 bg-slate-50 px-1 py-2 text-center"
                  >
                    <div className="text-[14px] font-black text-[#D60D26] leading-none mb-1">
                      {String(value).padStart(2, "0")}
                    </div>
                    <div className="text-[8px] font-bold text-slate-400 leading-tight">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-[14px] text-slate-800">Baggage</div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    if (editingBaggage) void saveBaggage();
                    else {
                      setEditCheckIn(
                        (flight.baggage_check_in || "15 kg").replace(/\s*,\s*Included$/i, "").trim()
                      );
                      setEditHand(
                        (flight.baggage_hand || "7 kg").replace(/\s*,\s*Included$/i, "").trim()
                      );
                      setEditingBaggage(true);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D60D26] hover:underline disabled:opacity-50"
                >
                  <Pencil className="w-3 h-3" />{" "}
                  {editingBaggage ? (saving ? "Saving…" : "Save") : "Edit"}
                </button>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-bold text-slate-600 mb-1.5">
                <Luggage className="w-3.5 h-3.5 text-slate-400" />
                Checked baggage
              </div>
              <input
                type="text"
                readOnly={!editingBaggage}
                value={
                  editingBaggage
                    ? editCheckIn
                    : `${flight.baggage_check_in || "15 kg"}, Included`
                }
                onChange={(e) => setEditCheckIn(e.target.value)}
                onFocus={() => {
                  if (!editingBaggage) {
                    setEditCheckIn(
                      (flight.baggage_check_in || "15 kg").replace(/\s*,\s*Included$/i, "").trim()
                    );
                    setEditHand(
                      (flight.baggage_hand || "7 kg").replace(/\s*,\s*Included$/i, "").trim()
                    );
                    setEditingBaggage(true);
                  }
                }}
                placeholder="e.g. 15 kg"
                className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-600 mb-2 outline-none ${
                  editingBaggage
                    ? "bg-white focus:border-[#D60D26] cursor-text"
                    : "bg-slate-50 cursor-pointer"
                }`}
              />
              <div className="flex items-center gap-2 text-[12px] font-bold text-slate-600 mb-1.5">
                <Luggage className="w-3.5 h-3.5 text-slate-400" />
                Hand baggage
              </div>
              <input
                type="text"
                readOnly={!editingBaggage}
                value={
                  editingBaggage
                    ? editHand
                    : `${flight.baggage_hand || "7 kg"}, Included`
                }
                onChange={(e) => setEditHand(e.target.value)}
                onFocus={() => {
                  if (!editingBaggage) {
                    setEditCheckIn(
                      (flight.baggage_check_in || "15 kg").replace(/\s*,\s*Included$/i, "").trim()
                    );
                    setEditHand(
                      (flight.baggage_hand || "7 kg").replace(/\s*,\s*Included$/i, "").trim()
                    );
                    setEditingBaggage(true);
                  }
                }}
                placeholder="e.g. 7 kg"
                className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-600 outline-none ${
                  editingBaggage
                    ? "bg-white focus:border-[#D60D26] cursor-text"
                    : "bg-slate-50 cursor-pointer"
                }`}
              />
            </div>

            {saveMsg && (
              <p
                className={`text-[11px] text-center font-medium ${
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
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            <div className="font-bold text-[14px] text-slate-800 mb-3">
              Booking({flightTickets.length})
            </div>
            {flightTickets.length === 0 ? (
              <p className="text-slate-500 text-[12px] font-medium">No bookings for this flight yet.</p>
            ) : (
              <div className="space-y-2">
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
                        setExpandedPassengerIdx(null);
                        setPnrCopied(false);
                        setSelectedTicket(t);
                      }}
                      className="w-full text-left hover:bg-slate-50 p-2.5 rounded-lg border border-slate-100"
                    >
                      <div className="font-bold text-slate-800 text-[13px]">
                        {pnr}{" "}
                        <span className="text-slate-500 font-semibold">
                          ({pax.count} PAX)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wide">
                        {formatInrPortal(t.total_amount || 0)} • {pax.names}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── PNR BOOKING (Figma: MTDPNR groups + Name / Airline PNR / Ticket No.) ─── */}
        {activeTab === "PNR Booking" && (
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="px-4 pt-4 pb-2">
              <div className="font-bold text-[14px] text-slate-900">
                PNR Booking (GPNR→{groupPnrFromId(flight.id, flight.group_pnr)})
              </div>
            </div>

            <div className="grid grid-cols-[1.4fr_1fr_1.1fr] gap-2 px-4 pb-2 text-[11px] font-bold text-slate-400">
              <div>Name</div>
              <div>Airline PNR</div>
              <div>Ticket No.</div>
            </div>

            {pnrBookingGroups.length === 0 ? (
              <p className="px-4 py-6 text-slate-500 text-[12px] font-medium">
                No PNR bookings linked yet.
              </p>
            ) : (
              <div className="pb-4">
                {pnrBookingGroups.map((group) => (
                  <div key={group.mtdPnr} className="mb-0.5">
                    <div className="bg-[#F5F6F8] px-4 py-2 text-[12px] font-bold text-slate-700">
                      MTDPNR: {group.mtdPnr}
                    </div>
                    {group.rows.map((row) => (
                      <button
                        key={row.key}
                        type="button"
                        onClick={() => {
                          if (onTicketSelect) {
                            onTicketSelect(row.ticket);
                            return;
                          }
                          setExpandedPassengerIdx(null);
                          setPnrCopied(false);
                          setSelectedTicket(row.ticket);
                        }}
                        className="w-full grid grid-cols-[1.4fr_1fr_1.1fr] gap-2 px-4 py-2.5 text-left text-[12px] border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <div className="font-bold text-slate-800 truncate">{row.name}</div>
                        <div className="font-medium text-slate-700">{row.airlinePnr}</div>
                        <div className="font-medium text-slate-700">{row.ticketNo}</div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking details modal — open from Booking tab; Check reservation → ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 pt-20 sm:pt-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedTicket(null)}
            aria-hidden
          />
          <div className="relative bg-white rounded-2xl w-full max-w-[520px] shadow-2xl overflow-hidden flex flex-col max-h-[min(85vh,calc(100dvh-5.5rem))]">
            <div
              className={`p-5 sm:p-6 relative shrink-0 border-b ${
                selectedTicket.status === "CONFIRMED"
                  ? "bg-[#EAF7EE] border-emerald-100"
                  : selectedTicket.status === "CANCELLED"
                    ? "bg-rose-50 border-rose-100"
                    : "bg-[#F2FBFF] border-slate-100"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-500 hover:bg-white/50 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-baseline gap-2 mb-1 pr-8">
                <span className="font-extrabold text-[20px] text-slate-900">
                  {(
                    selectedTicket.pnr_number ||
                    selectedTicket.booking_ref ||
                    selectedTicket.id.replace(/-/g, "").slice(0, 6)
                  ).toUpperCase()}
                </span>
                <span
                  className={`font-bold text-[16px] ${
                    selectedTicket.status === "CONFIRMED"
                      ? "text-emerald-700"
                      : selectedTicket.status === "CANCELLED"
                        ? "text-[#D60D26]"
                        : "text-slate-600"
                  }`}
                >
                  {statusLabel(selectedTicket.status)}
                </span>
              </div>
              <div className="text-slate-600 font-medium text-[13px]">
                {formatTicketModalSubtitle(selectedTicket, flight.origin, flight.destination)}
              </div>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto bg-white flex-1 min-h-0 space-y-7">
              <div>
                <div className="font-bold text-[15px] text-slate-800 mb-4">General information</div>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                      <span className="w-3.5 h-3.5 rounded-[3px] bg-[#D60D26] shrink-0" />
                      MTDPNR reference
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const value = (
                          selectedTicket.booking_ref ||
                          selectedTicket.pnr_number ||
                          selectedTicket.id.replace(/-/g, "").slice(0, 6)
                        ).toUpperCase();
                        try {
                          await navigator.clipboard.writeText(value);
                          setPnrCopied(true);
                          window.setTimeout(() => setPnrCopied(false), 1600);
                        } catch {
                          /* ignore */
                        }
                      }}
                      className="inline-flex items-center gap-1.5 font-bold text-[13px] text-[#2B7BB9] underline underline-offset-2 hover:text-[#1f5f8f]"
                    >
                      {(
                        selectedTicket.booking_ref ||
                        selectedTicket.pnr_number ||
                        selectedTicket.id.replace(/-/g, "").slice(0, 6)
                      ).toUpperCase()}
                      {pnrCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                      <Luggage className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      Reservation
                    </div>
                    <Link
                      href={`/my-booking/${selectedTicket.id}`}
                      className="inline-flex items-center gap-1.5 font-bold text-[13px] text-[#2B7BB9] underline underline-offset-2 hover:text-[#1f5f8f]"
                    >
                      Check reservation
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[13px] font-bold text-slate-600">Flight</div>
                    <div className="font-bold text-slate-800 text-[13px] text-right">
                      {selectedTicket.airline_name ||
                        selectedTicket.airline_code ||
                        flight.airline_name ||
                        flight.airline_code}{" "}
                      · {selectedTicket.flight_number || flight.flight_number}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[13px] font-bold text-slate-600">Cabin</div>
                    <div className="font-bold text-slate-800 text-[13px]">
                      {selectedTicket.cabin_class || flight.cabin_class || "Economy"}
                    </div>
                  </div>
                  {(selectedTicket.pnr_number || selectedTicket.ticket_number) && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[13px] font-bold text-slate-600">Airline PNR / Ticket</div>
                      <div className="font-bold text-slate-800 text-[13px] text-right">
                        {[selectedTicket.pnr_number, selectedTicket.ticket_number]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[13px] font-bold text-slate-600">Ticket cost</div>
                    <div className="font-bold text-slate-800 text-[13px]">
                      {formatInrPortal(
                        selectedTicket.total_amount != null && selectedTicket.total_amount !== ""
                          ? selectedTicket.total_amount
                          : Number(flight.price) *
                              Math.max(selectedTicket.passengers_data?.length || 1, 1)
                      )}
                    </div>
                  </div>
                  {(selectedTicket.basic_amount != null || selectedTicket.tax_amount != null) && (
                    <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 space-y-1.5">
                      {selectedTicket.basic_amount != null && (
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-slate-500 font-medium">Base fare</span>
                          <span className="font-bold text-slate-700">
                            {formatInrPortal(selectedTicket.basic_amount)}
                          </span>
                        </div>
                      )}
                      {selectedTicket.tax_amount != null && (
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-slate-500 font-medium">Taxes</span>
                          <span className="font-bold text-slate-700">
                            {formatInrPortal(selectedTicket.tax_amount)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {(selectedTicket.passengers_data?.length || 0) > 0 && (
                <div>
                  <div className="font-bold text-[15px] text-slate-800 mb-4">Passengers</div>
                  <div className="space-y-3">
                    {selectedTicket.passengers_data!.map((pax, idx) => {
                      const open = expandedPassengerIdx === idx;
                      const gender = formatGenderLabel(pax.gender);
                      const born = formatPassengerBorn(pax.dob || pax.date_of_birth);
                      const meta = [
                        gender !== "—" ? gender : null,
                        born ? `Born ${born}` : null,
                      ]
                        .filter(Boolean)
                        .join(" • ");
                      return (
                        <div
                          key={`${selectedTicket.id}-pax-${idx}`}
                          className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedPassengerIdx(open ? null : idx)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-[14px] text-slate-800 truncate">
                                {formatPassengerDisplayName(pax)}
                              </div>
                              {meta && (
                                <div className="text-[12px] text-slate-500 font-medium mt-0.5">
                                  {meta}
                                </div>
                              )}
                            </div>
                            {open ? (
                              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </button>
                          {open && (
                            <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-4 text-[12px]">
                              <div>
                                <div className="font-bold text-slate-700 mb-2">Basic information</div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-slate-400 mb-0.5">Date of birth</div>
                                    <div className="font-bold text-slate-800">
                                      {pax.dob || pax.date_of_birth || "—"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-slate-400 mb-0.5">Nationality</div>
                                    <div className="font-bold text-slate-800">
                                      {pax.nationality || "—"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="font-bold text-slate-700 mb-2">Passport details</div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-slate-400 mb-0.5">Passport number</div>
                                    <div className="font-bold text-slate-800">
                                      {pax.passport_number || "—"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-slate-400 mb-0.5">Expiry date</div>
                                    <div className="font-bold text-slate-800">
                                      {pax.passport_expiry || "—"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-slate-400 mb-0.5">Country issue</div>
                                    <div className="font-bold text-slate-800">
                                      {pax.passport_country || "—"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-slate-400 mb-0.5">Ticket No.</div>
                                    <div className="font-bold text-slate-800">
                                      {pax.ticket_number || selectedTicket.ticket_number || "—"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <div className="font-bold text-[15px] text-slate-800 mb-4">Ancillaries</div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Luggage className="w-5 h-5 text-slate-500" />
                    <div>
                      <div className="font-bold text-slate-700 text-[14px]">Checked baggage</div>
                      <div className="text-[12px] text-slate-400 font-medium mt-0.5">
                        {(() => {
                          const bag =
                            selectedTicket.baggage_check_in || flight.baggage_check_in || "15 kg";
                          const paxCount = Math.max(
                            selectedTicket.passengers_data?.length || 1,
                            1
                          );
                          return `${paxCount} * ${bag} • Free`;
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-[#2B7BB9] text-[12px] tracking-wide">INCLUDED</div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Luggage className="w-5 h-5 text-slate-500" />
                    <div>
                      <div className="font-bold text-slate-700 text-[14px]">Hand baggage</div>
                      <div className="text-[12px] text-slate-400 font-medium mt-0.5">
                        {(() => {
                          const bag =
                            selectedTicket.baggage_hand || flight.baggage_hand || "7 kg";
                          const paxCount = Math.max(
                            selectedTicket.passengers_data?.length || 1,
                            1
                          );
                          return `${paxCount} * ${bag} • Free`;
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-[#2B7BB9] text-[12px] tracking-wide">INCLUDED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Figma: Change seats volume — Inventory only (Add PNR / same GPNR) */}
      {seatsModalOpen && drawerVariant === "inventory" && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(18,17,33,0.7)] p-4">
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
                      router.push("/sale/inventory/new");
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
