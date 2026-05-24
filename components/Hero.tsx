import { ReactNode } from "react";

interface HeroProps {
    children?: ReactNode;
}

export function Hero({ children }: HeroProps) {
    return (
        <div className="relative w-full min-h-[60vh] md:min-h-screen flex flex-col bg-slate-100">
            {/* Full Page Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/hero-bg.png')" }}
            >
                {/* Subtle gradient so text pops out but doesn't ruin the sunset */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-slate-900/60"></div>
            </div>


            {/* Hero Content Layout */}
            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start pt-6 sm:pt-16 md:pt-28 pb-6 gap-6 lg:gap-12">

                {/* Render the Flight Search Form (Passed as Children) */}
                {children && (
                    <div className="w-full max-w-[1400px] mx-auto shadow-2xl rounded-2xl">
                        {children}
                    </div>
                )}


                {/* Typography Block */}
                <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-0 mt-8">
                  <div className="max-w-xl text-white">
                    <p className="text-xl md:text-2xl font-medium tracking-wide mb-4 text-slate-200">
                        Journeys Simple, Safe, And Affordable
                    </p>
                    <h1 className="text-xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                        Enjoy Zero <br />
                        <span className="relative inline-block mt-0">
                            Convenience Fee
                            {/* Tapered Swoosh Underline */}
                            <div className="absolute -bottom-4 left-0 w-full pointer-events-none">
                                <svg
                                    viewBox="0 0 400 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-full h-auto text-[#D60D26] drop-shadow-sm"
                                >
                                    <path
                                        d="M10 30C110 5 310 -5 390 18L388 18C290 10 20 15 15 35L10 30Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                        </span>
                    </h1>
                  </div>
                </div>
            </div>

            {/* Bottom Pagination Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-20">
                <div className="w-8 h-1.5 rounded-full bg-white transition-all cursor-pointer"></div>
                <div className="w-8 h-1.5 rounded-full bg-white/40 hover:bg-white/60 transition-all cursor-pointer"></div>
                <div className="w-8 h-1.5 rounded-full bg-white/40 hover:bg-white/60 transition-all cursor-pointer"></div>
            </div>
        </div>
    );
}
