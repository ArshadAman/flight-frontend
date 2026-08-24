"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, ArrowRight, Search } from "lucide-react";
import { AdminFigmaModal } from "./AdminFigmaModal";
import {
  FigmaCheckboxList,
  FigmaFormRow,
  FigmaModalFooter,
  FigmaModalTabs,
  FigmaSearchBar,
  type FigmaField,
} from "./FigmaFormFields";
import {
  agentDiscountFields,
  customerMarkupFields,
  salesPromotionSalesFields,
  salesPromotionTravelFields,
} from "@/lib/admin/figma-fields";
import { useAuth } from "@/context/AuthContext";
import {
  createRestriction,
  deleteRestriction,
  fetchRestrictions,
  type InventoryRestriction,
} from "@/lib/admin/restrictionsApi";

const airlines = ["AIR INDIA", "INDIGO", "QATAR", "SPICEJET", "VISTARA", "EMIRATES", "SINGAPORE"];
const suppliers = [
  "Harshit Chirgania",
  "Ajay Mehto",
  "Lokesh Gidwani",
  "Kusum Meena",
  "Riya Roy",
  "Vaibhav Raj",
];
const routes = {
  "One Way": [
    "Bangalore (BLR) → Delhi (DEL)",
    "Delhi (DEL) → Mumbai (BOM)",
    "Delhi (DEL) → Bangkok (BKK)",
    "Mumbai (BOM) → Goa (GOI)",
    "Frankfurt (FRA) → Delhi (DEL)",
  ],
  "Round Trip": ["Bangalore (BLR) ⇄ Delhi (DEL)", "Delhi (DEL) ⇄ Mumbai (BOM)"],
  "Multi-City": ["Bangalore (BLR) → Delhi (DEL)\nBangkok (BKK) → Delhi (DEL)"],
};

function iataFromLabel(label: string): { origin: string; destination: string } | null {
  const codes = [...label.matchAll(/\(([A-Z]{3})\)/g)].map((m) => m[1]);
  if (codes.length < 2) return null;
  return { origin: codes[0], destination: codes[codes.length - 1] };
}

const AIRLINE_CODES: Record<string, string> = {
  "AIR INDIA": "AI",
  INDIGO: "6E",
  QATAR: "QR",
  SINGAPORE: "SQ",
  SPICEJET: "SG",
  VISTARA: "UK",
  EMIRATES: "EK",
};

function airlineLabelFromRestriction(row: InventoryRestriction): string {
  const name = (row.airline_name || "").toUpperCase();
  if (name && airlines.includes(name)) return name;
  const code = (row.airline_code || "").toUpperCase();
  const match = Object.entries(AIRLINE_CODES).find(([, c]) => c === code);
  return match?.[0] || name || code;
}

function FormModal({
  open,
  onOpenChange,
  title,
  fields,
  note,
  tabs,
  activeTab,
  onTabChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: readonly FigmaField[];
  note?: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  return (
    <AdminFigmaModal open={open} onOpenChange={onOpenChange} title={title}>
      {tabs && activeTab && onTabChange && (
        <FigmaModalTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      )}
      {note && (
        <p className="bg-white px-7 py-2 text-[10px] italic text-slate-500">{note}</p>
      )}
      <div className="max-h-[360px] overflow-y-auto">
        {fields.map((field, i) => (
          <FigmaFormRow key={`${field.label}-${i}`} field={field} index={i} />
        ))}
      </div>
      <FigmaModalFooter onSubmit={() => onOpenChange(false)} />
    </AdminFigmaModal>
  );
}

export function CustomerMarkupModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Customer's Markup"
      fields={customerMarkupFields}
    />
  );
}

export function AgentDiscountModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Agent's Discount"
      fields={agentDiscountFields}
    />
  );
}

export function SalesPromotionModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState("Sales");
  const fields = tab === "Sales" ? salesPromotionSalesFields : salesPromotionTravelFields;
  const note =
    tab === "Sales"
      ? "NOTE: Select month for sale period"
      : "NOTE: Select month for Travel period";

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Sales Promotion"
      fields={fields}
      note={note}
      tabs={["Sales", "Travel"]}
      activeTab={tab}
      onTabChange={setTab}
    />
  );
}

