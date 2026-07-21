export function BookingInfo({ ticket }: { ticket?: any }) {
  const displayPnr = ticket?.status === "PENDING" ? "PENDING" : (ticket?.pnr_number || "XYR9NF");
  const displayTicketPnr = ticket?.status === "PENDING" ? "PENDING" : (ticket?.ticket_number || "XYR9NF");
  
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
      : ticket.status === "FAILED"
      ? "Failed"
      : ticket.status
    : "Booking Confirm";
  const statusColorClass = ticket
    ? ticket.status === "CONFIRMED"
      ? "text-green-600"
      : ticket.status === "CANCELLED" || ticket.status === "FAILED"
      ? "text-rose-600"
      : "text-amber-600"
    : "text-green-600";

  const displayPrice = ticket 
    ? `₹${parseFloat(ticket.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    : "₹3,500.00";

  const failureReason =
    ticket?.cancellation_data?.failure_reason ||
    ticket?.cancellation_data?.gds_error ||
    ticket?.gds_error ||
    ticket?.agent_cancellation_reason ||
    null;
  const cancelRemarks =
    ticket?.agent_cancellation_reason || ticket?.cancellation_data?.remarks || null;

  return (
    <>
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
        <span className="text-[36px] font-black text-primary tracking-tighter">{displayPrice}</span>
      </div>
    </div>
    {ticket?.status === "CANCELLED" && cancelRemarks && (
      <div className="mx-8 mb-4 p-5 bg-rose-50 border border-rose-200 rounded-3xl flex items-start gap-3 text-rose-800 shadow-sm animate-in fade-in duration-300">
        <svg className="w-5 h-5 text-[#D60D26] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <span className="block font-black text-xs uppercase tracking-wider text-[#D60D26] mb-1">
            Cancellation Remarks
          </span>
          <p className="text-sm font-semibold text-slate-700 leading-relaxed">
            {cancelRemarks}
          </p>
        </div>
      </div>
    )}
    {(ticket?.status === "FAILED" || (ticket?.status === "CANCELLED" && failureReason)) && failureReason && (
      <div className="mx-8 mb-8 p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-3 text-amber-900 shadow-sm animate-in fade-in duration-300">
        <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <span className="block font-black text-xs uppercase tracking-wider text-amber-700 mb-1">
            {ticket?.status === "FAILED" ? "Failure Reason" : "Airline Sync / Failure Note"}
          </span>
          <p className="text-sm font-semibold text-slate-700 leading-relaxed">
            {String(failureReason)}
          </p>
        </div>
      </div>
    )}
    </>
  );
}
