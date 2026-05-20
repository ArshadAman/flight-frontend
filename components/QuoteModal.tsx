"use client";

import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuoteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [includePrice, setIncludePrice] = useState(true);
  const [agencyFee, setAgencyFee] = useState("included");
  const [flightOptions, setFlightOptions] = useState("selected");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-[550px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#FBEBEF] px-6 py-4 flex items-center justify-between">
          <h2 className="text-[#DF1B24] text-[20px] font-bold tracking-tight">Quote</h2>
          <button onClick={onClose} className="text-slate-800 hover:bg-white/50 p-1 rounded-md transition-colors">
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Document Language */}
          <div className="flex flex-col gap-1 w-fit">
            <label className="text-[13px] text-slate-500 font-semibold flex items-center gap-1 cursor-pointer hover:text-slate-700">
              Document Language <ChevronDown className="w-3.5 h-3.5" />
            </label>
            <div className="flex items-center justify-between border-b-[1.5px] border-slate-200 pb-1 cursor-pointer w-[150px]">
              <span className="text-[16px] font-bold text-slate-900">English</span>
            </div>
          </div>

          {/* Free Text */}
          <div className="flex flex-col">
            <textarea 
              placeholder="Free Text"
              className="w-full border border-slate-200 rounded-lg p-4 min-h-[110px] text-[15px] font-medium resize-none outline-none focus:border-[#DF1B24]/30 focus:ring-4 focus:ring-[#DF1B24]/10 transition-all placeholder:text-slate-500"
            ></textarea>
            <p className="text-[12px] text-slate-500 italic mt-2 font-medium">Text will be displayed above the offers details</p>
          </div>

          {/* Toggles & Radios */}
          <div className="flex flex-col gap-5 mt-2">
            
            {/* Include price */}
            <div className="flex items-center">
              <span className="text-[15px] font-semibold text-slate-500 w-[140px]">Include price :</span>
              <button 
                onClick={() => setIncludePrice(!includePrice)}
                className={`w-[44px] h-[24px] rounded-full relative transition-colors ${includePrice ? 'bg-[#DF1B24]' : 'bg-slate-300'}`}
              >
                <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${includePrice ? 'left-[23px]' : 'left-[3px]'}`} />
              </button>
            </div>

            {/* Agency fee */}
            <div className="flex items-center">
              <span className="text-[15px] font-semibold text-slate-500 w-[140px]">Agency fee :</span>
              <div className="flex gap-8">
                <label className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setAgencyFee("included")}>
                  <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${agencyFee === "included" ? 'border-[#DF1B24]' : 'border-slate-300 group-hover:border-[#DF1B24]'}`}>
                    {agencyFee === "included" && <div className="w-2.5 h-2.5 rounded-full bg-[#DF1B24]" />}
                  </div>
                  <span className="text-[14px] font-bold text-slate-800">Included in fare</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setAgencyFee("separate")}>
                  <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${agencyFee === "separate" ? 'border-[#DF1B24]' : 'border-slate-300 group-hover:border-[#DF1B24]'}`}>
                    {agencyFee === "separate" && <div className="w-2.5 h-2.5 rounded-full bg-[#DF1B24]" />}
                  </div>
                  <span className="text-[14px] font-bold text-slate-800">Listed seperately</span>
                </label>
              </div>
            </div>

            {/* Flight options */}
            <div className="flex items-center">
              <span className="text-[15px] font-semibold text-slate-500 w-[140px]">Flight options :</span>
              <div className="flex gap-8">
                <label className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setFlightOptions("selected")}>
                  <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${flightOptions === "selected" ? 'border-[#DF1B24]' : 'border-slate-300 group-hover:border-[#DF1B24]'}`}>
                    {flightOptions === "selected" && <div className="w-2.5 h-2.5 rounded-full bg-[#DF1B24]" />}
                  </div>
                  <span className="text-[14px] font-bold text-slate-800">Selected option only</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setFlightOptions("all")}>
                  <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${flightOptions === "all" ? 'border-[#DF1B24]' : 'border-slate-300 group-hover:border-[#DF1B24]'}`}>
                    {flightOptions === "all" && <div className="w-2.5 h-2.5 rounded-full bg-[#DF1B24]" />}
                  </div>
                  <span className="text-[14px] font-bold text-slate-800">All flight options</span>
                </label>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 mt-6 pt-2">
            <Button variant="outline" className="flex-1 rounded-[100px] border-slate-300 text-slate-900 font-bold h-12 text-[14px] hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all active:scale-95">
              Copy To Clipboard
            </Button>
            <Button variant="outline" className="flex-1 rounded-[100px] border-slate-300 text-slate-900 font-bold h-12 text-[14px] hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all active:scale-95">
              Copy To Email
            </Button>
            <Button className="flex-1 rounded-[100px] bg-[#DF1B24] hover:bg-[#C1161E] text-white font-bold h-12 text-[15px] shadow-md transition-all active:scale-95">
              Get PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
