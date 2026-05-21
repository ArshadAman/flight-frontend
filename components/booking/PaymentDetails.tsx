export function PaymentDetails({ isB2B = false }: { isB2B?: boolean }) {
  return (
    <>
      <div className="w-full bg-[#f4f5f7] px-8 py-3.5 border-y border-gray-200">
        <h3 className="text-[17px] font-[750] text-[#333] tracking-tight">Payments</h3>
      </div>
      <div className="w-full overflow-x-auto p-4 pb-8">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr>
              <th className="py-2 px-8 text-[15px] font-[700] text-gray-400">Price details:</th>
            </tr>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-8 text-[14px] font-[700] text-gray-400">No.</th>
              <th className="py-4 px-2 text-[14px] font-[700] text-gray-400">Pax</th>
              <th className="py-4 px-2 text-[14px] font-[700] text-gray-400 text-right pr-6">Price</th>
              {isB2B && <th className="py-4 px-2 text-[14px] font-[700] text-gray-400 text-right pr-6">Tax</th>}
              <th className="py-4 px-8 text-[14px] font-[700] text-gray-400 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50">
              <td className="py-4 px-8 text-[15px] font-[700] text-gray-700">1</td>
              <td className="py-4 px-2 text-[15px] font-[700] text-gray-700">CHIRGANIA HARSHIT MR</td>
              <td className="py-4 px-2 text-[15px] font-[700] text-gray-700 text-right pr-6">$42.40</td>
              {isB2B && <td className="py-4 px-2 text-[15px] font-[700] text-gray-700 text-right pr-6">$0.00</td>}
              <td className="py-4 px-8 text-[15px] font-[800] text-gray-800 text-right">$42.40</td>
            </tr>
            <tr>
              <td className="py-4 px-8 text-[15px] font-[700] text-gray-700">2</td>
              <td className="py-4 px-2 text-[15px] font-[700] text-gray-700">ARORA VAIBHAV MR</td>
              <td className="py-4 px-2 text-[15px] font-[700] text-gray-700 text-right pr-6">$42.40</td>
              {isB2B && <td className="py-4 px-2 text-[15px] font-[700] text-gray-700 text-right pr-6">$0.00</td>}
              <td className="py-4 px-8 text-[15px] font-[800] text-gray-800 text-right">$42.40</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export function BookingActions({ isB2B = false }: { isB2B?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 w-full mb-10 px-2 lg:px-8">
      <button className="flex-1 min-w-[140px] px-4 py-3.5 rounded-full border border-gray-300 text-[16px] font-[800] text-[#1e2329] hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white text-center tracking-tight">
        Cancel Booking
      </button>
      <button className="flex-1 min-w-[140px] px-4 py-3.5 rounded-full border border-gray-300 text-[16px] font-[800] text-[#1e2329] hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white text-center tracking-tight">
        Add Baggage
      </button>
      {isB2B && (
        <button className="flex-1 min-w-[140px] px-4 py-3.5 rounded-full border border-gray-300 text-[16px] font-[800] text-[#1e2329] hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white text-center tracking-tight">
          Check Refund
        </button>
      )}
      {isB2B && (
        <button className="flex-1 min-w-[140px] px-4 py-3.5 rounded-full border border-gray-300 text-[16px] font-[800] text-[#1e2329] hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white text-center tracking-tight">
          Modification
        </button>
      )}
      <button className="flex-1 min-w-[140px] px-4 py-3.5 rounded-full border border-gray-300 text-[16px] font-[800] text-[#1e2329] hover:bg-[#DE0A26] hover:text-white hover:border-[#DE0A26] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white text-center tracking-tight">
        Print
      </button>
    </div>
  );
}