export function BlockAirlinesModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { access, openAuthModal } = useAuth();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(["AIR INDIA"]));
  const [existing, setExisting] = useState<InventoryRestriction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !access) return;
    void (async () => {
      try {
        const rows = await fetchRestrictions(access, "AIRLINE");
        setExisting(rows);
        setSelected(new Set(rows.map(airlineLabelFromRestriction).filter(Boolean)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      }
    })();
  }, [open, access]);

  const filtered = airlines.filter((a) => a.toLowerCase().includes(search.toLowerCase()));

  const toggle = (item: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const submit = async () => {
    if (!access) {
      openAuthModal();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const current = new Set(existing.map(airlineLabelFromRestriction));
      for (const label of selected) {
        if (current.has(label)) continue;
        await createRestriction(access, {
          scope: "AIRLINE",
          airline_code: AIRLINE_CODES[label] || label.slice(0, 2),
          airline_name: label,
        });
      }
      for (const row of existing) {
        const label = airlineLabelFromRestriction(row);
        if (!selected.has(label)) await deleteRestriction(access, row.id);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminFigmaModal open={open} onOpenChange={onOpenChange} title="Block Airlines">
      <FigmaSearchBar placeholder="Search Airlines" value={search} onChange={setSearch} />
      <div className="max-h-[280px] overflow-y-auto">
        <FigmaCheckboxList items={filtered} selected={selected} onToggle={toggle} />
      </div>
      {error && <p className="px-6 py-2 text-xs text-rose-600">{error}</p>}
      <FigmaModalFooter onReset={() => setSelected(new Set())} onSubmit={() => void submit()} />
      {saving && <p className="px-6 pb-3 text-[10px] text-slate-400">Saving…</p>}
    </AdminFigmaModal>
  );
}

export function AddSuppliersModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(["Harshit Chirgania"]));

  const filtered = suppliers.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (item: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  return (
    <AdminFigmaModal open={open} onOpenChange={onOpenChange} title="Agent's Add Suppliers">
      <FigmaSearchBar placeholder="Search Suppliers" value={search} onChange={setSearch} />
      <div className="max-h-[280px] overflow-y-auto">
        {filtered.map((item) => (
          <label
            key={item}
            className="flex cursor-pointer items-center gap-3 border-b border-[#e8ebef] px-6 py-3 text-xs font-medium text-[#1c304a] last:border-b-0"
          >
            <input
              type="checkbox"
              checked={selected.has(item)}
              onChange={() => toggle(item)}
              className="h-4 w-4 rounded border-[#e8ebef] accent-[#006aec]"
            />
            {item}
          </label>
        ))}
        <button
          type="button"
          className="w-full py-3 text-center text-xs font-medium text-[#006aec] hover:underline"
        >
          More
        </button>
      </div>
      <FigmaModalFooter onReset={() => setSelected(new Set())} onSubmit={() => onOpenChange(false)} />
    </AdminFigmaModal>
  );
}

export function BlockRoutesModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { access, openAuthModal } = useAuth();
  const [tab, setTab] = useState<"One Way" | "Round Trip" | "Multi-City">("One Way");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [existing, setExisting] = useState<InventoryRestriction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !access) return;
    void (async () => {
      try {
        const rows = await fetchRestrictions(access, "ROUTE");
        setExisting(rows);
        const keys = new Set(
          rows.map((r) => `${(r.origin || "").toUpperCase()}-${(r.destination || "").toUpperCase()}`)
        );
        setSelected(keys);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      }
    })();
  }, [open, access]);

  const routeList = routes[tab].filter((label) => {
    const parsed = iataFromLabel(label);
    if (origin.trim() && parsed && !parsed.origin.includes(origin.trim().toUpperCase())) return false;
    if (destination.trim() && parsed && !parsed.destination.includes(destination.trim().toUpperCase())) {
      return false;
    }
    return true;
  });

  const toggle = (label: string) => {
    const parsed = iataFromLabel(label);
    const key = parsed ? `${parsed.origin}-${parsed.destination}` : label;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const submit = async () => {
    if (!access) {
      openAuthModal();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const current = new Set(
        existing.map((r) => `${(r.origin || "").toUpperCase()}-${(r.destination || "").toUpperCase()}`)
      );
      for (const key of selected) {
        if (current.has(key)) continue;
        const [originCode, destCode] = key.split("-");
        if (!originCode || !destCode) continue;
        await createRestriction(access, {
          scope: "ROUTE",
          origin: originCode,
          destination: destCode,
        });
      }
      for (const row of existing) {
        const key = `${(row.origin || "").toUpperCase()}-${(row.destination || "").toUpperCase()}`;
        if (!selected.has(key)) await deleteRestriction(access, row.id);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminFigmaModal open={open} onOpenChange={onOpenChange} title="Block Ruotes">
      <FigmaModalTabs
        tabs={["One Way", "Round Trip", "Multi-City"]}
        activeTab={tab}
        onTabChange={(t) => setTab(t as typeof tab)}
      />
      <div className="flex items-center gap-2 border-b border-[#e8ebef] bg-[#f5f2f2] px-6 py-3">
        <input
          type="text"
          placeholder="Origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="h-8 flex-1 rounded border border-[#e8ebef] bg-white px-3 text-xs"
        />
        {tab === "Round Trip" ? (
          <ArrowLeftRight className="h-4 w-4 shrink-0 text-[#006aec]" />
        ) : (
          <ArrowRight className="h-4 w-4 shrink-0 text-[#006aec]" />
        )}
        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="h-8 flex-1 rounded border border-[#e8ebef] bg-white px-3 text-xs"
        />
        <Search className="h-4 w-4 shrink-0 text-[#006aec]" />
      </div>
      <div className="max-h-[240px] overflow-y-auto">
        {routeList.map((label) => {
          const parsed = iataFromLabel(label);
          const key = parsed ? `${parsed.origin}-${parsed.destination}` : label;
          return (
            <label
              key={label}
              className="flex cursor-pointer items-start gap-3 border-b border-[#e8ebef] px-6 py-3 text-xs font-medium text-[#1c304a] last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selected.has(key)}
                onChange={() => toggle(label)}
                className="mt-0.5 h-4 w-4 rounded border-[#e8ebef] accent-[#006aec]"
              />
              <span className="whitespace-pre-line">{label}</span>
            </label>
          );
        })}
        <button
          type="button"
          className="w-full py-3 text-center text-xs font-medium text-[#006aec] hover:underline"
        >
          More
        </button>
      </div>
      {error && <p className="px-6 py-2 text-xs text-rose-600">{error}</p>}
      <FigmaModalFooter onReset={() => setSelected(new Set())} onSubmit={() => void submit()} />
      {saving && <p className="px-6 pb-3 text-[10px] text-slate-400">Saving…</p>}
    </AdminFigmaModal>
  );
}
