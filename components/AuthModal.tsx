"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const { login } = useAuth();
    
    // Reset state when opened or handle body scroll lock if desired
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
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-center justify-center p-4 sm:p-10"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-[1.25rem] w-full max-w-[520px] max-h-[95vh] overflow-y-auto shadow-2xl relative flex flex-col cursor-auto animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Top Tabs */}
                <div className="flex w-full relative z-0">
                    <button
                        onClick={() => setActiveTab("login")}
                        className={`flex-1 py-[16px] text-center text-[25px] transition-colors relative font-[700] ${activeTab === "login"
                            ? "text-primary border-b-[3px] border-primary"
                            : "text-[#8C959F] border-b-[3px] border-[#1e2329]"
                            }`}
                    >
                        Login
                    </button>
                    {/* Vertical Divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-200" />
                    <button
                        onClick={() => setActiveTab("signup")}
                        className={`flex-1 py-[16px] text-center text-[25px] transition-colors relative font-[700] ${activeTab === "signup"
                            ? "text-primary border-b-[3px] border-primary"
                            : "text-[#8C959F] border-b-[3px] border-[#1e2329]"
                            }`}
                    >
                        Signup
                    </button>
                </div>

                {/* Internal Content Container */}
                <div className="px-6 pt-6 pb-6 w-full flex flex-col items-center">
                    {/* Header section */}
                    <div className="text-center w-full mb-5">
                        <h2 className="text-[17px] font-[500] text-[#57606a] tracking-tight flex items-center justify-center gap-1.5">
                            Welcome to <span className="font-[800] text-[#1e2329] text-[25px]">My Travel Deal!</span>
                        </h2>
                        <p className="text-[15px] sm:text-[20px] font-[600] text-[#8C959F] mt-1 tracking-tight">
                            Please {activeTab === "login" ? "Login" : "Signup"} Using Your Email/Mobile To Continue
                        </p>
                    </div>

                    {/* Pink Background Card */}
                    <div className="bg-rose-50/30 rounded-[1.25rem] w-full p-6 sm:px-8 pb-7 border border-rose-100/50">
                        <div className="flex flex-col gap-6 w-full">
                            {/* Input Field: Name (Only for Signup) */}
                            {activeTab === "signup" && (
                                <div className="flex flex-col">
                                    <label
                                        htmlFor="name"
                                        className="text-[20px] font-[700] text-[#1e2329] mb-1"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full border-0 border-b border-[#d1d5db] bg-transparent py-1.5 px-0 text-[14px] font-[600] text-[#1e2329] focus:border-primary focus:outline-none focus:ring-0"
                                    />
                                </div>
                            )}

                            {/* Input Field: Email/Mobile */}
                            <div className="flex flex-col">
                                <label
                                    htmlFor="identifier"
                                    className="text-[20px] font-[700] text-[#1e2329] mb-1"
                                >
                                    Email Id / Mobile Number
                                </label>
                                <input
                                    type="text"
                                    id="identifier"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full border-0 border-b border-[#d1d5db] bg-transparent py-1.5 px-0 text-[14px] font-[600] text-[#1e2329] focus:border-primary focus:outline-none focus:ring-0"
                                />
                            </div>

                            {/* Input Field: Password */}
                            <div className="flex flex-col relative">
                                <label
                                    htmlFor="password"
                                    className="text-[20px] font-[700] text-[#1e2329] mb-1"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border-0 border-b border-[#d1d5db] bg-transparent py-1.5 px-0 text-[14px] font-[600] text-[#1e2329] focus:border-primary focus:outline-none focus:ring-0"
                                />
                            </div>

                            {/* Forgot Password Link */}
                            <div className="flex justify-end mt-[-8px]">
                                {activeTab === "login" ? (
                                    <button type="button" className="text-primary text-[20px] font-[600] hover:underline cursor-pointer">
                                        Forgot Password
                                    </button>
                                ) : (
                                    <div className="h-[15px]"></div>
                                )}
                            </div>
                        </div>

                        {/* Primary Action Button */}
                        <div className="mt-8 flex justify-center w-full">
                            <Button
                                onClick={() => {
                                    if (!identifier) return; // simple validation
                                    const userName = activeTab === "signup" && name.trim() !== "" ? name : (identifier.split('@')[0] || "User");
                                    login({
                                        name: userName,
                                        email: identifier,
                                    });
                                    onClose();
                                }}
                                className="w-full sm:w-[90%] md:w-[85%] rounded-[100px] bg-primary hover:bg-[#c60823] text-white h-[50px] text-[22px] font-[700] tracking-wide shadow-none transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {activeTab === "login" ? "Login" : "Signup"}
                                <ArrowUpRight className="w-[18px] h-[18px] stroke-[2.5px]" />
                            </Button>
                        </div>
                    </div>

                    {/* Social Logins Section */}
                    <div className="w-full mt-6 mb-2 flex flex-col items-center">
                        <p className="text-[14px] text-slate-500 font-medium mb-4">Or {activeTab === "login" ? "Login" : "Signup"} With</p>
                        <div className="flex items-center gap-4">
                            <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                            </button>
                            <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
                                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-6 h-6" />
                            </button>
                            <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
                                <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

