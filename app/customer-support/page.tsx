import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MessageSquare, PhoneCall, Info, FileText, ChevronRight } from "lucide-react";
import Link from 'next/link';

export default function CustomerSupportPage() {
    return (
        <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            {/* Top Banner with Breadcrumbs */}
            <div className="w-full bg-[#ebd9dc] py-14 sm:py-16 border-b border-rose-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col">
                    <h1 className="text-[32px] md:text-[38px] font-[700] text-[#555a60] tracking-tight mb-3">
                        Customer support
                    </h1>
                    <div className="flex items-center text-[15px] font-[600] text-gray-500/80 gap-2">
                        <Link href="/" className="hover:text-red-700 transition-colors">Home</Link>
                        <span>→</span>
                        <span className="text-gray-600/90">Customer Support</span>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-20 flex-1 w-full max-w-[1450px]">

                {/* 4-Column Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                    {/* Chat */}
                    <button className="bg-white border border-gray-100 rounded-[12px] p-6 shadow-sm hover:shadow-md hover:border-red-100 transition-all flex items-center justify-center gap-3 w-full h-[80px]">
                        <MessageSquare className="w-[22px] h-[22px] text-[#DE0A26] stroke-[2px]" />
                        <span className="text-[17px] font-[600] text-gray-600">Chat</span>
                    </button>

                    {/* Call Us */}
                    <button className="bg-white border border-gray-100 rounded-[12px] p-6 shadow-sm hover:shadow-md hover:border-red-100 transition-all flex items-center justify-center gap-3 w-full h-[80px]">
                        <PhoneCall className="w-[22px] h-[22px] text-[#DE0A26] stroke-[2px]" />
                        <span className="text-[17px] font-[600] text-gray-600">Call Us</span>
                    </button>

                    {/* FAQs */}
                    <button className="bg-white border border-gray-100 rounded-[12px] p-6 shadow-sm hover:shadow-md hover:border-red-100 transition-all flex items-center justify-center gap-3 w-full h-[80px]">
                        <Info className="w-[22px] h-[22px] text-[#DE0A26] stroke-[2px]" />
                        <span className="text-[17px] font-[600] text-gray-600">FAQs</span>
                    </button>

                    {/* Write Us */}
                    <button className="bg-white border border-gray-100 rounded-[12px] p-6 shadow-sm hover:shadow-md hover:border-red-100 transition-all flex items-center justify-center gap-3 w-full h-[80px]">
                        <FileText className="w-[22px] h-[22px] text-[#DE0A26] stroke-[2px]" />
                        <span className="text-[17px] font-[600] text-gray-600">Write Us</span>
                    </button>
                </div>

                {/* FAQ Section */}
                <div className="w-full mb-10">
                    <h2 className="text-[26px] md:text-[32px] font-[750] text-[#1e2329] mb-10 tracking-tight">
                        Frequently Asked Questions:
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {/* FAQ 1 */}
                        <div className="bg-[#f3f4f6] hover:bg-[#eceef1] cursor-pointer transition-colors rounded-[16px] px-8 py-[26px] flex justify-between items-center group">
                            <span className="text-[16px] font-[600] text-[#6b7280] group-hover:text-[#4b5563] tracking-wide">
                                Are there any flight ticket promotions going on?
                            </span>
                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 flex-shrink-0 ml-4" strokeWidth={2} />
                        </div>

                        {/* FAQ 2 */}
                        <div className="bg-[#f3f4f6] hover:bg-[#eceef1] cursor-pointer transition-colors rounded-[16px] px-8 py-[26px] flex justify-between items-center group">
                            <span className="text-[16px] font-[600] text-[#6b7280] group-hover:text-[#4b5563] tracking-wide">
                                How do i change my tickets?
                            </span>
                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 flex-shrink-0 ml-4" strokeWidth={2} />
                        </div>

                        {/* FAQ 3 */}
                        <div className="bg-[#f3f4f6] hover:bg-[#eceef1] cursor-pointer transition-colors rounded-[16px] px-8 py-[26px] flex justify-between items-center group">
                            <span className="text-[16px] font-[600] text-[#6b7280] group-hover:text-[#4b5563] tracking-wide">
                                How can i cancel my flight ticket?
                            </span>
                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 flex-shrink-0 ml-4" strokeWidth={2} />
                        </div>

                        {/* FAQ 4 */}
                        <div className="bg-[#f3f4f6] hover:bg-[#eceef1] cursor-pointer transition-colors rounded-[16px] px-8 py-[26px] flex justify-between items-center group relative overflow-hidden">
                            <span className="text-[16px] font-[600] text-[#6b7280] group-hover:text-[#4b5563] tracking-wide z-10 relative pr-16">
                                Have a different question? Chat with us now.
                            </span>

                        </div>
                    </div>
                </div>



            </div>

            {/* Dark Airplane Banner Section */}
            <div className="relative w-full h-[400px] overflow-hidden flex flex-col justify-center">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat w-full"
                    style={{ backgroundImage: "url('/hero.jpg')", backgroundPosition: 'center 60%' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent"></div>
                </div>

                <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-12 max-w-[1450px]">
                    <div className="max-w-xl text-white">
                        <p className="text-[17px] md:text-[19px] font-medium tracking-wide mb-3 text-slate-300">
                            Journeys Simple, Safe, And Affordable
                        </p>
                        <h1 className="text-3xl md:text-[42px] lg:text-[48px] font-bold tracking-tight leading-[1.15]">
                            Enjoy Zero <br />
                            <span className="relative inline-block mt-0">
                                Convenience Fee
                                {/* Tapered Swoosh Underline */}
                                <div className="absolute -bottom-4 left-6 w-[105%] pointer-events-none">
                                    <svg
                                        viewBox="0 0 400 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-full h-auto text-[#E11D48] drop-shadow-[0_2px_2px_rgba(225,29,72,0.3)]"
                                    >
                                        <path
                                            d="M0 30C100 5 300 -5 400 18L398 18C300 10 10 15 5 35L0 30Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </div>
                            </span>
                        </h1>
                    </div>
                </div>

                {/* Optional slide indicators directly on the background */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-20">
                    <div className="w-8 h-[5px] rounded-full bg-white transition-all cursor-pointer"></div>
                    <div className="w-8 h-[5px] rounded-full bg-white/40 hover:bg-white/60 transition-all cursor-pointer"></div>
                    <div className="w-8 h-[5px] rounded-full bg-white/40 hover:bg-white/60 transition-all cursor-pointer"></div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
