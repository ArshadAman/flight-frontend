export function HeroBanner() {
    return (
        <div className="relative w-full h-[400px] overflow-hidden flex flex-col justify-center mt-auto">
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
                                    className="w-full h-auto text-[#D60D26] drop-shadow-[0_2px_2px_rgba(225,29,72,0.3)]"
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
    );
}
