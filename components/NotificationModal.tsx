"use client";

import { useEffect, useState } from "react";
import { X, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
    const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-10"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-[1rem] w-full max-w-[800px] max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header Section */}
                <div className="bg-[#FBEBEF] px-8 pt-6 pb-0 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[#DE0A26] text-[22px] font-bold tracking-tight">Notification</h2>
                        <button 
                            onClick={onClose}
                            className="text-slate-800 hover:bg-black/5 rounded-full p-1.5 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-8 mt-2">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={cn(
                                "pb-3 text-[15px] font-bold transition-all relative",
                                activeTab === "all" ? "text-black border-b-2 border-black" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            All notifications
                        </button>
                        <button
                            onClick={() => setActiveTab("unread")}
                            className={cn(
                                "pb-3 text-[15px] font-medium transition-all relative",
                                activeTab === "unread" ? "text-black border-b-2 border-black font-bold" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Unread notification
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {/* Item 1 */}
                    <div className="flex gap-4 p-6 border-b border-slate-100">
                        <div className="w-12 h-12 shrink-0 bg-[#C1161E] rounded-full flex items-center justify-center shadow-inner overflow-hidden border border-[#DE0A26]">
                            <svg viewBox="0 0 100 100" className="w-8 h-8 text-[#FFC107]">
                                <path fill="currentColor" d="M30,70 Q40,40 70,30 Q60,50 40,80 Z" />
                                <path fill="currentColor" d="M70,30 Q50,60 80,80 Q70,50 90,30 Z" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-[#333333] text-[14px] leading-[1.6]">
                                AirIndia flight <span className="font-bold">AI-1234</span> departure time has been updated from <span className="font-bold">09:45 AM to 10:20 AM</span>. No action is required. Please check your updated itinerary.
                            </p>
                            <span className="text-slate-400 text-[12px] font-medium">12 Apr, 25</span>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex gap-4 p-6 border-b border-slate-100">
                        <div className="w-12 h-12 shrink-0 bg-[#C1161E] rounded-full flex items-center justify-center shadow-inner overflow-hidden border border-[#DE0A26]">
                            <svg viewBox="0 0 100 100" className="w-8 h-8 text-[#FFC107]">
                                <path fill="currentColor" d="M30,70 Q40,40 70,30 Q60,50 40,80 Z" />
                                <path fill="currentColor" d="M70,30 Q50,60 80,80 Q70,50 90,30 Z" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-[#333333] text-[14px] leading-[1.6]">
                                We're sorry! AirIndia <span className="font-bold">AI 571</span> has been delayed by 1 hour due to operational reasons. New departure time: <span className="font-bold">11:55 AM</span>.
                            </p>
                            <span className="text-slate-400 text-[12px] font-medium">12 Apr, 25</span>
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex gap-4 p-6">
                        <div className="w-12 h-12 shrink-0 bg-[#001B94] rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                            <Plane className="w-5 h-5 text-white -rotate-45" fill="white" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-[#333333] text-[14px] leading-[1.6]">
                                Flight IndiGo <span className="font-bold">6E 412</span> will now depart from Terminal 3 instead of Terminal 1. Kindly follow airport signage for Terminal 3.
                            </p>
                            <span className="text-slate-400 text-[12px] font-medium">12 Apr, 25</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
