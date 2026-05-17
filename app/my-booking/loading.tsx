import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Loading() {
    return (
        <div className="w-full min-h-screen bg-white flex flex-col font-sans">
            <Navbar />

            {/* Header Banner Skeleton */}
            <div className="w-full bg-slate-100 py-10 sm:py-12 border-b border-slate-200 animate-pulse">
                <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-3">
                    <div className="h-10 w-48 bg-slate-200 rounded"></div>
                    <div className="h-6 w-64 bg-slate-200 rounded"></div>
                </div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 flex-1 max-w-[1450px]">
                {/* Main Card Container Skeleton */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-12 animate-pulse">
                    
                    {/* Top PNR Header Skeleton */}
                    <div className="bg-slate-50 px-6 py-6 flex items-center border-b border-slate-100 min-h-[80px]">
                        <div className="h-8 w-64 bg-slate-200 rounded"></div>
                    </div>

                    {/* Booking Basic Info Grid Skeleton */}
                    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-b border-slate-100">
                        <div className="flex flex-col gap-4">
                            <div className="h-6 w-full bg-slate-200 rounded"></div>
                            <div className="h-6 w-full bg-slate-200 rounded"></div>
                            <div className="h-6 w-full bg-slate-200 rounded"></div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="h-6 w-full bg-slate-200 rounded"></div>
                            <div className="h-6 w-full bg-slate-200 rounded"></div>
                            <div className="h-6 w-full bg-slate-200 rounded"></div>
                        </div>
                        <div className="col-span-1 lg:col-span-2 flex justify-end items-end h-full mt-4 lg:mt-0">
                            <div className="h-12 w-32 bg-slate-200 rounded"></div>
                        </div>
                    </div>

                    {/* Passenger Details Skeleton Section */}
                    <div className="w-full bg-slate-50 px-8 py-4 border-b border-slate-200">
                        <div className="h-6 w-48 bg-slate-200 rounded"></div>
                    </div>
                    <div className="p-8 flex flex-col gap-4">
                        <div className="h-12 w-full bg-slate-100 rounded"></div>
                        <div className="h-12 w-full bg-slate-100 rounded"></div>
                    </div>

                    {/* Flight Path / Itinerary Skeleton Section */}
                    <div className="w-full bg-slate-50 px-8 py-4 border-b border-slate-200">
                        <div className="h-6 w-48 bg-slate-200 rounded"></div>
                    </div>
                    <div className="p-8 min-h-[160px] flex items-center">
                         <div className="h-[120px] w-full bg-slate-100 rounded-2xl"></div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
