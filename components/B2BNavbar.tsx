"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Menu, X, ChevronDown, User as UserIcon, LogOut, Bell } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { NotificationModal } from "@/components/NotificationModal";

export function B2BNavbar() {
  const { isAuthModalOpen, openAuthModal, closeAuthModal, user: authUser, logout } = useAuth();
  const user = authUser || { name: "Sanjay", email: "sanjay@destinyholidays.com" };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMyAccountOpen, setIsMyAccountOpen] = useState(false);
  const [isPaymentExpanded, setIsPaymentExpanded] = useState(true); // Starts expanded just like in the screenshot
  const [isProfileManagementExpanded, setIsProfileManagementExpanded] = useState(true); // Starts expanded just like in the screenshot

  // For Sale multi-level dropdown states
  const [isForSaleOpen, setIsForSaleOpen] = useState(false);
  const [isFlightExpanded, setIsFlightExpanded] = useState(false);
  const [isBookingExpanded, setIsBookingExpanded] = useState(false);

  const [balanceHidden, setBalanceHidden] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const myAccountRef = useRef<HTMLDivElement>(null);
  const forSaleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    setIsUserDropdownOpen(false);
    setIsMyAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (myAccountRef.current && !myAccountRef.current.contains(event.target as Node)) {
        setIsMyAccountOpen(false);
      }
      if (forSaleRef.current && !forSaleRef.current.contains(event.target as Node)) {
        setIsForSaleOpen(false);
      }
    }
    if (openDropdown || isUserDropdownOpen || isMyAccountOpen || isForSaleOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown, isUserDropdownOpen, isMyAccountOpen, isForSaleOpen]);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  type DropdownOption = {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };

  const NavItem = ({ name, hasDropdown = true, options = [] }: { name: string, hasDropdown?: boolean, options?: DropdownOption[] }) => (
    <div className="relative flex items-center h-full">
      <button
        onClick={() => hasDropdown ? toggleDropdown(name) : undefined}
        className={`relative text-[14px] xl:text-[16px] py-1 flex items-center justify-center transition-colors duration-200 ${openDropdown === name || (name === "Group Travel" && pathname.startsWith('/b2b/group-travel'))
          ? 'font-[700] text-primary'
          : 'font-[600] text-[#8A92A6] hover:text-[#0C2342]'
          }`}
      >
        <div className="flex items-center gap-1.5">
          {name}
          {hasDropdown && <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${openDropdown === name ? 'rotate-180' : ''}`}><path d="M5 6L0 0H10L5 6Z" /></svg>}
        </div>
      </button>
      {hasDropdown && openDropdown === name && options.length > 0 && (
        <div className="absolute top-full left-0 mt-5 min-w-[240px] bg-white border-t-[5px] border-[#D60D26] rounded-xl shadow-xl z-50 p-2">
          <div className="flex flex-col gap-1">
            {options.map((opt, idx) => (
              <Link
                key={idx}
                href={opt.href}
                onClick={() => setOpenDropdown(null)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {opt.icon && <div className="shrink-0">{opt.icon}</div>}
                <span className="font-bold text-slate-800 text-sm">{opt.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="sticky top-0 w-full z-[100] bg-white border-b border-gray-200 shadow-md">
        <div className="container mx-auto px-4 md:px-8 lg:px-10">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <Link href="/b2b" className="flex flex-col items-center justify-center select-none cursor-pointer">
              <Logo />
              <div className="flex flex-col items-center mt-1">
                <h1
                  className="text-[22px] font-[905] text-brand leading-none tracking-tighter font-sans"
                  style={{ letterSpacing: '-0.04em' }}
                >
                  My Travel Deal
                </h1>
                <svg
                  width="120"
                  height="8"
                  viewBox="2 2 120 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-brand mt-0.5"
                >
                  <path d="M2 6C35 0 85 0 118 6L118 8C85 2 35 2 2 8Z" fill="currentColor" />
                </svg>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8 mt-1" ref={dropdownRef}>
              <NavItem
                name="Group Travel"
                options={[
                  {
                    label: "New Booking",
                    href: "/b2b/group-travel/new",
                    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10C7 13.3137 9.68629 16 13 16H18" stroke="#D60D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 13L18 16L15 19" stroke="#D60D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  },
                  {
                    label: "Request",
                    href: "/b2b/group-travel/view-request",
                    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10C7 13.3137 9.68629 16 13 16H18" stroke="#D60D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 13L18 16L15 19" stroke="#D60D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  },
                  {
                    label: "Modified Request",
                    href: "/b2b/group-travel/add-passenger",
                    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10C7 13.3137 9.68629 16 13 16H18" stroke="#D60D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 13L18 16L15 19" stroke="#D60D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  }
                ]}
              />
              <NavItem
                name="My Booking"
                options={[
                  { label: "All Booking", href: "/b2b/my-booking/all", icon: <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6v6a3 3 0 003 3h11" /><path d="M14 11l4 4-4 4" /></svg> },
                  { label: "Re-Booking", href: "/b2b/my-booking/re-booking", icon: <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6v6a3 3 0 003 3h11" /><path d="M14 11l4 4-4 4" /></svg> },
                  { label: "Refund", href: "/b2b/my-booking/refund", icon: <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6v6a3 3 0 003 3h11" /><path d="M14 11l4 4-4 4" /></svg> },
                  { label: "Ticket Download", href: "/b2b/my-booking/download", icon: <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6v6a3 3 0 003 3h11" /><path d="M14 11l4 4-4 4" /></svg> },
                  { label: "Ticket Prints/Shares", href: "/b2b/my-booking/prints", icon: <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6v6a3 3 0 003 3h11" /><path d="M14 11l4 4-4 4" /></svg> },
                  { label: "Import PNR", href: "/b2b/my-booking/import-pnr", icon: <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6v6a3 3 0 003 3h11" /><path d="M14 11l4 4-4 4" /></svg> },
                  { label: "Trips(Recent/Upcoming)", href: "/b2b/my-booking/trips", icon: <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6v6a3 3 0 003 3h11" /><path d="M14 11l4 4-4 4" /></svg> },
                ]}
              />

              {/* Custom High-Fidelity My Account Dropdown */}
              <div className="relative flex items-center h-full" ref={myAccountRef}>
                <button
                  onClick={() => setIsMyAccountOpen(!isMyAccountOpen)}
                  className={`relative text-[14px] xl:text-[16px] py-1 flex items-center justify-center transition-colors duration-200 ${isMyAccountOpen || pathname.startsWith('/b2b/my-account') || pathname.startsWith('/b2b/payment') || pathname.startsWith('/b2b/reports') || pathname.startsWith('/b2b/manage-commission')
                    ? 'font-[700] text-primary'
                    : 'font-[600] text-[#8A92A6] hover:text-[#0C2342]'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    My Account
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isMyAccountOpen ? 'rotate-180' : ''}`}><path d="M5 6L0 0H10L5 6Z" /></svg>
                  </div>

                </button>

                {isMyAccountOpen && (
                  <div className="absolute top-full left-0 mt-5 min-w-[280px] bg-white border-t-[5px] border-[#D60D26] rounded-xl shadow-xl z-50 p-4 animate-in fade-in duration-200">
                    <div className="flex flex-col gap-3">

                      {/* Top-Level: Payment */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => setIsPaymentExpanded(!isPaymentExpanded)}
                          className="flex items-center justify-between w-full hover:bg-slate-50 py-1.5 px-2 rounded transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            {/* Curved Red Arrow Icon */}
                            <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 6v6a3 3 0 003 3h11" />
                              <path d="M14 11l4 4-4 4" />
                            </svg>
                            <span className="font-bold text-slate-800 text-[14px]">Payment</span>
                          </div>
                          <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 transition-transform ${isPaymentExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Nested Branch Tree */}
                        {isPaymentExpanded && (
                          <div className="pl-6 mt-1 flex relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[15px] top-0 bottom-4 w-[1px] bg-slate-300" />

                            <div className="flex flex-col gap-2.5 w-full">
                              {[
                                { label: "Online Payment Deposit", tab: "online-deposit" },
                                { label: "Payment Request", tab: "payment-request" },
                                { label: "Deposit Slip", tab: "deposit-slip" },
                                { label: "Payment Due", tab: "payment-due" },
                              ].map((sub, idx) => (
                                <Link
                                  key={idx}
                                  href={`/b2b/payment?tab=${sub.tab}`}
                                  onClick={() => setIsMyAccountOpen(false)}
                                  className="flex items-center gap-2 pl-1.5 group/sub text-slate-600 hover:text-[#D60D26] transition-colors text-[13px] font-bold"
                                >
                                  {/* Branch Line */}
                                  <div className="w-3.5 h-3 border-l border-b border-slate-300 relative -top-1 shrink-0" />
                                  <span>{sub.label}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Top-Level: Reports */}
                      <Link
                        href="/b2b/reports"
                        onClick={() => setIsMyAccountOpen(false)}
                        className="flex items-center gap-2 hover:bg-slate-50 py-1.5 px-2 rounded transition-colors text-slate-800 hover:text-[#D60D26] text-[14px] font-bold"
                      >
                        {/* Curved Red Arrow Icon */}
                        <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 6v6a3 3 0 003 3h11" />
                          <path d="M14 11l4 4-4 4" />
                        </svg>
                        <span>Reports</span>
                      </Link>

                      {/* Top-Level: Manage Commission */}
                      <Link
                        href="/b2b/manage-commission"
                        onClick={() => setIsMyAccountOpen(false)}
                        className="flex items-center gap-2 hover:bg-slate-50 py-1.5 px-2 rounded transition-colors text-slate-800 hover:text-[#D60D26] text-[14px] font-bold"
                      >
                        {/* Curved Red Arrow Icon */}
                        <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 6v6a3 3 0 003 3h11" />
                          <path d="M14 11l4 4-4 4" />
                        </svg>
                        <span>Manage Commission</span>
                      </Link>

                    </div>
                  </div>
                )}
              </div>

              {/* Custom High-Fidelity For Sale Dropdown */}
              <div className="relative flex items-center h-full" ref={forSaleRef}>
                <button
                  onClick={() => setIsForSaleOpen(!isForSaleOpen)}
                  className={`relative text-[14px] xl:text-[16px] py-1 flex items-center justify-center transition-colors duration-200 ${isForSaleOpen || pathname.startsWith('/sale')
                    ? 'font-[700] text-primary'
                    : 'font-[600] text-[#8A92A6] hover:text-[#0C2342]'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    For Sale
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isForSaleOpen ? 'rotate-180' : ''}`}><path d="M5 6L0 0H10L5 6Z" /></svg>
                  </div>
                </button>

                {isForSaleOpen && (
                  <div className="absolute top-full left-0 mt-5 min-w-[280px] bg-white border-t-[5px] border-[#D60D26] rounded-xl shadow-xl z-50 p-4 animate-in fade-in duration-200">
                    <div className="flex flex-col gap-3">

                      {/* Flight Nested */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => setIsFlightExpanded(!isFlightExpanded)}
                          className="flex items-center justify-between w-full hover:bg-slate-50 py-1.5 px-2 rounded transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 6v6a3 3 0 003 3h11" />
                              <path d="M14 11l4 4-4 4" />
                            </svg>
                            <span className="font-bold text-slate-800 text-[14px]">Flight</span>
                          </div>
                          <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 transition-transform ${isFlightExpanded ? 'rotate-180' : '-rotate-90'}`} />
                        </button>
                        {isFlightExpanded && (
                          <div className="pl-6 mt-1 flex relative">
                            <div className="absolute left-[15px] top-0 bottom-4 w-[1px] bg-slate-300" />
                            <div className="flex flex-col gap-2.5 w-full">
                              {[
                                { label: "All Booking", tab: "all" },
                                { label: "Pending", tab: "pending" },
                                { label: "Bookable", tab: "bookable" },
                                { label: "Sold Out", tab: "sold-out" },
                                { label: "Export", tab: "export" },
                              ].map((sub, idx) => (
                                <Link
                                  key={idx}
                                  href={`/sale/flight/${sub.tab}`}
                                  onClick={() => setIsForSaleOpen(false)}
                                  className="flex items-center gap-2 pl-1.5 group/sub text-slate-600 hover:text-[#D60D26] transition-colors text-[13px] font-bold"
                                >
                                  <div className="w-3.5 h-3 border-l border-b border-slate-300 relative -top-1 shrink-0" />
                                  <span>{sub.label}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Booking Nested */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => setIsBookingExpanded(!isBookingExpanded)}
                          className="flex items-center justify-between w-full hover:bg-slate-50 py-1.5 px-2 rounded transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 6v6a3 3 0 003 3h11" />
                              <path d="M14 11l4 4-4 4" />
                            </svg>
                            <span className="font-bold text-slate-800 text-[14px]">Booking</span>
                          </div>
                          <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 transition-transform ${isBookingExpanded ? 'rotate-180' : '-rotate-90'}`} />
                        </button>
                        {isBookingExpanded && (
                          <div className="pl-6 mt-1 flex relative">
                            <div className="absolute left-[15px] top-0 bottom-4 w-[1px] bg-slate-300" />
                            <div className="flex flex-col gap-2.5 w-full">
                              {[
                                { label: "Upcoming", tab: "upcoming" },
                                { label: "Departed", tab: "departed" },
                                { label: "Travel", tab: "travel" },
                              ].map((sub, idx) => (
                                <Link
                                  key={idx}
                                  href={`/sale/booking/${sub.tab}`}
                                  onClick={() => setIsForSaleOpen(false)}
                                  className="flex items-center gap-2 pl-1.5 group/sub text-slate-600 hover:text-[#D60D26] transition-colors text-[13px] font-bold"
                                >
                                  <div className="w-3.5 h-3 border-l border-b border-slate-300 relative -top-1 shrink-0" />
                                  <span>{sub.label}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Simple Top-Level Elements */}
                      <Link href="/sale/inventory" onClick={() => setIsForSaleOpen(false)} className="flex items-center gap-2 hover:bg-slate-50 py-1.5 px-2 rounded transition-colors text-slate-800 hover:text-[#D60D26] text-[14px] font-bold">
                        <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6v6a3 3 0 003 3h11" /><path d="M14 11l4 4-4 4" /></svg>
                        <span>Inventory</span>
                      </Link>

                      <Link href="/sale/reports" onClick={() => setIsForSaleOpen(false)} className="flex items-center gap-2 hover:bg-slate-50 py-1.5 px-2 rounded transition-colors text-slate-800 hover:text-[#D60D26] text-[14px] font-bold">
                        <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6v6a3 3 0 003 3h11" /><path d="M14 11l4 4-4 4" /></svg>
                        <span>Reports</span>
                      </Link>

                      <Link href="/sale/pnr-history" onClick={() => setIsForSaleOpen(false)} className="flex items-center gap-2 hover:bg-slate-50 py-1.5 px-2 rounded transition-colors text-slate-800 hover:text-[#D60D26] text-[14px] font-bold">
                        <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6v6a3 3 0 003 3h11" /><path d="M14 11l4 4-4 4" /></svg>
                        <span>PNR History</span>
                      </Link>

                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Action Button */}
            <div className="hidden lg:flex items-center gap-4 mt-1">




              {user ? (
                <div className="flex items-center gap-4" ref={userDropdownRef}>
                  {/* Balance Pill */}
                  <button
                    onClick={() => setBalanceHidden(!balanceHidden)}
                    className="border-[2px] border-primary hover:bg-primary/5 text-primary rounded-full px-5 py-2 text-[15px] font-[800] tracking-wide transition-all active:scale-95 flex items-center gap-2 select-none"
                  >
                    <span>Balance</span>
                    <span className="font-extrabold uppercase tracking-widest text-[16px]">
                      {balanceHidden ? "XXXX" : "₹ 1,24,500"}
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="relative flex flex-col items-center justify-center py-1 transition-colors duration-200 select-none group"
                    >
                      <div className="flex items-center gap-1.5 font-[600] text-[#8A92A6] group-hover:text-primary transition-colors text-[14px] xl:text-[16px]">
                        <span>{user?.name || "Sanjay"}</span>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={`transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180 text-primary' : 'text-[#8A92A6]'}`}><path d="M5 6L0 0H10L5 6Z" /></svg>
                      </div>
                    </button>

                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-4 w-[280px] bg-white border-t-[4px] border-[#D60D26] rounded-xl shadow-xl z-50 p-2 animate-in fade-in duration-200">
                        <div className="flex flex-col gap-1">

                          {/* Profile Management Section */}
                          <div className="flex flex-col">
                            <button
                              onClick={() => setIsProfileManagementExpanded(!isProfileManagementExpanded)}
                              className="flex items-center justify-between w-full hover:bg-slate-50 py-2.5 px-3 rounded-lg transition-colors group text-left"
                            >
                              <div className="flex items-center gap-2">
                                {/* Curved Red Arrow Icon */}
                                <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 6v6a3 3 0 003 3h11" />
                                  <path d="M14 11l4 4-4 4" />
                                </svg>
                                <span className="font-bold text-slate-800 text-[14px]">Profile Management</span>
                              </div>
                              <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 transition-transform ${isProfileManagementExpanded ? 'rotate-180' : '-rotate-90'}`} />
                            </button>

                            {/* Nested Branch Tree */}
                            {isProfileManagementExpanded && (
                              <div className="mt-1 flex flex-col pl-2">
                                {[
                                  { label: "Update Profile", href: "/b2b/my-account?tab=update-profile" },
                                  { label: "Manage User", href: "/b2b/my-account?tab=manage-user" },
                                  { label: "Create Sub User", href: "/b2b/my-account?tab=manage-user&action=create-sub-user" },
                                  { label: "Change Logo", href: "/b2b/my-account?tab=change-logo" },
                                  { label: "Manage Customer Profile", href: "/b2b/my-account?tab=customer-profile", isLast: true },
                                ].map((sub, idx) => (
                                  <Link
                                    key={idx}
                                    href={sub.href}
                                    onClick={() => setIsUserDropdownOpen(false)}
                                    className="flex items-center group/sub text-slate-600 hover:text-[#D60D26] transition-colors text-[13px] font-bold py-1.5"
                                  >
                                    {sub.isLast ? (
                                      /* Last Branch SVG (└──>) */
                                      <svg className="w-8 h-6 text-slate-300 group-hover/sub:text-[#D60D26] shrink-0 transition-colors" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <line x1="10" y1="0" x2="10" y2="12" strokeLinecap="round" />
                                        <line x1="10" y1="12" x2="26" y2="12" strokeLinecap="round" />
                                        <path d="M22 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    ) : (
                                      /* Middle Branch SVG (├──>) */
                                      <svg className="w-8 h-6 text-slate-300 group-hover/sub:text-[#D60D26] shrink-0 transition-colors" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <line x1="10" y1="0" x2="10" y2="24" strokeLinecap="round" />
                                        <line x1="10" y1="12" x2="26" y2="12" strokeLinecap="round" />
                                        <path d="M22 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                    <span className="pl-1 pr-2">{sub.label}</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Notice Board */}
                          <Link
                            href="/b2b/my-account?tab=notice-board"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2 hover:bg-slate-50 py-2.5 px-3 rounded-lg transition-colors text-slate-800 hover:text-[#D60D26] text-[14px] font-bold"
                          >
                            {/* Curved Red Arrow Icon */}
                            <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 6v6a3 3 0 003 3h11" />
                              <path d="M14 11l4 4-4 4" />
                            </svg>
                            <span>Notice Board</span>
                          </Link>

                          {/* Contact */}
                          <Link
                            href="/b2b/my-account?tab=contact"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2 hover:bg-slate-50 py-2.5 px-3 rounded-lg transition-colors text-slate-800 hover:text-[#D60D26] text-[14px] font-bold"
                          >
                            {/* Curved Red Arrow Icon */}
                            <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 6v6a3 3 0 003 3h11" />
                              <path d="M14 11l4 4-4 4" />
                            </svg>
                            <span>Contact</span>
                          </Link>

                          {/* Divider */}
                          <div className="h-px bg-slate-100 my-1" />

                          {/* Logout */}
                          <button
                            onClick={() => {
                              logout();
                              setIsUserDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 hover:bg-slate-50 py-2.5 px-3 rounded-lg transition-colors text-red-600 font-bold text-[14px] w-full text-left"
                          >
                            <LogOut className="w-4.5 h-4.5 text-[#D60D26] shrink-0" />
                            <span>Logout</span>
                          </button>

                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => openAuthModal()}
                  className="text-[16px] xl:text-[22px] rounded-full px-4 xl:px-6 py-[20px] xl:py-[24px] font-[700] tracking-wide shadow-none transition-transform hover:scale-105 active:scale-95 bg-brand text-white hover:bg-brand/90"
                >
                  Login / Signup
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5 xl:hidden"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5 hidden xl:block"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
                </Button>
              )}
            </div>

            {/* Mobile Right Icons (Bell & Menu Toggle) */}
            <div className="lg:hidden flex items-center gap-2">

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-brand p-2 focus:outline-none -mr-2"
                aria-label="Open Menu"
              >
                <Menu size={32} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[105] bg-slate-900/50 transition-opacity backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Side Drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 z-[110] h-full w-[85%] sm:w-[350px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform overflow-y-auto ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
          <span className="text-xl font-bold text-slate-800">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 p-2 hover:bg-slate-100 rounded-full transition-colors -mr-2">
            <X size={28} />
          </button>
        </div>

        <nav className="flex flex-col space-y-2 mt-4 px-4 w-full">
          <NavLink href="/b2b" isMobile onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>

          <div className="flex flex-col w-full my-3 bg-slate-50/50 rounded-2xl border border-slate-100 p-2">
            <div className="flex items-center gap-2 px-3 py-2 mb-1">
              <div className="w-1.5 h-1.5 bg-[#D60D26] rounded-full"></div>
              <span className="text-[12px] font-[900] text-slate-800 uppercase tracking-widest">Group Travel</span>
            </div>
            <div className="flex flex-col gap-1">
              <Link href="/b2b/group-travel/new" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 w-full py-3 px-4 text-[14px] font-bold text-slate-600 hover:text-[#D60D26] hover:bg-white rounded-xl transition-colors shadow-sm bg-slate-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-slate-400"><path d="M7 10C7 13.3137 9.68629 16 13 16H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 13L18 16L15 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                New Booking
              </Link>
              <Link href="/b2b/group-travel/view-request" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 w-full py-3 px-4 text-[14px] font-bold text-slate-600 hover:text-[#D60D26] hover:bg-white rounded-xl transition-colors shadow-sm bg-slate-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-slate-400"><path d="M7 10C7 13.3137 9.68629 16 13 16H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 13L18 16L15 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Request
              </Link>
              <Link href="/b2b/group-travel/add-passenger" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 w-full py-3 px-4 text-[14px] font-bold text-slate-600 hover:text-[#D60D26] hover:bg-white rounded-xl transition-colors shadow-sm bg-slate-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-slate-400"><path d="M7 10C7 13.3137 9.68629 16 13 16H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 13L18 16L15 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Modified Request
              </Link>
            </div>
          </div>

          <NavLink href="/b2b/my-booking" isMobile onClick={() => setIsMobileMenuOpen(false)}>My Booking</NavLink>

          <div className="flex flex-col w-full my-3 bg-slate-50/50 rounded-2xl border border-slate-100 p-2">
            <div className="flex items-center gap-2 px-3 py-2 mb-1">
              <div className="w-1.5 h-1.5 bg-[#D60D26] rounded-full"></div>
              <span className="text-[12px] font-[900] text-slate-800 uppercase tracking-widest">My Account</span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-col w-full">
                <button
                  onClick={() => setIsPaymentExpanded(!isPaymentExpanded)}
                  className="flex items-center justify-between gap-3 w-full py-3 px-4 text-[14px] font-bold text-slate-600 hover:text-[#D60D26] hover:bg-white rounded-xl transition-colors shadow-sm bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 6v6a3 3 0 003 3h11" />
                      <path d="M14 11l4 4-4 4" />
                    </svg>
                    Payment
                  </div>
                  <ChevronDown size={16} className={`transition-transform text-slate-400 ${isPaymentExpanded ? 'rotate-180' : '-rotate-90'}`} />
                </button>

                {isPaymentExpanded && (
                  <div className="flex flex-col pl-4 w-full mt-1">
                    {[
                      { label: "Online Payment Deposit", href: "/b2b/payment?tab=online-deposit" },
                      { label: "Payment Request", href: "/b2b/payment?tab=payment-request" },
                      { label: "Deposit Slip", href: "/b2b/payment?tab=deposit-slip" },
                      { label: "Payment Due", href: "/b2b/payment?tab=payment-due", isLast: true },
                    ].map((sub, idx) => (
                      <Link
                        key={idx}
                        href={sub.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center group/sub text-slate-600 hover:text-[#D60D26] transition-colors text-[13px] font-bold py-2"
                      >
                        {sub.isLast ? (
                          <svg className="w-6 h-5 text-slate-300 group-hover/sub:text-[#D60D26] shrink-0 transition-colors" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="10" y1="0" x2="10" y2="12" />
                            <line x1="10" y1="12" x2="26" y2="12" />
                            <path d="M22 8l4 4-4 4" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-5 text-slate-300 group-hover/sub:text-[#D60D26] shrink-0 transition-colors" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="10" y1="0" x2="10" y2="24" />
                            <line x1="10" y1="12" x2="26" y2="12" />
                            <path d="M22 8l4 4-4 4" />
                          </svg>
                        )}
                        <span className="pl-2">{sub.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/b2b/reports" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 w-full py-3 px-4 text-[14px] font-bold text-slate-600 hover:text-[#D60D26] hover:bg-white rounded-xl transition-colors shadow-sm bg-slate-50">
                <svg className="w-5 h-5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6v6a3 3 0 003 3h11" />
                  <path d="M14 11l4 4-4 4" />
                </svg>
                Reports
              </Link>

              <Link href="/b2b/manage-commission" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 w-full py-3 px-4 text-[14px] font-bold text-slate-600 hover:text-[#D60D26] hover:bg-white rounded-xl transition-colors shadow-sm bg-slate-50">
                <svg className="w-5 h-5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6v6a3 3 0 003 3h11" />
                  <path d="M14 11l4 4-4 4" />
                </svg>
                Manage Commission
              </Link>
            </div>
          </div>

          <NavLink href="/sale" isMobile onClick={() => setIsMobileMenuOpen(false)}>For Sale</NavLink>
        </nav>

        <div className="mt-auto px-6 pt-6 pb-8 w-full border-t border-slate-100">
          {user ? (
            <div className="flex flex-col items-center space-y-4 bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center justify-between w-full pb-2 border-b border-gray-200">
                <button
                  onClick={() => setBalanceHidden(!balanceHidden)}
                  className="border-[2px] border-primary hover:bg-primary/5 text-primary rounded-full px-4 py-1.5 text-[14px] font-[800] tracking-wide transition-all w-full flex items-center justify-center gap-2"
                >
                  <span>Balance</span>
                  <span className="font-extrabold uppercase tracking-widest">
                    {balanceHidden ? "XXXX" : "₹ 1,24,500"}
                  </span>
                </button>
              </div>
              <div className="bg-brand/10 p-4 rounded-full text-brand">
                <UserIcon size={32} />
              </div>
              <div className="text-center">
                <p className="font-[700] text-[20px] text-gray-900">{user.name}</p>
                <p className="text-gray-500 mb-2">{user.email}</p>
              </div>

              {/* Mobile Profile Navigation Options */}
              <div className="w-full flex flex-col gap-2 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setIsProfileManagementExpanded(!isProfileManagementExpanded)}
                  className="flex items-center justify-between w-full hover:bg-slate-100/50 py-2 px-3 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 6v6a3 3 0 003 3h11" />
                      <path d="M14 11l4 4-4 4" />
                    </svg>
                    <span className="font-bold text-slate-800 text-[14px]">Profile Management</span>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 transition-transform ${isProfileManagementExpanded ? 'rotate-180' : '-rotate-90'}`} />
                </button>

                {isProfileManagementExpanded && (
                  <div className="flex flex-col pl-4 w-full">
                    {[
                      { label: "Update Profile", href: "/b2b/my-account?tab=update-profile" },
                      { label: "Manage User", href: "/b2b/my-account?tab=manage-user" },
                      { label: "Create Sub User", href: "/b2b/my-account?tab=manage-user&action=create-sub-user" },
                      { label: "Change Logo", href: "/b2b/my-account?tab=change-logo" },
                      { label: "Manage Customer Profile", href: "/b2b/my-account?tab=customer-profile", isLast: true },
                    ].map((sub, idx) => (
                      <Link
                        key={idx}
                        href={sub.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center group/sub text-slate-600 hover:text-[#D60D26] transition-colors text-[13px] font-bold py-1.5"
                      >
                        {sub.isLast ? (
                          <svg className="w-7 h-5 text-slate-300 group-hover/sub:text-[#D60D26] shrink-0 transition-colors" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="10" y1="0" x2="10" y2="12" />
                            <line x1="10" y1="12" x2="26" y2="12" />
                            <path d="M22 8l4 4-4 4" />
                          </svg>
                        ) : (
                          <svg className="w-7 h-5 text-slate-300 group-hover/sub:text-[#D60D26] shrink-0 transition-colors" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="10" y1="0" x2="10" y2="24" />
                            <line x1="10" y1="12" x2="26" y2="12" />
                            <path d="M22 8l4 4-4 4" />
                          </svg>
                        )}
                        <span className="pl-1 text-[13px]">{sub.label}</span>
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  href="/b2b/my-account?tab=notice-board"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 hover:bg-slate-100/50 py-2 px-3 rounded-lg transition-colors text-slate-800 hover:text-[#D60D26] text-[14px] font-bold"
                >
                  <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6v6a3 3 0 003 3h11" />
                    <path d="M14 11l4 4-4 4" />
                  </svg>
                  <span>Notice Board</span>
                </Link>

                <Link
                  href="/b2b/my-account?tab=contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 hover:bg-slate-100/50 py-2 px-3 rounded-lg transition-colors text-slate-800 hover:text-[#D60D26] text-[14px] font-bold"
                >
                  <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6v6a3 3 0 003 3h11" />
                    <path d="M14 11l4 4-4 4" />
                  </svg>
                  <span>Contact</span>
                </Link>
              </div>
              <Button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                variant="outline"
                className="w-full text-[18px] rounded-full py-6 font-[600] border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openAuthModal();
              }}
              className="w-full text-[20px] rounded-full py-7 font-[700] tracking-wide shadow-none transition-transform active:scale-95 bg-brand text-white hover:bg-brand/90"
            >
              Login / Signup
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
            </Button>
          )}
        </div>
      </div>

      {/* Auth Modal Portal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />

      {/* Notification Modal */}
      <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </>
  );
}
