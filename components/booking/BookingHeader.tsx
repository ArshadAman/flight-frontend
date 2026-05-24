import { Plane, Printer, FileText, Share2, FileDown } from "lucide-react";

export function BookingHeader({ ticket, isB2B = false }: { ticket?: any; isB2B?: boolean }) {
  const displayPnr = ticket?.pnr_number || "XYR9NF";
  return (
    <div className="bg-[#FFFFFF] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-rose-100 gap-4">
      <div className="flex items-center gap-2">
        <Plane className="w-6 h-6 text-[#D60D26] rotate-45" strokeWidth={2.5} />
        <h2 className="text-[24px] font-[800] text-gray-800 ml-2">{displayPnr}</h2>
        <span className="text-[18px] font-[600] text-gray-500 ml-1">({ticket?.travel_type === 1 ? "Round Trip" : "Outbound"})</span>
      </div>

      <div className="flex items-center gap-3">
        {isB2B && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-[15px] font-[700] text-gray-600 hover:text-[#D60D26] hover:border-red-200 transition-colors shadow-sm">
            <Printer className="w-4 h-4" /> Print ticket
          </button>
        )}
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-[15px] font-[700] text-gray-600 hover:text-[#D60D26] hover:border-red-200 transition-colors shadow-sm">
          <FileText className="w-4 h-4" /> e-Ticket
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-[15px] font-[700] text-[#D60D26] hover:bg-red-50 transition-colors shadow-sm">
          <Share2 className="w-4 h-4" /> Share
        </button>
        {isB2B && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-[15px] font-[700] text-[#D60D26] hover:bg-red-50 transition-colors shadow-sm">
            <FileDown className="w-4 h-4" /> pdf
          </button>
        )}
      </div>
    </div>
  );
}
