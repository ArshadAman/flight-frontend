"use client";

import React from "react";
import { X } from "lucide-react";

export function AddOnModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-[500px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#FBEBEF] px-6 py-4 flex items-center justify-between">
          <h2 className="text-[#DF1B24] text-[18px] font-bold tracking-tight">Add On</h2>
          <button onClick={onClose} className="text-slate-800 hover:bg-white/50 p-1 rounded-md transition-colors">
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {/* Informational Text */}
        <div className="px-6 pt-5 pb-4">
          <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
            Please note that this representation for extras is only for informational purpose. Extras can be booked after entering the passenger data.
          </p>
        </div>

        {/* Section Title */}
        <div className="bg-[#EBEBEB] px-6 py-2.5">
          <h3 className="font-bold text-slate-800 text-[14px]">Baggage</h3>
        </div>

        {/* List of Add-ons */}
        <div className="flex flex-col px-6 py-4 gap-4 pb-8">
          
          <div className="flex items-center justify-between text-[14px] font-semibold text-slate-600">
            <div className="w-[140px]">1 bags - 15kg total</div>
            <div className="w-[50px] text-center">BAG</div>
            <div className="w-[80px] text-right font-black text-slate-900">$ 0.00</div>
          </div>
          
          <div className="flex items-center justify-between text-[14px] font-semibold text-slate-600">
            <div className="w-[140px]">1 bags - 18kg total</div>
            <div className="w-[50px] text-center">BAG</div>
            <div className="w-[80px] text-right font-black text-slate-900">$ 14.00</div>
          </div>
          
          <div className="flex items-center justify-between text-[14px] font-semibold text-slate-600">
            <div className="w-[140px]">1 bags - 25kg total</div>
            <div className="w-[50px] text-center">BAG</div>
            <div className="w-[80px] text-right font-black text-slate-900">$ 20.00</div>
          </div>
          
          <div className="flex items-center justify-between text-[14px] font-semibold text-slate-600">
            <div className="w-[140px]">1 bags - 30kg total</div>
            <div className="w-[50px] text-center">BAG</div>
            <div className="w-[80px] text-right font-black text-slate-900">$ 25.00</div>
          </div>
          
          <div className="flex items-center justify-between text-[14px] font-semibold text-slate-600">
            <div className="w-[140px]">1 bags - 35kg total</div>
            <div className="w-[50px] text-center">BAG</div>
            <div className="w-[80px] text-right font-black text-slate-900">$ 30.00</div>
          </div>

        </div>

      </div>
    </div>
  );
}
