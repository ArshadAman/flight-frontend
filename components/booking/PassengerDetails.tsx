export function PassengerDetails() {
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
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-5 px-8 text-[16px] font-[700] text-gray-700">1</td>
              <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">MR</td>
              <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">HARSHIT</td>
              <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">CHIRGANIA</td>
              <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">Adult</td>
              <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">079176412201</td>
              <td className="py-5 px-8 text-[16px] font-[700] text-gray-700">AYDAE6</td>
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-5 px-8 text-[16px] font-[700] text-gray-700">2</td>
              <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">MR</td>
              <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">VAIBHAV</td>
              <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">ARORA</td>
              <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">Adult</td>
              <td className="py-5 px-2 text-[16px] font-[700] text-gray-700">079176412201</td>
              <td className="py-5 px-8 text-[16px] font-[700] text-gray-700">AYDAE6</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
