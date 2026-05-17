import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      {/* Hero & FlightSearch Skeleton */}
      <div className="w-full flex-1 flex flex-col relative">
        <div className="w-full h-[650px] bg-slate-200 animate-pulse relative">
          <div className="absolute inset-0 flex items-center justify-center top-20 px-4">
            <div className="h-[340px] w-full max-w-[1500px] xl:max-w-full mx-auto bg-white/60 rounded-[1.5rem] shadow-xl"></div>
          </div>
        </div>
        
        {/* Why Choose Us Skeletons */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12">
            <div className="flex flex-col items-center mb-10 mt-12 gap-4">
                <div className="h-8 w-48 bg-slate-200 animate-pulse rounded"></div>
                <div className="h-12 w-[600px] max-w-full bg-slate-200 animate-pulse rounded"></div>
            </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1500px] mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="h-[140px] bg-slate-200 animate-pulse rounded-[10px]"></div>
                <div className="h-[140px] bg-slate-200 animate-pulse rounded-[10px]"></div>
                <div className="h-[140px] bg-slate-200 animate-pulse rounded-[10px]"></div>
            </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
