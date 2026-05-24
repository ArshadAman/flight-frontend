export function BookingInfo() {
  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-b border-gray-100">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between w-[200px]">
          <span className="text-[15px] font-[600] text-gray-400">PNR</span>
          <span className="text-[15px] font-[800] text-gray-800">XYR9NF - Outbound</span>
        </div>
        <div className="flex justify-between w-[200px]">
          <span className="text-[15px] font-[600] text-gray-400">Ticket PNR</span>
          <span className="text-[15px] font-[800] text-gray-800">XYR9NF</span>
        </div>
        <div className="flex justify-between w-[200px]">
          <span className="text-[15px] font-[600] text-gray-400">Travel Date</span>
          <span className="text-[15px] font-[800] text-gray-800">24 Oct&apos;25 - Wednesday</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between w-[200px]">
          <span className="text-[15px] font-[600] text-gray-400">Status details</span>
          <span className="text-[15px] font-[800] text-gray-800">12 SEP&apos;25</span>
        </div>
        <div className="flex justify-between w-[200px]">
          <span className="text-[15px] font-[600] text-gray-400">Booking status</span>
          <span className="text-[15px] font-[800] text-green-600">Booking Confirm</span>
        </div>
        <div className="flex justify-between w-[200px]">
          <span className="text-[15px] font-[600] text-gray-400">Booking status</span>
          <span className="text-[15px] font-[800] text-gray-800">Booking Confirm<br /><span className="text-gray-400 text-[13px] font-[600]">Paid Amount</span></span>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-2 flex justify-end items-end h-full mt-4 lg:mt-0">
        <span className="text-[36px] font-[900] text-[#D60D26] tracking-tighter">$123.89</span>
      </div>
    </div>
  );
}
