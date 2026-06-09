export function BookingInfo({ ticket }: { ticket?: any }) {
  const displayPnr = ticket?.pnr_number || "XYR9NF";
  const displayTicketPnr = ticket?.ticket_number || "XYR9NF";
  
  let displayTravelDate = "24 Oct'25 - Wednesday";
  let displayStatusDate = "12 SEP'25";
  if (ticket && ticket.departure_datetime) {
    const depDate = new Date(ticket.departure_datetime);
    displayTravelDate = depDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }) + " - " + depDate.toLocaleDateString("en-US", { weekday: "long" });

    const createdDate = ticket.created_at ? new Date(ticket.created_at) : new Date();
    displayStatusDate = createdDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).toUpperCase();
  }

  const displayStatus = ticket
    ? ticket.status === "CONFIRMED"
      ? "Confirmed"
      : ticket.status === "CANCELLED"
      ? "Cancelled"
      : ticket.status
    : "Booking Confirm";
  const statusColorClass = ticket
    ? ticket.status === "CONFIRMED"
      ? "text-green-600"
      : ticket.status === "CANCELLED"
      ? "text-rose-600"
      : "text-amber-600"
    : "text-green-600";

  const displayPrice = ticket 
    ? `₹${parseFloat(ticket.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    : "₹3,500.00";

  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-b border-gray-100">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between w-[200px]">
          <span className="text-[15px] font-[600] text-gray-400">PNR</span>
          <span className="text-[15px] font-[800] text-gray-800">{displayPnr}</span>
        </div>
        <div className="flex justify-between w-[200px]">
          <span className="text-[15px] font-[600] text-gray-400">Ticket PNR</span>
          <span className="text-[15px] font-[800] text-gray-800">{displayTicketPnr}</span>
        </div>
        <div className="flex justify-between w-[200px]">
          <span className="text-[15px] font-[600] text-gray-400">Travel Date</span>
          <span className="text-[15px] font-[800] text-gray-800">{displayTravelDate}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between w-[200px]">
          <span className="text-[15px] font-[600] text-gray-400">Status details</span>
          <span className="text-[15px] font-[800] text-gray-800">{displayStatusDate}</span>
        </div>
        <div className="flex justify-between w-[200px]">
          <span className="text-[15px] font-[600] text-gray-400">Booking status</span>
          <span className={`text-[15px] font-[800] ${statusColorClass}`}>{displayStatus}</span>
        </div>
        <div className="flex justify-between w-[200px]">
          <span className="text-[15px] font-[600] text-gray-400">Booking status</span>
          <span className="text-[15px] font-[800] text-gray-800">{displayStatus}<br /><span className="text-gray-400 text-[13px] font-[600]">Paid Amount</span></span>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-2 flex justify-end items-end h-full mt-4 lg:mt-0">
        <span className="text-[36px] font-[900] text-[#DE0A26] tracking-tighter">{displayPrice}</span>
      </div>
    </div>
  );
}
