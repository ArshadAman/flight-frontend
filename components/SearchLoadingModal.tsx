"use client";

import * as React from "react";
import Image from "next/image";

interface SearchLoadingModalProps {
    isOpen: boolean;
}

export function SearchLoadingModal({ isOpen }: SearchLoadingModalProps) {
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            {/* Self-contained CSS Animations */}
            <style>{`
                @keyframes fadeOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleModal {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes flyAlong {
                    0% { transform: translateX(-60px) translateY(0px) rotate(0deg); }
                    50% { transform: translateX(60px) translateY(-5px) rotate(2deg); }
                    100% { transform: translateX(-60px) translateY(0px) rotate(0deg); }
                }
                .animate-fade-overlay {
                    animation: fadeOverlay 0.3s ease-out forwards;
                }
                .animate-scale-modal {
                    animation: scaleModal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-airplane-fly {
                    animation: flyAlong 4s ease-in-out infinite;
                }
            `}</style>

            {/* Blurred Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-overlay" />

            {/* Modal Content Card */}
            <div className="bg-white rounded-[2rem] w-full max-w-[560px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.25)] relative z-10 flex flex-col items-center p-6 sm:p-8 cursor-default animate-scale-modal">
                {/* Figma Travel Promotional Banner */}
                <div className="relative w-full rounded-2xl overflow-hidden aspect-[2.1/1] border border-slate-100 shadow-sm select-none">
                    <Image
                        src="/loading_banner.png"
                        alt="Special Offer 80% Discount"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Airplane Flight Path Micro-animation */}
                <div className="my-10 flex flex-col items-center justify-center relative w-full h-[60px]">


                </div>

                {/* Figma style red pulsing loading text */}
                <h3 className="text-[#DE0A26] font-bold text-[18px] tracking-wide text-center uppercase animate-pulse select-none">
                    Looking for Flights
                </h3>
            </div>
        </div>
    );
}
