import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default async function DestinationPage({ params }: { params: Promise<{ city: string }> }) {
    const { city } = await params;
    const formattedCity = city.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
        <div className="w-full min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            {/* Top Header Banner */}
            <div className="w-full bg-primary py-16">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-[800] text-white tracking-tight">
                        Discover {formattedCity}
                    </h1>
                    <p className="text-rose-100 mt-4 text-lg max-w-2xl mx-auto">
                        Explore the best flights, tours, and packages available for your next adventure to {formattedCity}.
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="container mx-auto px-6 lg:px-12 py-16 flex-1">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Available Tours and Flights</h2>
                    
                    <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="font-medium text-lg">We are gathering the best deals for {formattedCity}.</p>
                        <p className="mt-2">Check back shortly to book your trip!</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
