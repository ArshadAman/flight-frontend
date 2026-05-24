"use client";

import React from "react";
import { X } from "lucide-react";

export function RulesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-[500px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#F2FBFF] px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-[#D60D26] text-[18px] font-bold tracking-tight">Rules</h2>
          <button onClick={onClose} className="text-slate-800 hover:bg-white/50 p-1 rounded-md transition-colors">
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {/* Flight Badge Sub-header */}
        <div className="px-6 py-4 flex items-center gap-4 border-b border-slate-100">
          <div className="border-[1.5px] border-blue-600 rounded px-2.5 py-0.5 relative">
            <div className="absolute -left-[1.5px] top-1/2 -translate-y-1/2 w-[3px] h-[10px] bg-white rounded-r-full border-r-[1.5px] border-blue-600" />
            <div className="absolute -right-[1.5px] top-1/2 -translate-y-1/2 w-[3px] h-[10px] bg-white rounded-l-full border-l-[1.5px] border-blue-600" />
            <span className="text-blue-600 font-black text-[13px] tracking-wide">PUB</span>
          </div>
          <span className="font-semibold text-slate-700 text-[14px]">AI 2814</span>
          <span className="font-semibold text-slate-700 text-[14px]">DEL &rarr; MUM</span>
        </div>

        {/* Main Content */}
        <div className="p-6 flex flex-col gap-4 text-[14px] text-slate-600 leading-relaxed">
          <p>General: <span className="font-bold text-slate-800">Economy</span></p>
          
          <p>
            Please be informed that changes and cancellation are not allowed after ticket order. 
            Optional reservation not offered, charges apply at time of ticket order.
            <br />
            ATTENTION: The terms in the 'General Terms and Conditions' link may not apply to this offer!
          </p>

          <p>Farebase: <span className="font-bold text-slate-800">ROIP</span></p>
        </div>

        {/* Penalties Box */}
        <div className="bg-[#F2FBFF] px-6 py-5">
          <p className="text-[14px] text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Penalties:</span> Please be informed that changes and cancellation are not allowed after ticket order.
          </p>
        </div>

      </div>
    </div>
  );
}
