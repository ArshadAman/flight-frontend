import { Armchair } from "lucide-react";

export function PassengerMoreDetails() {
  return (
    <>
      <div className="w-full bg-[#F2FBFF] px-8 py-3.5 border-y border-gray-200">
        <h3 className="text-[17px] font-[750] text-[#0C2342] tracking-tight">More details:</h3>
      </div>

      <div className="p-8 flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 border-b border-gray-100 pb-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4 flex flex-col gap-4">
            <h4 className="text-[17px] font-[800] text-gray-800 tracking-tight">MR. HARSHIT CHIRGANIA</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pr-10">
              <div>
                <span className="text-[14px] font-[700] text-gray-400 block mb-2">Baggage</span>
                <div className="flex flex-col gap-1">
                  <div className="w-8 h-8 rounded border border-[#D60D26] flex items-center justify-center text-[#D60D26] shadow-sm bg-red-50 text-[13px] font-bold">25Kg</div>
                  <span className="text-[13px] font-[600] text-gray-500">Check in bag</span>
                </div>
              </div>
              <div>
                <span className="text-[14px] font-[700] text-gray-400 block mb-2">Seat</span>
                <div className="flex items-center gap-1">
                  <Armchair className="w-5 h-5 text-blue-600" fill="currentColor" strokeWidth={1} />
                  <span className="text-[14px] font-[800] text-gray-700">17C</span>
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-[14px] font-[700] text-gray-400 block mb-2">Meals</span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-[2px] rounded border border-blue-500 flex items-center justify-center text-blue-600 shadow-sm bg-blue-50 text-[13px] font-bold">N/V</div>
                    <div className="px-2 py-[2px] rounded border border-gray-300 flex items-center justify-center text-gray-600 shadow-sm bg-gray-50 text-[13px] font-bold">VEG</div>
                  </div>
                  <span className="text-[13px] font-[600] text-gray-500">Chicken sandwich, Fruit salad</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 flex flex-col justify-end">
            <span className="text-[14px] font-[700] text-gray-400 block mb-2">Barcode</span>
            <div className="w-full h-16 bg-[url('https://librebarcode.com/font/libre-barcode-128-text.svg')] bg-repeat-x bg-contain relative overflow-hidden bg-[rgba(0,0,0,0.85)] mt-1">
              <div className="w-full h-full repeating-linear-gradient opacity-90 mix-blend-overlay"></div>
            </div>
            <span className="text-[14px] font-[900] text-gray-800 text-center tracking-widest mt-1">079176412201</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4 flex flex-col gap-4">
            <h4 className="text-[17px] font-[800] text-gray-800 tracking-tight">MR. VAIBHAV ARORA</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pr-10">
              <div>
                <span className="text-[14px] font-[700] text-gray-400 block mb-2">Baggage</span>
                <div className="flex flex-col gap-1">
                  <div className="w-8 h-8 rounded border border-[#D60D26] flex items-center justify-center text-[#D60D26] shadow-sm bg-red-50 text-[13px] font-bold">25Kg</div>
                  <span className="text-[13px] font-[600] text-gray-500">Check in bag</span>
                </div>
              </div>
              <div>
                <span className="text-[14px] font-[700] text-gray-400 block mb-2">Seat</span>
                <div className="flex items-center gap-1">
                  <Armchair className="w-5 h-5 text-blue-600" fill="currentColor" strokeWidth={1} />
                  <span className="text-[14px] font-[800] text-gray-700">17C</span>
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-[14px] font-[700] text-gray-400 block mb-2">Meals</span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-[2px] rounded border border-blue-500 flex items-center justify-center text-blue-600 shadow-sm bg-blue-50 text-[13px] font-bold">N/V</div>
                    <div className="px-2 py-[2px] rounded border border-gray-300 flex items-center justify-center text-gray-600 shadow-sm bg-gray-50 text-[13px] font-bold">VEG</div>
                  </div>
                  <span className="text-[13px] font-[600] text-gray-500">Chicken sandwich, Fruit salad</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 flex flex-col justify-end">
            <span className="text-[14px] font-[700] text-gray-400 block mb-2">Barcode</span>
            <div className="w-full h-16 bg-[url('https://librebarcode.com/font/libre-barcode-128-text.svg')] bg-repeat-x bg-contain relative overflow-hidden bg-[rgba(0,0,0,0.85)] mt-1">
              <div className="w-full h-full repeating-linear-gradient opacity-90 mix-blend-overlay"></div>
            </div>
            <span className="text-[14px] font-[900] text-gray-800 text-center tracking-widest mt-1">079176412201</span>
          </div>
        </div>
      </div>
    </>
  );
}
