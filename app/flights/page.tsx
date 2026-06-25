import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FlightSearch } from "@/components/FlightSearch";

export default function FlightsPage() {
    return (
        <div className="w-full min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Top Header Banner */}
            <div className="w-full bg-primary py-12">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-[600] text-white tracking-tight">
                        Flight Search
                    </h1>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="container mx-auto px-6 lg:px-12 py-16 flex-1 flex flex-col items-center">
                <div className="w-full max-w-[1400px] -mt-24">
                    <FlightSearch />
                </div>
            </main>

            <Footer />
        </div>
    );
}
