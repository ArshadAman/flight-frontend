"use client"

import React, {useState} from "react"

export type BaggageOption = {
  id: string
  title: string
  description?: string
  price?: number
}

type Props = {
  open: boolean
  initialSelectedId?: string | null
  onClose: () => void
  onSave: (option: BaggageOption | null) => void
}

const DEFAULT_OPTIONS: BaggageOption[] = [
  {id: "cabin", title: "Cabin baggage", description: "Small carry-on included", price: 0},
  {id: "checked_20", title: "Checked 20kg", description: "One 20kg checked bag", price: 25},
  {id: "checked_30", title: "Checked 30kg", description: "One 30kg checked bag", price: 40},
  {id: "child_seat", title: "Child seat / Infant option", description: "Seat/infant options", price: 0},
]

export default function AddOnModal({open, initialSelectedId = null, onClose, onSave}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId)

  if (!open) return null

  const handleSave = () => {
    const option = DEFAULT_OPTIONS.find(o => o.id === selectedId) ?? null
    onSave(option)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">Select baggage / add-ons</h3>
        <div className="space-y-3">
          {DEFAULT_OPTIONS.map(opt => (
            <label key={opt.id} className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="addon"
                checked={selectedId === opt.id}
                onChange={() => setSelectedId(opt.id)}
                className="mt-1"
              />
              <div>
                <div className="font-medium">{opt.title} {opt.price ? `- $${opt.price}` : ""}</div>
                {opt.description && <div className="text-sm text-slate-600">{opt.description}</div>}
              </div>
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded bg-slate-100 px-4 py-2" onClick={onClose}>Cancel</button>
          <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={handleSave}>Save selection</button>
        </div>
      </div>
    </div>
  )
}
"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

type BaggageOption = {
  id: string;
  title: string;
  description: string;
  price: string;
  note?: string;
};

interface AddOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (option: BaggageOption | null) => void;
  initialSelectedOptionId?: string | null;
}

export function AddOnModal({ isOpen, onClose, onApply, initialSelectedOptionId = null }: AddOnModalProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(initialSelectedOptionId);

  const baggageSections: Array<{ title: string; options: BaggageOption[] }> = [
    {
      title: "Cabin Baggage",
      options: [
        { id: "cabin-7kg", title: "7kg cabin bag", description: "1 small cabin bag + personal item", price: "$0.00", note: "Included on most fares" },
        { id: "cabin-10kg", title: "10kg cabin bag", description: "Extra cabin allowance for flexible fares", price: "$8.00" },
      ],
    },
    {
      title: "Checked Baggage",
      options: [
        { id: "checked-15kg", title: "15kg checked bag", description: "Best for short trips and light packing", price: "$0.00", note: "Often bundled with sale fares" },
        { id: "checked-20kg", title: "20kg checked bag", description: "Balanced baggage allowance", price: "$14.00" },
        { id: "checked-25kg", title: "25kg checked bag", description: "Extra room for longer stays", price: "$20.00" },
      ],
    },
    {
      title: "Child & Infant Options",
      options: [
        { id: "child-5kg", title: "Child bag allowance", description: "For child passengers traveling with family", price: "$6.00" },
        { id: "infant-stroller", title: "Infant stroller", description: "Gate-check stroller or pram service", price: "$0.00", note: "Subject to airline policy" },
      ],
    },
  ];

  const selectedOption = baggageSections.flatMap((section) => section.options).find((option) => option.id === selectedOptionId) || null;

  React.useEffect(() => {
    if (isOpen) {
      setSelectedOptionId(initialSelectedOptionId);
    }
  }, [initialSelectedOptionId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-[500px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#F2FBFF] px-6 py-4 flex items-center justify-between">
          <h2 className="text-[#D60D26] text-[18px] font-bold tracking-tight">Add On</h2>
          <button onClick={onClose} className="text-slate-800 hover:bg-white/50 p-1 rounded-md transition-colors">
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {/* Informational Text */}
        <div className="px-6 pt-5 pb-4">
          <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
            Choose a baggage add-on below. The child/infant options are shown separately so you can match the allowance to the passenger type.
          </p>
        </div>

        {/* Section Title */}
        <div className="bg-[#F2FBFF] px-6 py-2.5">
          <h3 className="font-bold text-slate-800 text-[14px]">Baggage</h3>
        </div>

        {/* List of Add-ons */}
        <div className="flex flex-col px-6 py-4 gap-5 pb-6">
          {baggageSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <div className="text-[13px] font-black uppercase tracking-[0.16em] text-slate-500">
                {section.title}
              </div>
              <div className="flex flex-col gap-3">
                {section.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedOptionId(option.id)}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${isSelected ? "border-[#D60D26] bg-red-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-[15px] font-black text-slate-800">{option.title}</div>
                          <div className="text-[13px] font-medium text-slate-500 mt-1">{option.description}</div>
                          {option.note && <div className="text-[12px] font-semibold text-[#D60D26] mt-1">{option.note}</div>}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="text-[15px] font-black text-slate-900">{option.price}</div>
                          <span className={`text-[12px] font-bold uppercase tracking-wider ${isSelected ? "text-[#D60D26]" : "text-slate-400"}`}>
                            {isSelected ? "Selected" : "Choose"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {selectedOption && (
          <div className="px-6 pb-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-[12px] font-black uppercase tracking-[0.16em] text-slate-500">Selected add-on</div>
              <div className="mt-1 text-[15px] font-black text-slate-900">{selectedOption.title}</div>
              <div className="text-[13px] font-medium text-slate-600 mt-1">{selectedOption.description}</div>
            </div>
          </div>
        )}

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={() => {
              onApply(selectedOption);
              onClose();
            }}
            disabled={!selectedOption}
            className="w-full rounded-full bg-[#D60D26] text-white font-black text-[14px] py-3 hover:bg-[#b00b1d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save selection
          </button>
        </div>

      </div>
    </div>
  );
}
