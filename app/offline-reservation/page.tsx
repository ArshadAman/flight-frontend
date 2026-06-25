import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function OfflineReservationPage() {
    return (
        <div className="w-full min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Top Header Banner */}
            <div className="w-full bg-primary py-12">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-[600] text-white tracking-tight">
                        Offline Reservation Portal
                    </h1>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="container mx-auto px-6 lg:px-12 py-16 flex-1">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Submit Offline Request</h2>
                    <form className="max-w-xl mx-auto space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-slate-700">Agent Name</label>
                            <input type="text" className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-primary" placeholder="Enter your name" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-slate-700">Passenger Details</label>
                            <textarea className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-primary h-32" placeholder="Enter passenger details and requirements..." />
                        </div>
                        <button type="button" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]">
                            Submit Reservation Request
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
