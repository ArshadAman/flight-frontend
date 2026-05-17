import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { Settings, Globe, ShieldCheck, TrendingUp } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="w-full min-h-screen bg-white flex flex-col">
            <Navbar />

            {/* Top Header Banner */}
            <div className="w-full bg-[#ebd9dc] py-18 sm:py-12 border-b border-rose-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <h1 className="text-3xl md:text-4xl font-[600] text-[#1e2329] tracking-tight">
                        About Us
                    </h1>
                </div>
            </div>

            {/* Main Content Area: Full Width Typography */}
            <main className="container mx-auto px-6 lg:px-12 py-16 md:py-24 flex-1">
                <div className="w-full max-w-none"> 
                    <div className="flex flex-col">
                        {/* Heading - Expanded Width */}
                        <h2 className="text-[25px] md:text-[35px] font-[800] text-[#1e2329] leading-tight mb-10">
                            Why Us?
                        </h2>

                        {/* Paragraph Content - Covering the page to the end */}
                        <div className="text-gray-600/80 text-[18px] md:text-[20px] leading-[1.8] space-y-8 w-full">
                            <p className="text-justify md:text-left">
                                Lorem ipsum dolor sit amet consectetur. Ut elit eu fames eleifend erat quis. Tincidunt ac commodo lectus et egestas consectetur sit. Justo amet metus ut sit viverra non est proin. Viverra morbi luctus sit condimentum amet metus morbi maecenas. Nunc faucibus ultrices nisl sed risus tristique cursus platea nascetur. Tellus tempor ultricies placerat mollis non. In amet dictum ut urna. Est neque cras volutpat enim massa sed. Pulvinar accumsan pulvinar curabitur sed ut metus tincidunt sagittis. Pulvinar facilisi pellentesque integer morbi ultricies tristique felis. Diam eros nibh donec proin a ut dictum auctor.
                            </p>
                            
                            {/* Bold Call to Action Line */}
                            <p className="font-[700] text-[#1e2329] text-[22px] md:text-[24px] pt-4 border-t border-gray-100">
                                So, next time you plan a trip, choose My Travel Deal for a stress-free booking experience!
                            </p>
                        </div>

                        {/* Careers Link */}
                        <div className="mt-12">
                            <button className="text-[#DE0A26] text-lg font-[600] hover:underline transition-all flex items-center gap-2 group">
                                Come work with us
                                <span className="transform transition-transform group-hover:translate-x-2">→</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Travel Stats/Icons Section - Balanced Full Width */}
                <div className="mt-28 md:mt-36 border border-gray-100 rounded-[2rem] shadow-sm bg-white overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                        {/* Stat 1: Personalized Service */}
                        <div className="p-10 flex flex-col items-center text-center hover:bg-rose-50/30 transition-colors">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-[#DE0A26]">
                                <Settings className="w-8 h-8" />
                            </div>
                            <h3 className="text-[19px] font-[700] text-[#1e2329] mb-3">Personalized Service</h3>
                            <p className="text-[15px] text-gray-500 leading-relaxed">Tailored travel experiences crafted just for you.</p>
                        </div>

                        {/* Stat 2: Diverse Services */}
                        <div className="p-10 flex flex-col items-center text-center hover:bg-rose-50/30 transition-colors">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-[#DE0A26]">
                                <Globe className="w-8 h-8" />
                            </div>
                            <h3 className="text-[19px] font-[700] text-[#1e2329] mb-3">Diverse Range of Services</h3>
                            <p className="text-[15px] text-gray-500 leading-relaxed">Flights, hotels, tours, and complete packages.</p>
                        </div>

                        {/* Stat 3: Trust */}
                        <div className="p-10 flex flex-col items-center text-center hover:bg-rose-50/30 transition-colors">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-[#DE0A26]">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-[19px] font-[700] text-[#1e2329] mb-3">Transparency and Trust</h3>
                            <p className="text-[15px] text-gray-500 leading-relaxed">No hidden fees, complete pricing clarity.</p>
                        </div>

                        {/* Stat 4: Customer Care */}
                        <div className="p-10 flex flex-col items-center text-center hover:bg-rose-50/30 transition-colors">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-[#DE0A26]">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <h3 className="text-[19px] font-[700] text-[#1e2329] mb-3">Customer-Centric Approach</h3>
                            <p className="text-[15px] text-gray-500 leading-relaxed">24/7 support dedicated to your satisfaction.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Reusable Branding Components */}
            <PromoBanner />
            <Footer />
        </div>
    );
}