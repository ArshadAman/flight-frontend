"use client";

import { Check, Plane, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
    {
        name: "Classic",
        price: "499",
        features: ["Standard Accommodation", "Group Sightseeing", "Expert Guide", "Limited Support"],
        recommended: false,
    },
    {
        name: "Premium",
        price: "899",
        features: ["Luxury Accommodation", "Private Transport", "Gourmet Meals", "24/7 Priority Support", "Photo & Video Service"],
        recommended: true,
    },
    {
        name: "Elite",
        price: "1,499",
        features: ["Heritage Suites", "VIP Access", "Private Jet (Regional)", "Personal Concierge", "Custom Itinerary"],
        recommended: false,
    },
];

export function PricingGrid() {
    return (
        <section className="w-full py-24 bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1450px]">
                <div className="text-center mb-20">
                    <h2 className="text-[36px] md:text-[48px] font-[850] text-[#1e2329] tracking-tight">
                        Select Your Plan
                    </h2>
                    <p className="text-gray-500 font-[500] text-[18px] mt-4">Transparent pricing for every group size and style.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-center">
                    {plans.map((plan, idx) => (
                        <div
                            key={plan.name}
                            className={cn(
                                "relative bg-white rounded-[2.5rem] p-10 border transition-all duration-500",
                                plan.recommended
                                    ? "border-[#DE0A26] shadow-2xl shadow-red-100 scale-105 z-20 py-14"
                                    : "border-gray-100 shadow-sm hover:shadow-xl z-10"
                            )}
                        >
                            {/* FREE FLIGHT ribbon */}
                            {plan.recommended && (
                                <div className="absolute -top-4 -right-4 bg-[#DE0A26] text-white px-6 py-2 rounded-2xl rotate-12 font-[800] text-[14px] shadow-lg flex items-center gap-1.5 animate-pulse">
                                    <Plane className="w-4 h-4" />
                                    FREE FLIGHT
                                </div>
                            )}

                            <div className="mb-10">
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-[13px] font-[800] uppercase tracking-wider mb-4 inline-block",
                                    plan.recommended ? "bg-rose-50 text-[#DE0A26]" : "bg-gray-50 text-gray-500"
                                )}>
                                    {plan.name}
                                </span>
                                <div className="flex items-baseline gap-1 mt-4">
                                    <span className="text-[42px] font-[900] text-[#1e2329] tracking-tight">${plan.price}</span>
                                    <span className="text-gray-400 font-[600] text-[16px]">/per pax</span>
                                </div>
                            </div>

                            <div className="space-y-5 mb-12">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                                            plan.recommended ? "bg-[#DE0A26]/10 text-[#DE0A26]" : "bg-gray-100 text-gray-400"
                                        )}>
                                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                        </div>
                                        <span className="text-[16px] font-[600] text-gray-600">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className={cn(
                                "w-full py-4 rounded-2xl font-[800] text-[17px] transition-all flex items-center justify-center gap-2 group",
                                plan.recommended
                                    ? "bg-[#DE0A26] text-white shadow-xl shadow-red-200 hover:bg-[#c60823]"
                                    : "bg-white border-2 border-gray-100 text-gray-800 hover:border-red-100 hover:text-[#DE0A26]"
                            )}>
                                Get Started
                                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
