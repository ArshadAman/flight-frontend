export function PassengerDetails({ ticket }: { ticket?: any }) {
  const hasLivePassengers = ticket && ticket.passengers_data && ticket.passengers_data.length > 0;
  const displayTicketPnr = ticket?.status === "PENDING" ? "PENDING" : (ticket?.ticket_number || "XYR9NF");
  const displayPnr = ticket?.status === "PENDING" ? "PENDING" : (ticket?.pnr_number || "XYR9NF");

  let passengers = [
    { no: 1, title: "MR", firstName: "HARSHIT", lastName: "CHIRGANIA", type: "Adult", eticket: "079176412201", airlinePnr: "AYDAE6" },
    { no: 2, title: "MR", firstName: "VAIBHAV", lastName: "ARORA", type: "Adult", eticket: "079176412201", airlinePnr: "AYDAE6" }
  ];

  if (hasLivePassengers) {
    passengers = ticket.passengers_data.map((pax: any, idx: number) => ({
      no: idx + 1,
      title: (pax.title || "MR").toUpperCase(),
      firstName: (pax.first_name || "Guest").toUpperCase(),
      lastName: (pax.last_name || "User").toUpperCase(),
      type: pax.pax_type === 0 ? "Adult" : pax.pax_type === 1 ? "Child" : "Infant",
      eticket: displayTicketPnr,
      airlinePnr: displayPnr
    }));
  }

  return (
    <>
      <div className="w-full bg-[#F2FBFF] px-8 py-3.5 border-b border-gray-200">
        <h3 className="text-[17px] font-[750] text-[#0C2342] tracking-tight">Passenger details:</h3>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-8 text-[15px] font-[700] text-gray-400">No.</th>
              <th className="py-4 px-2 text-[15px] font-[700] text-gray-400">Title</th>
              <th className="py-4 px-2 text-[15px] font-[700] text-gray-400">First Name</th>
              <th className="py-4 px-2 text-[15px] font-[700] text-gray-400">Last Name</th>
              <th className="py-4 px-2 text-[15px] font-[700] text-gray-400">Passenger Type</th>
              <th className="py-4 px-2 text-[15px] font-[700] text-gray-400">E-Ticket Number</th>
              <th className="py-4 px-8 text-[15px] font-[700] text-gray-400">Airlines PNR</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((p: any) => (
              <tr key={p.no} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-5 px-8 text-[16px] font-[700] text-gray-700">{p.no}</td>
                <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">{p.title}</td>
                <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">{p.firstName}</td>
                <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">{p.lastName}</td>
                <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">{p.type}</td>
                <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">{p.eticket}</td>
                <td className="py-5 px-8 text-[16px] font-[700] text-gray-700">{p.airlinePnr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
