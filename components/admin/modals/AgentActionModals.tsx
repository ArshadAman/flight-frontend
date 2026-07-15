"use client";

import { useState } from "react";
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

const airlines = ["AIR INDIA", "INDIGO", "QATAR", "SINGAPORE"];
const suppliers = [
  "Harshit Chirgania",
  "Ajay Mehto",
  "Lokesh Gidwani",
  "Kusum Meena",
  "Riya Roy",
  "Vaibhav Raj",
];
const routes = {
  "One Way": ["Bangalore (BLR) → Delhi (DEL)"],
  "Round Trip": ["Bangalore (BLR) ⇄ Delhi (DEL)"],
  "Multi-City": [
    "Bangalore (BLR) → Delhi (DEL)\nBangkok (BKK) → Delhi (DEL)",
  ],
};

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
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(["AIR INDIA"]));

  const filtered = airlines.filter((a) =>
    a.toLowerCase().includes(search.toLowerCase())
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
    <AdminFigmaModal open={open} onOpenChange={onOpenChange} title="Block Airlines">
      <FigmaSearchBar placeholder="Search Airlines" value={search} onChange={setSearch} />
      <div className="max-h-[280px] overflow-y-auto">
        <FigmaCheckboxList items={filtered} selected={selected} onToggle={toggle} />
      </div>
      <FigmaModalFooter onReset={() => setSelected(new Set())} onSubmit={() => onOpenChange(false)} />
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
  const [tab, setTab] = useState<"One Way" | "Round Trip" | "Multi-City">("One Way");
  const [selected, setSelected] = useState<Set<string>>(new Set(["0"]));

  const routeList = Array.from({ length: tab === "Multi-City" ? 3 : 4 }, (_, i) => {
    const base = routes[tab][0];
    return { id: String(i), label: base };
  });

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
          className="h-8 flex-1 rounded border border-[#e8ebef] bg-white px-3 text-xs"
        />
        <Search className="h-4 w-4 shrink-0 text-[#006aec]" />
      </div>
      <div className="max-h-[240px] overflow-y-auto">
        {routeList.map((route) => (
          <label
            key={route.id}
            className="flex cursor-pointer items-start gap-3 border-b border-[#e8ebef] px-6 py-3 text-xs font-medium text-[#1c304a] last:border-b-0"
          >
            <input
              type="checkbox"
              checked={selected.has(route.id)}
              onChange={() => toggle(route.id)}
              className="mt-0.5 h-4 w-4 rounded border-[#e8ebef] accent-[#006aec]"
            />
            <span className="whitespace-pre-line">{route.label}</span>
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
