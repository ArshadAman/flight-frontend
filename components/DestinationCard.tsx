import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import Link from "next/link";

interface DestinationCardProps {
    city: string;
    tourCount: string;
    imageSrc: string;
    href?: string;
}

export function DestinationCard({ city, tourCount, imageSrc, href = "#" }: DestinationCardProps) {
    return (
        <Link href={href} className="block relative group w-full h-[320px] md:h-[400px] rounded-[1.25rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300">
            {/* Background Image with Hover Scale */}
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src={imageSrc}
                    alt={`Travel to ${city}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Dark Gradient Overlay (Brightens slightly on hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent transition-opacity duration-300 group-hover:opacity-80"></div>
            </div>

            {/* Content Container */}
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <div className="flex justify-between items-end w-full">
                    {/* Text Content */}
                    <div className="flex flex-col transform transition-transform duration-300 group-hover:-translate-y-1">
                        <h4 className="text-white font-extrabold text-[28px] tracking-tight leading-none mb-1">
                            {city}
                        </h4>
                        <p className="text-white/90 font-medium text-[15px]">
                            {tourCount}
                        </p>
                    </div>

                    {/* Interactive Arrow Button */}
                    <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white text-slate-900 transition-all duration-300 transform group-hover:scale-110 shadow-lg">
                        <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
