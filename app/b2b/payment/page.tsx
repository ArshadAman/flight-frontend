"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, ChevronDown, Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";

type TabType = "online-deposit" | "payment-request" | "deposit-slip" | "payment-due";

export default function B2BPaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>("online-deposit");

    useEffect(() => {
        const tab = searchParams.get("tab") as TabType;
        if (tab && ["online-deposit", "payment-request", "deposit-slip", "payment-due"].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const setTab = (tab: TabType) => {
        setActiveTab(tab);
        router.push(`/b2b/payment?tab=${tab}`);
    };

    // Online Deposit State
    const [selectedMethod, setSelectedMethod] = useState("Card");
    const [agreed, setAgreed] = useState(false);

    // Payment Request Modal State
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    return (
        <main className="min-h-screen bg-white flex flex-col font-sans relative">
            <B2BNavbar />
            
            {/* Gradient Header */}
            <div className="w-full bg-gradient-to-r from-[#D60D26] via-[#30060F] to-[#121121] pt-6 pb-16 px-4 md:px-10 lg:px-20 relative z-0 flex flex-col sm:flex-row justify-between items-start sm:items-end">
                <div>
                    {/* Breadcrumb */}
                    <div className="text-[11px] font-medium text-white/70 mb-4 flex items-center gap-1">
                        <span className="cursor-pointer hover:text-white transition-colors" onClick={() => router.push("/b2b/my-account")}>My Account</span>
                        <span>→</span>
                        <span>Payment</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex overflow-x-auto no-scrollbar items-center gap-6 md:gap-10 text-[14px] md:text-[15px] font-semibold text-white/80 w-[100vw] sm:w-auto -ml-4 sm:ml-0 px-4 sm:px-0 pb-2 sm:pb-0 whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center relative cursor-pointer" onClick={() => setTab("online-deposit")}>
                            <span className={activeTab === "online-deposit" ? "text-white font-bold" : "hover:text-white transition-colors"}>Online Payment Deposit</span>
                            {activeTab === "online-deposit" && <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full" />}
                        </div>
                        <div className="flex flex-col items-center justify-center relative cursor-pointer" onClick={() => setTab("payment-request")}>
                            <span className={activeTab === "payment-request" ? "text-white font-bold" : "hover:text-white transition-colors"}>Payment Request</span>
                            {activeTab === "payment-request" && <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full" />}
                        </div>
                        <div className="flex flex-col items-center justify-center relative cursor-pointer" onClick={() => setTab("deposit-slip")}>
                            <span className={activeTab === "deposit-slip" ? "text-white font-bold" : "hover:text-white transition-colors"}>Deposit Slip</span>
                            {activeTab === "deposit-slip" && <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full" />}
                        </div>
                        <div className="flex flex-col items-center justify-center relative cursor-pointer" onClick={() => setTab("payment-due")}>
                            <span className={activeTab === "payment-due" ? "text-white font-bold" : "hover:text-white transition-colors"}>Payment Due</span>
                            {activeTab === "payment-due" && <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full" />}
                        </div>
                    </div>
                </div>

                {activeTab === "payment-request" && (
                    <button 
                        onClick={() => setIsRequestModalOpen(true)}
                        className="mt-4 sm:mt-0 bg-[#D60D26] hover:bg-[#D60D26] text-white px-6 py-2.5 rounded-full font-bold text-[14px] transition-colors shadow-sm"
                    >
                        Make Payment Request
                    </button>
                )}
            </div>

            {/* Main Content Container (Overlapping Header) */}
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-16 -mt-8 relative z-10 pb-20">
                <div className="bg-[#F2FBFF] w-full rounded-t-[2.5rem] rounded-b-[1.5rem] px-6 py-10 md:px-12 md:py-12 shadow-sm min-h-[500px]">
                    
                    {/* TAB: ONLINE PAYMENT DEPOSIT */}
                    {activeTab === "online-deposit" && (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <h1 className="text-[22px] md:text-[24px] font-bold text-slate-800 mb-8">
                                Online payment request (B2B)
                            </h1>

                            <div className="mb-10 w-full max-w-[300px]">
                                <input
                                    type="text"
                                    placeholder="Amount To Pay"
                                    className="w-full bg-transparent border-b border-slate-300 py-2 outline-none text-[16px] text-slate-800 font-semibold placeholder:text-slate-500 placeholder:font-medium focus:border-[#D60D26] transition-colors"
                                />
                            </div>

                            <div className="w-full max-w-[900px]">
                                <div className="bg-[#F2FBFF] text-[#D60D26] font-bold text-[14px] px-6 py-3 w-max rounded-t-xl">
                                    <span className="text-slate-800">Payment Method</span>
                                </div>
                                
                                <div className="bg-white p-6 md:p-8 rounded-b-xl rounded-tr-xl shadow-sm border border-slate-100 flex flex-col gap-8">
                                    <div className="flex flex-wrap items-center gap-6 md:gap-8">
                                        {["Card", "Net Banking", "Wallet"].map((method) => (
                                            <label key={method} className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setSelectedMethod(method)}>
                                                <div className={cn(
                                                    "w-[16px] h-[16px] rounded-full border-[1.5px] flex items-center justify-center transition-colors",
                                                    selectedMethod === method ? "border-[#D60D26]" : "border-slate-400 group-hover:border-slate-600"
                                                )}>
                                                    {selectedMethod === method && <div className="w-2 h-2 rounded-full bg-[#D60D26]" />}
                                                </div>
                                                <span className="text-[14px] font-bold text-slate-700">{method}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {selectedMethod === "Card" && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full animate-in fade-in zoom-in-95 duration-200">
                                            <input type="text" placeholder="Card Number" className="sm:col-span-2 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#D60D26] text-[14px] font-medium text-slate-800 placeholder:text-slate-400" />
                                            <input type="text" placeholder="Month" className="border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#D60D26] text-[14px] font-medium text-slate-800 placeholder:text-slate-400" />
                                            <input type="text" placeholder="Year" className="border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#D60D26] text-[14px] font-medium text-slate-800 placeholder:text-slate-400" />
                                            <input type="text" placeholder="CVV" className="border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#D60D26] text-[14px] font-medium text-slate-800 placeholder:text-slate-400" />
                                            <input type="text" placeholder="Full Name As On Card" className="sm:col-span-3 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#D60D26] text-[14px] font-medium text-slate-800 placeholder:text-slate-400" />
                                        </div>
                                    )}

                                    {selectedMethod === "Net Banking" && (
                                        <div className="flex flex-col gap-4 w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-200">
                                            <select className="border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-[#D60D26] text-[14px] font-medium text-slate-800 bg-white">
                                                <option value="">Select your Bank</option>
                                                <option value="sbi">State Bank of India</option>
                                                <option value="hdfc">HDFC Bank</option>
                                                <option value="icici">ICICI Bank</option>
                                                <option value="axis">Axis Bank</option>
                                            </select>
                                        </div>
                                    )}

                                    {selectedMethod === "Wallet" && (
                                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[500px] animate-in fade-in zoom-in-95 duration-200">
                                            <select className="flex-1 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-[#D60D26] text-[14px] font-medium text-slate-800 bg-white">
                                                <option value="">Select Wallet</option>
                                                <option value="paytm">Paytm</option>
                                                <option value="phonepe">PhonePe</option>
                                                <option value="gpay">Google Pay</option>
                                            </select>
                                            <input type="text" placeholder="Mobile / UPI ID" className="flex-1 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-[#D60D26] text-[14px] font-medium text-slate-800 placeholder:text-slate-400" />
                                        </div>
                                    )}

                                    <label className="flex items-center gap-2.5 cursor-pointer mt-2 w-max group" onClick={() => setAgreed(!agreed)}>
                                        <div className={cn(
                                            "w-4 h-4 rounded-[3px] border-[1.5px] flex items-center justify-center transition-colors",
                                            agreed ? "bg-white border-[#D60D26]" : "border-red-300 group-hover:border-[#D60D26]"
                                        )}>
                                            {agreed && <svg className="w-3 h-3 text-[#D60D26]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span className="text-[13px] font-bold text-slate-400 select-none">I Agree To The Terms And Conditions</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-row items-center gap-3 sm:gap-4 mt-8 max-w-[900px]">
                                <button className="flex-1 w-full h-[48px] sm:h-[54px] rounded-full border-[1.5px] border-slate-800 text-slate-900 font-bold text-[14px] sm:text-[16px] flex items-center justify-center gap-1 sm:gap-2 hover:bg-slate-50 transition-colors active:scale-[0.98]">
                                    Cancel <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                                </button>
                                <button className="flex-1 w-full h-[48px] sm:h-[54px] rounded-full bg-[#D60D26] text-white font-bold text-[14px] sm:text-[16px] flex items-center justify-center gap-1 sm:gap-2 hover:bg-[#D60D26] transition-colors shadow-md active:scale-[0.98]">
                                    Make A Payment <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB: PAYMENT REQUEST */}
                    {activeTab === "payment-request" && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 bg-white -mx-6 -my-10 rounded-t-[2.5rem] rounded-b-[1.5rem] p-6 md:p-12 shadow-sm min-h-[500px]">
                            {/* Filter Bar */}
                            <div className="flex flex-wrap items-end gap-6 border-b border-slate-100 pb-6 mb-6">
                                <div className="flex flex-col gap-1 w-full sm:w-[140px]">
                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Request Status</label>
                                    <select className="w-full border-b border-slate-300 pb-1 text-slate-800 text-[13px] font-semibold bg-transparent outline-none focus:border-[#D60D26] cursor-pointer">
                                        <option value="all">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1 w-full sm:w-[140px]">
                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Payment Type</label>
                                    <select className="w-full border-b border-slate-300 pb-1 text-slate-800 text-[13px] font-semibold bg-transparent outline-none focus:border-[#D60D26] cursor-pointer">
                                        <option value="all">All</option>
                                        <option value="deposit">Deposit</option>
                                        <option value="withdrawal">Withdrawal</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1 w-full sm:w-[140px]">
                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Payment Mode</label>
                                    <select className="w-full border-b border-slate-300 pb-1 text-slate-800 text-[13px] font-semibold bg-transparent outline-none focus:border-[#D60D26] cursor-pointer">
                                        <option value="all">All</option>
                                        <option value="card">Card</option>
                                        <option value="netbanking">Net Banking</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1 w-full sm:w-[130px]">
                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">From Date</label>
                                    <input type="date" className="w-full border-b border-slate-300 pb-1 text-slate-800 text-[13px] font-semibold bg-transparent outline-none focus:border-[#D60D26] cursor-pointer" />
                                </div>
                                <div className="flex flex-col gap-1 w-full sm:w-[130px]">
                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">To Date</label>
                                    <input type="date" className="w-full border-b border-slate-300 pb-1 text-slate-800 text-[13px] font-semibold bg-transparent outline-none focus:border-[#D60D26] cursor-pointer" />
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto">
                                    <button className="bg-[#30060F] hover:bg-[#30060F] text-white px-6 py-2 rounded-full font-bold text-[13px] transition-colors shadow-sm flex-1 sm:flex-none">
                                        Apply Filters
                                    </button>
                                    <button type="reset" className="text-[#D60D26] font-bold text-[13px] hover:underline px-2">
                                        Reset
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800 text-[16px]">Showing 1</h3>
                                <div className="flex items-center gap-1 cursor-pointer text-slate-600 text-[14px]">
                                    Sort by <span className="font-bold text-slate-800">Recommended</span>
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="w-full overflow-x-auto no-scrollbar">
                                <table className="w-full min-w-[800px] border-collapse">
                                    <thead>
                                        <tr className="border-b-0">
                                            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-[13px]">Request Status</th>
                                            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-[13px]">Payment type</th>
                                            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-[13px]">Payment Mode</th>
                                            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-[13px]">From</th>
                                            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-[13px]">To</th>
                                            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-[13px]">Status</th>
                                            <th className="text-left py-3 px-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border border-slate-200 rounded-xl">
                                            <td className="py-6 px-4 border-r border-slate-200 rounded-l-xl"></td>
                                            <td className="py-6 px-4 border-r border-slate-200"></td>
                                            <td className="py-6 px-4 border-r border-slate-200"></td>
                                            <td className="py-6 px-4 border-r border-slate-200"></td>
                                            <td className="py-6 px-4 border-r border-slate-200"></td>
                                            <td className="py-6 px-4 border-r border-slate-200"></td>
                                            <td className="py-6 px-4 text-center rounded-r-xl">
                                                <span className="text-blue-600 font-bold text-[13px] underline cursor-pointer hover:text-blue-800">View Details</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: DEPOSIT SLIP */}
                    {activeTab === "deposit-slip" && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 bg-white -mx-6 -my-10 rounded-t-[2.5rem] rounded-b-[1.5rem] p-6 md:p-12 shadow-sm min-h-[500px]">
                            
                            <div className="mb-10 w-full max-w-[300px]">
                                <input
                                    type="text"
                                    placeholder="Select Bank"
                                    className="w-full bg-transparent border-b border-slate-300 py-2 outline-none text-[16px] text-slate-800 font-semibold placeholder:text-slate-500 focus:border-[#D60D26] transition-colors"
                                />
                            </div>

                            {/* Complex Deposit Slip HTML Table */}
                            <div className="w-full overflow-x-auto no-scrollbar border border-slate-800 text-[12px] text-slate-800 font-medium">
                                <table className="w-full min-w-[900px] border-collapse border border-slate-800">
                                    <tbody>
                                        <tr>
                                            <td className="border border-slate-800 p-1 font-bold">ACCT NO.</td>
                                            <td className="border border-slate-800 p-1" colSpan={3}></td>
                                            <td className="border border-slate-800 p-1" colSpan={4}></td>
                                            <td className="border border-slate-800 p-1 font-bold" colSpan={2}>DEPOSIT BRANCH CODE</td>
                                            <td className="border border-slate-800 p-1" colSpan={3}></td>
                                        </tr>
                                        <tr>
                                            <td className="border border-slate-800 p-1 font-bold">CREDIT</td>
                                            <td className="border border-slate-800 p-1 font-bold" colSpan={2}>FULL NAME</td>
                                            <td className="border border-slate-800 p-1" colSpan={5}>M. YATRA PVT LIMITED</td>
                                            <td className="border border-slate-800 p-1 font-bold" colSpan={2}>DEPOSIT DATE:</td>
                                            <td className="border border-slate-800 p-1" colSpan={3}></td>
                                        </tr>
                                        <tr className="bg-slate-100">
                                            <td className="border border-slate-800 p-1 font-bold" colSpan={7}>CHQ DETAILS:</td>
                                            <td className="border border-slate-800 p-1 font-bold" colSpan={6}>CASH DETAILS:</td>
                                        </tr>
                                        <tr className="bg-slate-100">
                                            <td className="border border-slate-800 p-1 font-bold">S. NO.</td>
                                            <td className="border border-slate-800 p-1 font-bold" colSpan={2}>BANK NAME</td>
                                            <td className="border border-slate-800 p-1 font-bold" colSpan={2}>BRANCH</td>
                                            <td className="border border-slate-800 p-1 font-bold" colSpan={2}>CHEQUE NO.</td>
                                            <td className="border border-slate-800 p-1 font-bold" colSpan={3}>DENOMINATIONS</td>
                                            <td className="border border-slate-800 p-1 font-bold" colSpan={3}>RS.</td>
                                        </tr>
                                        {[1, 2, 3, 4, 5, 6].map(num => (
                                            <tr key={num}>
                                                <td className="border border-slate-800 p-1 text-center font-bold">{num}</td>
                                                <td className="border border-slate-800 p-1" colSpan={2}></td>
                                                <td className="border border-slate-800 p-1" colSpan={2}></td>
                                                <td className="border border-slate-800 p-1" colSpan={2}></td>
                                                <td className="border border-slate-800 p-1" colSpan={3}></td>
                                                <td className="border border-slate-800 p-1" colSpan={3}></td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td className="border border-slate-800 p-1 font-bold" colSpan={7}>DEALER CODE: C124745</td>
                                            <td className="border border-slate-800 p-1 font-bold" colSpan={6}>DEALER NAME: Destiny Holidays</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-slate-800 p-1 font-bold" colSpan={13}>RUPEES (in Words)</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-slate-800 p-2 align-top font-bold" colSpan={3}>
                                                FOR OFFICE USE<br/>
                                                TRAN. ID.<br/><br/>
                                                OFFICER:
                                            </td>
                                            <td className="border border-slate-800 p-2 align-bottom font-bold" colSpan={4}>
                                                VERIFYING OFFICER
                                            </td>
                                            <td className="border border-slate-800 p-2 align-top font-bold" colSpan={3}>
                                                If cash {'>'} Rs. 50,000<br/>
                                                PAN/GIR No.<br/>
                                                <span className="font-normal border-t border-slate-800 mt-4 pt-1 block w-full text-center">SIGNATURE OF THE<br/>DEPOSITOR</span>
                                            </td>
                                            <td className="border border-slate-800 p-2 align-top font-bold" colSpan={3}>
                                                AABCT7696P
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-center mt-12">
                                <button className="w-full max-w-[400px] h-[54px] rounded-full bg-[#D60D26] text-white font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-[#D60D26] transition-colors shadow-md active:scale-[0.98]">
                                    Review And Print <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB: PAYMENT DUE */}
                    {activeTab === "payment-due" && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 bg-white -mx-6 -my-10 rounded-t-[2.5rem] rounded-b-[1.5rem] p-6 md:p-12 shadow-sm min-h-[500px] flex flex-col items-center justify-center text-slate-400 text-center py-20">
                            <p className="text-[18px] font-bold text-slate-600 mb-2">No payment due records found.</p>
                            <p className="text-[14px]">You have no outstanding B2B payments due at the moment.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MAKE PAYMENT REQUEST MODAL */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[500px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="bg-[#D60D26] px-6 py-4 flex items-center justify-between text-white shrink-0">
                            <h2 className="font-bold text-[18px]">Make Payment Request</h2>
                            <button onClick={() => setIsRequestModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto no-scrollbar">
                            <div className="bg-red-50 text-[#D60D26] p-3 text-[12px] font-semibold rounded-lg mb-6 leading-relaxed">
                                Cash deposit more than Rs. 1,99,990 in a day under a single PAN card is accepted only for DMT transactions, this amount cannot be used to purchase any other product. If any travel agent deposits more cash than Rs. 1,99,990 in a day under single PAN for the purchase of any other product, the full amount will be permanently forfeited by TSI-Yatra without any credit to the agent or any person.
                            </div>
                            
                            <div className="space-y-4 pr-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                                    <span className="text-slate-500 text-[13px] font-semibold w-[140px]">Payment mode</span>
                                    <select className="flex-1 outline-none text-[14px] text-slate-800 bg-transparent border border-slate-200 rounded px-3 py-2 focus:border-[#D60D26]">
                                        <option value="all">All</option>
                                        <option value="cash">Cash</option>
                                        <option value="cheque">Cheque</option>
                                    </select>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                                    <span className="text-slate-500 text-[13px] font-semibold w-[140px]">Amount</span>
                                    <input type="number" placeholder="Enter amount" className="flex-1 outline-none text-[14px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-2 focus:border-[#D60D26]" />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                                    <span className="text-slate-500 text-[13px] font-semibold w-[140px]">Payment type</span>
                                    <select className="flex-1 outline-none text-[14px] text-slate-800 bg-transparent border border-slate-200 rounded px-3 py-2 focus:border-[#D60D26]">
                                        <option value="deposit">Deposit</option>
                                    </select>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                                    <span className="text-slate-500 text-[13px] font-semibold w-[140px]">Transaction Number</span>
                                    <input type="text" placeholder="Enter transaction number" className="flex-1 outline-none text-[14px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-2 focus:border-[#D60D26]" />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                                    <span className="text-slate-500 text-[13px] font-semibold w-[140px]">Issued bank name</span>
                                    <select className="flex-1 outline-none text-[14px] text-slate-800 bg-transparent border border-slate-200 rounded px-3 py-2 focus:border-[#D60D26]">
                                        <option value="">Select Bank Name</option>
                                        <option value="sbi">SBI</option>
                                        <option value="hdfc">HDFC</option>
                                    </select>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                                    <span className="text-slate-500 text-[13px] font-semibold w-[140px]">Issued branch name</span>
                                    <input type="text" placeholder="Enter branch name" className="flex-1 outline-none text-[14px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-2 focus:border-[#D60D26]" />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                                    <span className="text-slate-500 text-[13px] font-semibold w-[140px]">Issued date</span>
                                    <input type="date" className="flex-1 outline-none text-[14px] text-slate-800 bg-transparent border border-slate-200 rounded px-3 py-2 focus:border-[#D60D26]" />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                                    <span className="text-slate-500 text-[13px] font-semibold w-[140px]">TSI's bank account</span>
                                    <select className="flex-1 outline-none text-[14px] text-slate-800 bg-transparent border border-slate-200 rounded px-3 py-2 focus:border-[#D60D26]">
                                        <option value="">Select Bank Account</option>
                                        <option value="tsi1">TSI Current - 10023</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-8">
                                <button onClick={() => setIsRequestModalOpen(false)} className="flex-1 h-[44px] rounded-full border border-slate-800 text-slate-900 font-bold text-[14px] hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button className="flex-1 h-[44px] rounded-full bg-[#D60D26] text-white font-bold text-[14px] hover:bg-[#D60D26] transition-colors">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
