"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function B2BRegistrationForm() {
  const [agentType, setAgentType] = useState("iata");

  const InputField = ({ placeholder, required, className = "" }: { placeholder: string, required?: boolean, className?: string }) => {
    const [val, setVal] = useState("");
    return (
      <div className={`relative border border-gray-200 rounded-lg h-12 bg-white flex items-center shadow-sm ${className}`}>
        {!val && (
          <div className="absolute left-4 text-[13px] text-gray-500 pointer-events-none">
            {placeholder} {required && <span className="text-[#D60D26]">*</span>}
          </div>
        )}
        <input 
          type="text" 
          className="w-full h-full px-4 bg-transparent outline-none text-[13px] text-gray-800 focus:ring-2 focus:ring-[#F2FBFF] rounded-lg transition-all" 
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
      </div>
    );
  };

  const SelectField = ({ placeholder, required, className = "" }: { placeholder: string, required?: boolean, className?: string }) => {
    const [val, setVal] = useState("");
    return (
      <div className={`relative border border-gray-200 rounded-lg h-12 bg-white flex items-center shadow-sm ${className}`}>
        {!val && (
          <div className="absolute left-4 text-[13px] text-gray-500 pointer-events-none">
            {placeholder} {required && <span className="text-[#D60D26]">*</span>}
          </div>
        )}
        <select 
          className="w-full h-full px-4 bg-transparent outline-none text-[13px] text-gray-800 appearance-none relative z-10 cursor-pointer focus:ring-2 focus:ring-[#F2FBFF] rounded-lg transition-all" 
          value={val}
          onChange={(e) => setVal(e.target.value)}
        >
          <option value="" disabled hidden></option>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
        <div className="absolute right-4 text-gray-400 z-0">
          <ChevronDown size={16} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-[24px] overflow-hidden shadow-2xl flex flex-col">
      {/* Top Section - Pink Background */}
      <div className="bg-[#F2FBFF] px-6 sm:px-10 py-8 border-b border-[#F2FBFF]">
        <h2 className="text-[#D60D26] font-[800] text-lg mb-6 tracking-wide">Registration Form:</h2>
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${agentType === 'iata' ? 'border-[#D60D26] bg-white' : 'border-gray-400 bg-white'}`}>
              {agentType === 'iata' && <div className="w-2.5 h-2.5 rounded-full bg-[#D60D26]" />}
            </div>
            <input type="radio" name="agentType" className="hidden" checked={agentType === 'iata'} onChange={() => setAgentType('iata')} />
            <span className="text-gray-800 font-medium text-[14px]">B2B Travel Agent (IATA Accredited)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${agentType === 'non-iata' ? 'border-[#D60D26] bg-white' : 'border-gray-400 bg-white'}`}>
              {agentType === 'non-iata' && <div className="w-2.5 h-2.5 rounded-full bg-[#D60D26]" />}
            </div>
            <input type="radio" name="agentType" className="hidden" checked={agentType === 'non-iata'} onChange={() => setAgentType('non-iata')} />
            <span className="text-gray-800 font-medium text-[14px]">B2B Travel Agent ( Non-IATA Accredited)</span>
          </label>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-5">
        <p className="text-[13px] font-bold text-gray-700 flex items-center gap-1.5 italic tracking-wide">
          <span className="text-[#D60D26] text-lg leading-none">*</span> Compulsory to fill
        </p>
      </div>

      <div className="bg-[#F2FBFF] px-6 sm:px-10 py-4 border-y border-gray-200">
        <h3 className="font-bold text-gray-800 text-[14px]">Agency Information</h3>
      </div>

      <div className="px-6 sm:px-10 py-8 flex flex-col gap-10">
        {/* AGENCY DETAILS */}
        <div>
          <h4 className="text-[12px] font-bold text-gray-500 tracking-[0.08em] mb-5 uppercase">AGENCY DETAILS:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <InputField placeholder="Agency / Trading Name" required />
            <InputField placeholder="Legal Company Name" />
            <InputField placeholder="Company Registration Number" />
            <InputField placeholder="VAT Identification Number" />
          </div>
        </div>

        {/* ADDRESS DETAILS */}
        <div>
          <h4 className="text-[12px] font-bold text-gray-500 tracking-[0.08em] mb-5 uppercase">ADDRESS DETAILS:</h4>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col md:flex-row gap-5">
              <InputField placeholder="Address (Street Name)" required className="md:flex-[2.5]" />
              <InputField placeholder="Postal Code" required className="md:flex-[1]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <SelectField placeholder="Country Name" required />
              <SelectField placeholder="City Name" required />
            </div>
          </div>
        </div>

        {/* EXTRA INFORMATION */}
        <div>
          <h4 className="text-[12px] font-bold text-gray-500 tracking-[0.08em] mb-5 uppercase">EXTRA INFORMATION:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <InputField placeholder="Agency Website URL" />
            <SelectField placeholder="Types Of Business" />
          </div>
        </div>
      </div>
    </div>
  );
}
