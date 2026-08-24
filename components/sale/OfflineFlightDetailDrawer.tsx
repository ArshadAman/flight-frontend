"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Plane,
  X,
  Save,
  Plus,
} from "lucide-react";
import {
  formatDisplayDateLong,
  formatFarePortal,
  formatTimeRange,
  groupPnrFromId,
  listingStatus,
  seatStats,
  type OfflineInventoryRow,
  type OfflineTicketRow,
} from "@/lib/sale/offlinePortal";
import { saveBookingDraft } from "@/lib/booking";
import { SALE_BOOK_SEAT_PATH } from "@/lib/sale/offlineBookFlow";
import { forSaleItemToFlight, type ForSaleInventoryItem } from "@/lib/forSale";
import { unwrapData } from "@/lib/apiEnvelope";
import { getPublicApiUrl } from "@/lib/apiConfig";
import { useAuth } from "@/context/AuthContext";

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

  // Edit price + sales settings state
  const [editPrice, setEditPrice] = useState(String(Number(flight.price).toFixed(2)));
  const [salesClosingEnabled, setSalesClosingEnabled] = useState(
    !!(flight as OfflineInventoryRow & { sales_closing_datetime?: string | null }).sales_closing_datetime
  );
  const rawClosing = (flight as OfflineInventoryRow & { sales_closing_datetime?: string | null }).sales_closing_datetime;
  const [salesClosingDatetime, setSalesClosingDatetime] = useState(
    rawClosing ? rawClosing.slice(0, 16) : ""
  );
  const [savingPrice, setSavingPrice] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Add PNR state
  const [pnrInput, setPnrInput] = useState("");
  const [passengerName, setPassengerName] = useState("");
  const [pnrAmount, setPnrAmount] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [addingPnr, setAddingPnr] = useState(false);
  const [pnrMsg, setPnrMsg] = useState<string | null>(null);
  const [pnrSuccess, setPnrSuccess] = useState(false);

  const segments = flight.segments_data?.length ? flight.segments_data : [];
  const stats = seatStats(flight, bookedCount);
  const status = listingStatus(flight, bookedCount);
  const canCancel = status === "Open";

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
      const hold = unwrapData<{ id?: string; status?: string; expires_at?: string }>(json);
      const item = flight as ForSaleInventoryItem;
      const outbound = forSaleItemToFlight(item);
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

  const saveInventorySettings = async () => {
    if (!access) return;
    setSavingPrice(true);
    setSaveMsg(null);
    try {
      const api = getPublicApiUrl();
      const body: Record<string, unknown> = { price: editPrice };
      if (salesClosingEnabled && salesClosingDatetime) {
        body.sales_closing_datetime = new Date(salesClosingDatetime).toISOString();
      } else {
        body.sales_closing_datetime = null;
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
      setSaveMsg("Saved successfully.");
      onInventoryUpdated?.();
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingPrice(false);
    }
  };

  const submitAddPnr = async () => {
    if (!pnrInput.trim()) {
      setPnrMsg("PNR number is required.");
      return;
    }
    if (!access) { openAuthModal(); return; }
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
      setPnrInput(""); setPassengerName(""); setPnrAmount(""); setTicketNumber("");
      onInventoryUpdated?.();
    } catch (err) {
      setPnrMsg(err instanceof Error ? err.message : "Failed to add PNR");
    } finally {
      setAddingPnr(false);
    }
  };

  return (
    <div className="w-full xl:w-[420px] bg-white border-l border-slate-200 fixed top-0 xl:top-[96px] right-0 bottom-0 z-50 xl:z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="p-6 bg-slate-100 border-b border-slate-200 flex items-start justify-between shrink-0">
        <div>
          <div className="font-bold text-[16px] text-slate-800 flex items-center gap-2">
            {flight.origin} <ArrowRight className="w-4 h-4 text-[#D60D26]" /> {flight.destination}
          </div>
          <div className="text-[13px] text-slate-500 mt-1">
            {formatDisplayDateLong(flight.departure_datetime)}
          </div>
          <div className="text-[12px] text-slate-400 mt-1">
            {formatTimeRange(flight.departure_datetime, flight.arrival_datetime)}
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
            className={`flex-1 px-3 py-3.5 font-bold text-[13px] whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "text-[#D60D26] bg-rose-50 border-b-2 border-[#D60D26]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab === "Booking" ? `Booking (${flightTickets.length})` : tab}
          </button>
        ))}
      </div>

      {/* ─── SEGMENT TAB ─── */}
      {activeTab === "Segment" && (
        <>
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {segments.length === 0 ? (
              <div className="space-y-6">
                <div className="font-bold text-[16px] text-slate-800">
                  {flight.origin}{" "}
                  <span className="text-slate-400 font-medium">→ {flight.destination}</span>
                </div>
                <p className="text-sm text-slate-500">
                  {flight.airline_name || flight.airline_code} · {flight.flight_number}
                </p>
              </div>
            ) : (
              segments.map((segment, index) => (
                <div key={`${flight.id}-seg-${index}`} className="mb-8 last:mb-0">
                  <div className="font-bold text-[16px] text-slate-800 mb-6">
                    {segment.origin}{" "}
                    <span className="text-slate-400 font-medium">{segment.origin_city || ""}</span>
                  </div>
                  <div className="flex gap-4 relative mb-6">
                    <div className="w-px bg-slate-300 absolute left-1.5 top-2 bottom-2" />
                    <div className="w-3 h-3 rounded-full bg-slate-800 relative z-10 shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="text-[13px] text-slate-700 font-bold mb-4">
                        {segment.departure_datetime
                          ? new Date(segment.departure_datetime).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "—"}
                        <span className="text-[#D60D26] mx-1">•</span>
                        {segment.origin}
                        <span className="text-[#D60D26] mx-1">•</span>
                        {segment.origin_terminal || "Terminal"}
                      </div>
                      <div className="flex items-center gap-4 py-6">
                        <div className="w-8 h-8 bg-[#D60D26] rounded flex items-center justify-center shrink-0 shadow-sm relative -ml-[22px]">
                          <Plane className="w-4 h-4 text-white -rotate-45" />
                        </div>
                        <div className="flex items-center gap-4 text-[13px] font-bold text-blue-600">
                          <span>{segment.duration || flight.duration || "—"}</span>
                          {segment.stop_over && (
                            <span className="text-[#D60D26] underline underline-offset-2">
                              {segment.stop_over}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 relative mb-4">
                    <div className="w-3 h-3 rounded-full border-2 border-slate-800 bg-white relative z-10 shrink-0 mt-1" />
                    <div className="text-[13px] text-slate-700 font-bold">
                      {segment.arrival_datetime
                        ? new Date(segment.arrival_datetime).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : "—"}
                      <span className="text-[#D60D26] mx-1">•</span>
                      {segment.destination}
                      <span className="text-[#D60D26] mx-1">•</span>
                      {segment.destination_terminal || "Terminal"}
                    </div>
                  </div>
                </div>
              ))
            )}
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
                  className="text-slate-400 font-bold flex items-center gap-2 text-[14px] cursor-not-allowed disabled:opacity-100"
                >
                  Cancel Flight <X className="w-4 h-4" />
                </button>
                <div className="text-[12px] text-slate-400">Only open &amp; pending flight can be cancel</div>
              </>
            )}
          </div>
        </>
      )}

      {/* ─── INVENTORY TAB ─── */}
      {activeTab === "Inventory" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Open for sale toggle */}
          {onPublishToggle && (
            <div>
              <div className="font-bold text-[15px] text-slate-800 mb-3">Open for sale</div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    {flight.is_published === false ? "Closed" : "Open"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Published listings appear on For Sale and in flight search.
                  </div>
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
                  {flight.is_published === false ? "Open for sale" : "Close"}
                </button>
              </div>
            </div>
          )}

          {/* Baggage */}
          <div>
            <div className="font-bold text-[15px] text-slate-800 mb-3">Baggage</div>
            <input
              type="text"
              readOnly
              value={`${flight.baggage_check_in || "23 kg"}, ${flight.baggage_hand || "7 kg"} hand`}
              className="w-full border border-slate-200 rounded-lg p-3 text-[14px] font-bold text-slate-600 bg-white"
            />
          </div>

          {/* Tickets Volume / Seat stats */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-[15px] text-slate-800">Tickets Volume</div>
              {onEditInventory && (
                <button
                  type="button"
                  onClick={onEditInventory}
                  className="text-[13px] font-bold text-slate-400 hover:text-slate-600"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="space-y-2.5 text-[14px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Total seats</span>
                <span className="font-bold text-[#D60D26]">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Open for sale</span>
                <span className="font-bold text-emerald-600">{stats.available}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sold seats</span>
                <span className="font-bold text-slate-800">{stats.sold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reserved (held)</span>
                <span className="font-bold text-amber-600">{stats.held}</span>
              </div>
            </div>
          </div>

          {/* Price — editable */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-[15px] text-slate-800">Price</div>
              <div className="flex items-center gap-2 text-[#D60D26] font-bold text-[12px]">
                <ArrowRight className="w-3.5 h-3.5" /> ONE WAY
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-3.5 pl-8 text-[14px] font-bold text-slate-800 focus:outline-none focus:border-[#D60D26]"
              />
            </div>
          </div>

          {/* Sales ending */}
          <div>
            <div className="font-bold text-[15px] text-slate-800 mb-3">Sales ending</div>
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <label className="flex items-center justify-between cursor-pointer gap-3">
                <span className="text-[13px] font-medium text-slate-700">End selling before departure</span>
                <button
                  type="button"
                  onClick={() => setSalesClosingEnabled((v) => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${salesClosingEnabled ? "bg-[#D60D26]" : "bg-slate-200"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${salesClosingEnabled ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </label>
              {salesClosingEnabled && (
                <div>
                  <div className="text-[12px] text-slate-500 mb-1.5 font-medium">Sales close at</div>
                  <input
                    type="datetime-local"
                    value={salesClosingDatetime}
                    onChange={(e) => setSalesClosingDatetime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:border-[#D60D26]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Policies */}
          {flight.policies && Object.keys(flight.policies).length > 0 && (
            <div>
              <div className="font-bold text-[15px] text-slate-800 mb-3">Policies</div>
              <div className="space-y-2 text-[13px]">
                {Object.entries(flight.policies).map(([key, val]) =>
                  val ? (
                    <div key={key} className="flex gap-2">
                      <span className="text-slate-400 capitalize font-medium min-w-[80px]">{key}:</span>
                      <span className="text-slate-700">{String(val)}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {flight.apis_required && (
            <span className="inline-flex rounded-full border border-green-300 bg-green-50 px-4 py-1.5 text-[12px] font-bold text-green-600">
              APIS Need
            </span>
          )}

          {/* Save button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={savingPrice}
              onClick={() => void saveInventorySettings()}
              className="w-full flex items-center justify-center gap-2 bg-[#0C2342] hover:bg-[#12315b] text-white font-bold py-3 rounded-full text-[14px] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingPrice ? "Saving…" : "Save Changes"}
            </button>
            {saveMsg && (
              <p className={`mt-2 text-xs text-center font-medium ${saveMsg.includes("success") ? "text-emerald-600" : "text-rose-600"}`}>
                {saveMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── BOOKING TAB ─── */}
      {activeTab === "Booking" && (
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {flightTickets.length === 0 ? (
            <p className="text-slate-500 text-[13px] font-medium">No bookings for this flight yet.</p>
          ) : (
            <div className="space-y-4">
              {flightTickets.map((t) => (
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
                  className="w-full text-left hover:bg-slate-50 p-3 rounded-xl border border-slate-100"
                >
                  <div className="font-bold text-slate-700 text-[14px]">
                    {t.pnr_number || t.booking_ref || t.id.slice(0, 6).toUpperCase()}
                  </div>
                  <div className="text-[13px] text-slate-500 mt-1">
                    {t.status} · {formatFarePortal(t.total_amount || 0)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── PNR BOOKING TAB ─── */}
      {activeTab === "PNR Booking" && (
        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-5">
          {/* Group PNR badge */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
            <div className="text-[12px] font-bold text-slate-500 uppercase">Group PNR</div>
            <div className="text-[18px] font-black text-slate-800 mt-1">{groupPnrFromId(flight.id)}</div>
          </div>

          {/* Add PNR form */}
          <div className="rounded-xl border border-[#D60D26]/20 bg-rose-50/30 p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-[14px] text-slate-800 mb-1">
              <Plus className="w-4 h-4 text-[#D60D26]" /> Add PNR
            </div>
            <div>
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">PNR Number *</label>
              <input
                type="text"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                placeholder="e.g. UYS12435"
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] font-bold text-slate-800 focus:outline-none focus:border-[#D60D26]"
              />
            </div>
            <div>
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Passenger Name</label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="e.g. Harshit Chirgania"
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] text-slate-800 focus:outline-none focus:border-[#D60D26]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Ticket Number</label>
                <input
                  type="text"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-800 focus:outline-none focus:border-[#D60D26]"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Amount (₹)</label>
                <input
                  type="number"
                  value={pnrAmount}
                  onChange={(e) => setPnrAmount(e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-800 focus:outline-none focus:border-[#D60D26]"
                />
              </div>
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
              <p className={`text-xs text-center font-medium ${pnrSuccess ? "text-emerald-600" : "text-rose-600"}`}>
                {pnrMsg}
              </p>
            )}
          </div>

          {/* Existing PNR list */}
          {flightTickets.length === 0 ? (
            <p className="text-slate-500 text-[13px]">No PNR bookings linked to this inventory yet.</p>
          ) : (
            <div className="space-y-3">
              <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Linked PNRs</div>
              {flightTickets.map((t) => (
                <button
                  key={`pnr-${t.id}`}
                  type="button"
                  onClick={() => onTicketSelect?.(t)}
                  className="w-full text-left rounded-xl border border-slate-100 p-3 hover:bg-slate-50"
                >
                  <div className="font-bold text-[#D60D26] underline underline-offset-2">
                    {t.pnr_number || t.booking_ref || "Pending PNR"}
                  </div>
                  <div className="text-[13px] text-slate-500 mt-1">{t.status} · {formatFarePortal(t.total_amount || 0)}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

