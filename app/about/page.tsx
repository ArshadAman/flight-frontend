import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
    return (
        <div className="w-full min-h-screen bg-white flex flex-col">
            <Navbar />

            {/* Top Header Banner */}
            <div className="w-full bg-gradient-to-r from-primary to-[#121121] py-10 sm:py-12">
                <div className="container mx-auto px-6 lg:px-20">
                    <h1 className="text-2xl md:text-3xl font-[700] text-white tracking-tight">
                        About Us
                    </h1>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="w-full flex-1 flex flex-col">
                <div className="container mx-auto px-6 lg:px-20 py-16 md:py-20 max-w-[1200px] w-full"> 
                    <div className="flex flex-col">
                        <h2 className="text-[25px] md:text-[32px] font-[700] text-[#121121] leading-tight mb-6">
                            Why Us?
                        </h2>

                        <div className="text-gray-600 font-medium text-[15px] md:text-[16px] leading-[1.8]">
                            <p className="text-justify md:text-left mb-6">
                                Lorem ipsum dolor sit amet consectetur. Ut elit eu fames eleifend erat quis. Tincidunt ac commodo lectus et egestas consectetur sit. Justo amet metus ut sit viverra non est proin. Viverra morbi luctus sit condimentum amet metus morbi maecenas. Nunc faucibus ultrices nisl sed risus tristique cursus platea nascetur. Tellus tempor ultricies placerat mollis non. In amet dictum ut urna. Est neque cras volutpat enim massa sed. Pulvinar accumsan pulvinar curabitur sed ut metus tincidunt sagittis. Pulvinar facilisi pellentesque integer morbi ultricies tristique felis. Diam eros nibh donec proin a ut dictum auctor.
                            </p>
                            
                            <button className="text-blue-500 text-[15px] font-[600] hover:underline transition-all flex items-center gap-1.5 group">
                                Come work with us
                                <span className="transform transition-transform group-hover:translate-x-1">→</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero Image Section */}
                <div className="relative w-full h-[400px] md:h-[500px] flex flex-col bg-slate-100">
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: "url('/hero.jpg')" }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent"></div>
                    </div>

                    <div className="relative z-10 w-full h-full flex items-center">
                        <div className="container mx-auto px-6 lg:px-20 w-full">
                            <div className="max-w-xl text-white">
                                <p className="text-lg md:text-xl font-medium tracking-wide mb-3 text-slate-200">
                                    Journeys Simple, Safe, And Affordable
                                </p>
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                                    Enjoy Zero <br />
                                    <span className="relative inline-block mt-0">
                                        Convenience Fee
                                        <div className="absolute -bottom-4 left-0 w-full pointer-events-none">
                                            <svg viewBox="0 0 400 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto text-primary drop-shadow-sm">
                                                <path d="M10 30C110 5 310 -5 390 18L388 18C290 10 20 15 15 35L10 30Z" fill="currentColor" />
                                            </svg>
                                        </div>
                                    </span>
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Pagination Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-20">
                        <div className="w-8 h-1 rounded-full bg-white transition-all cursor-pointer"></div>
                        <div className="w-8 h-1 rounded-full bg-white/40 hover:bg-white/60 transition-all cursor-pointer"></div>
                        <div className="w-8 h-1 rounded-full bg-white/40 hover:bg-white/60 transition-all cursor-pointer"></div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}