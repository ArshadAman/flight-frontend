"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const FARE_OPTIONS = [
  { id: 0, title: "PEYCLAS", subtitle: "Prem. Eco", diff: "+/- $0.00", bag: "15k" },
  { id: 1, title: "PEYFLX", subtitle: "Economy", diff: "+/- $180.00", bag: "25k" },
  { id: 2, title: "BUSCLAS", subtitle: "Business", diff: "+/- $220.00", bag: "25k" },
  { id: 3, title: "BUSFLX", subtitle: "Business", diff: "+/- $239.00", bag: "35k" },
];

export function FareTypeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedFare, setSelectedFare] = useState<number>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-[800px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#FBEBEF] px-6 py-4 flex items-center justify-between">
          <h2 className="text-[#DF1B24] text-[18px] font-bold tracking-tight">Fare Type</h2>
          <button onClick={onClose} className="text-slate-800 hover:bg-white/50 p-1 rounded-md transition-colors">
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {/* Body Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border-collapse border border-slate-200 text-center text-[14px]">
            <thead>
              <tr>
                <th className="border border-slate-200 p-4 min-w-[150px] bg-white"></th>
                {FARE_OPTIONS.map((opt) => (
                  <th 
                    key={`head-${opt.id}`}
                    onClick={() => setSelectedFare(opt.id)}
                    className={cn(
                      "border border-slate-200 p-4 min-w-[120px] cursor-pointer transition-colors hover:bg-slate-50",
                      selectedFare === opt.id ? "bg-[#FBEBEF] hover:bg-[#FBEBEF]" : "bg-white"
                    )}
                  >
                    <div className="flex flex-col text-center">
                      <span className={cn("font-bold text-[15px]", selectedFare === opt.id ? "text-[#DF1B24]" : "text-slate-800")}>{opt.title}</span>
                      <span className={cn("font-medium text-[13px]", selectedFare === opt.id ? "text-slate-600" : "text-slate-500")}>{opt.subtitle}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              
              {/* Airline fare family */}
              <tr>
                <td className="border border-slate-200 p-4 text-left font-bold text-slate-800">Airline fare family</td>
                {FARE_OPTIONS.map((opt) => (
                  <td 
                    key={`family-${opt.id}`}
                    onClick={() => setSelectedFare(opt.id)}
                    className={cn(
                      "border border-slate-200 p-4 font-semibold cursor-pointer transition-colors hover:bg-slate-50",
                      selectedFare === opt.id ? "bg-[#FBEBEF] text-slate-800 hover:bg-[#FBEBEF]" : "text-slate-500 bg-white"
                    )}
                  >
                    {opt.title}
                  </td>
                ))}
              </tr>

              {/* Price difference */}
              <tr>
                <td className="border border-slate-200 p-4 text-left font-bold text-slate-800">Price difference</td>
                {FARE_OPTIONS.map((opt) => (
                  <td 
                    key={`price-${opt.id}`}
                    onClick={() => setSelectedFare(opt.id)}
                    className={cn(
                      "border border-slate-200 p-4 font-bold text-slate-800 cursor-pointer transition-colors hover:bg-slate-50",
                      selectedFare === opt.id ? "bg-[#FBEBEF] hover:bg-[#FBEBEF]" : "bg-white"
                    )}
                  >
                    {opt.diff}
                  </td>
                ))}
              </tr>

              {/* Baggage weight */}
              <tr>
                <td className="border border-slate-200 p-4 text-left font-bold text-slate-800">Baggage weight</td>
                {FARE_OPTIONS.map((opt) => (
                  <td 
                    key={`bag-${opt.id}`}
                    onClick={() => setSelectedFare(opt.id)}
                    className={cn(
                      "border border-slate-200 p-4 cursor-pointer transition-colors hover:bg-slate-50",
                      selectedFare === opt.id ? "bg-[#FBEBEF] hover:bg-[#FBEBEF]" : "bg-white"
                    )}
                  >
                    <div className="mx-auto w-10 h-8 border-2 border-[#DF1B24] rounded-md flex items-center justify-center font-bold text-[#DF1B24] text-[12px] relative mt-1">
                      <div className={cn(
                        "absolute top-[-6px] w-3 h-2 border-2 border-b-0 border-[#DF1B24] rounded-t-sm transition-colors",
                        selectedFare === opt.id ? "bg-[#FBEBEF]" : "bg-white group-hover:bg-slate-50"
                      )}></div>
                      {opt.bag}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Fare family information */}
              <tr>
                <td className="border border-slate-200 p-4 text-left font-bold text-slate-800">Fare family information</td>
                {FARE_OPTIONS.map((opt) => (
                  <td 
                    key={`info-${opt.id}`}
                    className={cn(
                      "border border-slate-200 p-4 transition-colors",
                      selectedFare === opt.id ? "bg-[#FBEBEF]" : "bg-white"
                    )}
                  >
                    <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="text-blue-600 font-bold hover:underline">Info</a>
                  </td>
                ))}
              </tr>

              {/* Selection Radios */}
              <tr>
                <td className="border border-slate-200 p-4 font-bold text-slate-800 text-left">Select</td>
                {FARE_OPTIONS.map((opt) => (
                  <td 
                    key={`radio-${opt.id}`}
                    onClick={() => setSelectedFare(opt.id)}
                    className={cn(
                      "border border-slate-200 p-4 cursor-pointer transition-colors hover:bg-slate-50",
                      selectedFare === opt.id ? "bg-[#FBEBEF] hover:bg-[#FBEBEF]" : "bg-white"
                    )}
                  >
                    <div className={cn(
                      "w-[18px] h-[18px] rounded-full border-2 mx-auto flex items-center justify-center transition-all",
                      selectedFare === opt.id ? "border-[#DF1B24]" : "border-slate-300"
                    )}>
                      {selectedFare === opt.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#DF1B24] animate-in zoom-in-50 duration-200"></div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

        {/* Action Button (Optional confirmation, common in forms) */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button 
            onClick={onClose}
            className="bg-[#DF1B24] text-white font-bold py-2 px-8 rounded-lg hover:bg-[#C1161E] transition-colors"
          >
            Confirm Selection
          </button>
        </div>

      </div>
    </div>
  );
}
