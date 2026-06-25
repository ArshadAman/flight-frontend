import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";

export default function B2BForSalePage() {
    return (
        <div className="w-full min-h-screen bg-background flex flex-col">
            <B2BNavbar />

            {/* Top Header Banner */}
            <div className="w-full bg-primary py-12">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-[600] text-white tracking-tight">
                        Inventory For Sale (B2B)
                    </h1>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="container mx-auto px-6 lg:px-12 py-16 flex-1">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Exclusive Agent Travel Deals</h2>
                    <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
                        Explore our B2B agent-curated list of exclusive flights, packages, and group travel inventory available for direct purchase at discounted rates.
                    </p>
                    
                    <div className="text-center py-12 text-slate-400">
                        <p className="font-medium text-lg">No agent inventory currently available.</p>
                        <p>Please check back later for new exclusive B2B deals.</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
