import { Plane, MapPin, Luggage, Armchair, Coffee } from "lucide-react";

export function ItineraryDetails({ ticket }: { ticket?: any }) {
  const origin = ticket?.origin || "DEL";
  const destination = ticket?.destination || "BOM";
  const airlineName = ticket?.airline_name || "AIR INDIA";
  const airlineCode = ticket?.airline_code || "AI";
  const flightNumber = ticket?.flight_number || "2014";
  const cabinClass = ticket?.cabin_class || "Economy";
  const duration = ticket?.duration || "03:55hr";
  
  let depTime = "23:00";
  let arrTime = "11:45";
  let displayDate = "Wed, 24-Oct 25";
  
  if (ticket && ticket.departure_datetime) {
    const depDate = new Date(ticket.departure_datetime);
    displayDate = depDate.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "2-digit"
    });
    
    const [_, depHourMin] = ticket.departure_datetime.split(" ");
    if (depHourMin) depTime = depHourMin;
    
    if (ticket.arrival_datetime) {
      const [__, arrHourMin] = ticket.arrival_datetime.split(" ");
      if (arrHourMin) arrTime = arrHourMin;
    }
  }

  return (
    <>
      <div className="w-full bg-[#F2FBFF] px-8 py-3.5 border-b border-gray-200 mt-2">
        <h3 className="text-[17px] font-[750] text-[#0C2342] tracking-tight">Itinerary details:</h3>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead>
            <tr>
              <th className="pt-6 pb-2 px-8 text-[15px] font-[700] text-gray-400">Airline</th>
              <th className="pt-6 pb-2 px-2 text-[15px] font-[700] text-gray-400">Airlines Number</th>
              <th className="pt-6 pb-2 px-2 text-[15px] font-[700] text-gray-400">Departure Date</th>
              <th className="pt-6 pb-2 px-2 text-[15px] font-[700] text-gray-400">From</th>
              <th className="pt-6 pb-2 px-2 text-[15px] font-[700] text-gray-400">To</th>
              <th className="pt-6 pb-2 px-2 text-[15px] font-[700] text-gray-400">Time</th>
              <th className="pt-6 pb-2 px-2 text-[15px] font-[700] text-gray-400">Duration</th>
              <th className="pt-6 pb-2 px-2 text-[15px] font-[700] text-gray-400">Type</th>
              <th className="pt-6 pb-2 px-8 text-[15px] font-[700] text-gray-400">Services</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-4 px-8">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#D60D26] rounded text-white font-[900] text-[11px] flex items-center justify-center leading-none tracking-tighter shadow-sm">{airlineCode}</div>
                  <span className="text-[16px] font-[800] text-[#D60D26]">{airlineName.toUpperCase()}</span>
                </div>
              </td>
              <td className="py-4 px-2 text-[16px] font-[700] text-gray-700">{airlineCode} {flightNumber}</td>
              <td className="py-4 px-2 text-[16px] font-[700] text-gray-700">{displayDate}</td>
              <td className="py-4 px-2 text-[16px] font-[700] text-gray-700">{origin}</td>
              <td className="py-4 px-2 text-[16px] font-[700] text-gray-700">{destination}</td>
              <td className="py-4 px-2 text-[16px] font-[700] text-gray-700">{depTime} - {arrTime}</td>
              <td className="py-4 px-2 text-[16px] font-[700] text-gray-700">{duration}</td>
              <td className="py-4 px-2 text-[16px] font-[700] text-gray-700">{cabinClass}</td>
              <td className="py-4 px-8 text-[16px] font-[700] text-gray-400 flex items-center gap-2">
                <Luggage className="w-4 h-4" />
                <Armchair className="w-4 h-4" />
                <Coffee className="w-4 h-4" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="w-[calc(100%-4rem)] mx-8 my-6 bg-[#FFFFFF] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl p-6 lg:p-10 flex flex-col pt-[30%] sm:pt-[20%] md:pt-10 overflow-hidden relative min-h-[160px]">
        <div className="w-full flex items-center gap-0 px-4 md:px-12 absolute top-10 md:top-8 left-0 right-0 z-10">
          <div className="h-3 w-3 bg-white border-[2.5px] border-gray-400 rounded-full flex-shrink-0 z-20 shadow-sm relative -top-1"></div>
          <div className="h-[2px] flex-1 border-t-2 border-dashed border-gray-300"></div>
          <div className="mx-4 relative group cursor-pointer z-30">
            <Plane className="w-7 h-7 text-gray-400 rotate-45 transform lg:hover:scale-125 transition-transform" />
          </div>
          <div className="h-[2px] flex-1 border-t-2 border-dashed border-gray-300"></div>
          <div className="h-3 w-3 bg-white border-[2.5px] border-gray-400 rounded-full flex-shrink-0 z-20 shadow-sm relative -top-1">
            <MapPin className="w-5 h-5 text-gray-800 absolute -top-[23px] -left-[6px]" strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex justify-between items-start pt-16 md:pt-14 mt-auto">
          <div className="text-left w-[140px]">
            <h3 className="text-[19px] font-[800] text-[#121121] tracking-tight whitespace-nowrap">{origin === "DEL" ? "New Delhi" : origin}, {origin}</h3>
            <p className="text-[15px] font-[600] text-gray-400 mt-1">Terminal 3</p>
            <span className="inline-block mt-3 px-3 py-[2px] bg-white border border-gray-200 rounded-[5px] text-[14px] font-[800] text-gray-700 shadow-sm">{depTime}</span>
          </div>

          <div className="text-center flex flex-col items-center flex-1 mx-4">
            <div className="w-10 h-10 bg-[#D60D26] rounded-xl flex items-center justify-center mb-1 shadow-sm mt-0 md:-mt-6">
              <span className="text-white text-[15px] font-[900] tracking-tighter">{airlineCode}</span>
            </div>
            <p className="text-[14px] font-[800] text-gray-600 tracking-tight whitespace-nowrap">{airlineName} ({airlineCode} {flightNumber})</p>
            <span className="text-[14px] font-[800] text-blue-600 flex items-center gap-1 mt-0.5">
              {duration}
            </span>
          </div>

          <div className="text-right w-[140px]">
            <h3 className="text-[19px] font-[800] text-[#121121] tracking-tight whitespace-nowrap">{destination === "BKK" ? "Bangkok" : destination === "BOM" ? "Mumbai" : destination}, {destination}</h3>
            <p className="text-[15px] font-[600] text-gray-400 mt-1">Terminal 3</p>
            <span className="inline-block mt-3 px-3 py-[2px] bg-white border border-gray-200 rounded-[5px] text-[14px] font-[800] text-gray-700 shadow-sm">{arrTime}</span>
          </div>
        </div>
      </div>
    </>
  );
}
