"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/AuthModal";
import { Logo } from "@/components/ui/logo";
import { Menu, X, User as UserIcon, LogOut, ChevronDown, CornerDownRight, ChevronRight, ArrowRight, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NavLink } from "@/components/NavLink";
import { NotificationModal } from "@/components/NotificationModal";

export function Navbar() {
  const { isAuthModalOpen, openAuthModal, closeAuthModal, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGroupTravelOpen, setIsGroupTravelOpen] = useState(false);
  const [isMyAccountOpen, setIsMyAccountOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const groupTravelRef = useRef<HTMLDivElement>(null);
  const myAccountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsGroupTravelOpen(false);
    setIsMyAccountOpen(false);
  }, [pathname]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (groupTravelRef.current && !groupTravelRef.current.contains(event.target as Node)) {
        setIsGroupTravelOpen(false);
      }
      if (myAccountRef.current && !myAccountRef.current.contains(event.target as Node)) {
        setIsMyAccountOpen(false);
      }
    }

    if (isDropdownOpen || isGroupTravelOpen || isMyAccountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isGroupTravelOpen, isMyAccountOpen]);

  return (
    <>
      <header className="sticky top-0 w-full z-[100] bg-white border-b border-gray-200 shadow-md">
        <div className="container mx-auto px-4 md:px-8 lg:px-10">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}

            <Link href="/" className="flex flex-col items-center justify-center select-none cursor-pointer">
              <Logo />
              {/* Brand Text Area */}
              <div className="flex flex-col items-center mt-1">
                <h1
                  className="text-[22px] font-[905] text-brand leading-none tracking-tighter font-sans"
                  style={{ letterSpacing: '-0.04em' }}
                >
                  My Travel Deal
                </h1>

                {/* Signature Red Arc Underline */}
                <svg
                  width="120"
                  height="8"
                  viewBox="2 2 120 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-brand mt-0.5"
                >
                  <path
                    /* This path creates the tapered 'sharp' ends seen in your brand image */
                    d="M2 6C35 0 85 0 118 6L118 8C85 2 35 2 2 8Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </Link>


            {/* Nav Links */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8 mt-1">
              <NavLink href="/">Home</NavLink>

              {/* Group Travel Dropdown */}
              <div className="relative flex items-center h-full" ref={groupTravelRef}>
                <button
                  onClick={() => setIsGroupTravelOpen(!isGroupTravelOpen)}
                  className={`relative text-[16px] xl:text-[20px] py-1 flex flex-col items-center justify-center transition-colors duration-200 ${isGroupTravelOpen || pathname.startsWith('/group-travel')
                    ? 'font-[700] text-primary'
                    : 'font-[500] text-[#888] hover:text-[#0C2342]'
                    }`}
                >
                  <div className="flex items-center gap-1">
                    Group Travel
                    <ChevronDown size={18} className={`transition-transform duration-200 ${isGroupTravelOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {(isGroupTravelOpen || pathname.startsWith('/group-travel')) && <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />}
                </button>

                {isGroupTravelOpen && (
                  <div className="absolute top-full left-0 mt-5 w-64 bg-white border-t-[5px] border-[#D60D26] rounded-2xl shadow-xl z-50 p-2">
                    <div className="flex flex-col gap-1">
                      <Link
                        href="/group-travel/new"
                        onClick={() => setIsGroupTravelOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                          <path d="M7 10C7 13.3137 9.68629 16 13 16H18" stroke="#D60D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M15 13L18 16L15 19" stroke="#D60D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-bold text-slate-800">New Booking</span>
                      </Link>
                      <Link
                        href="/group-travel/view-request"
                        onClick={() => setIsGroupTravelOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                          <path d="M7 10C7 13.3137 9.68629 16 13 16H18" stroke="#D60D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M15 13L18 16L15 19" stroke="#D60D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-bold text-slate-800">Request</span>
                      </Link>
                      <Link
                        href="/group-travel/add-passenger"
                        onClick={() => setIsGroupTravelOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                          <path d="M7 10C7 13.3137 9.68629 16 13 16H18" stroke="#D60D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M15 13L18 16L15 19" stroke="#D60D26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-bold text-slate-800">Modified Request</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <NavLink href="/about">About Us</NavLink>
              <NavLink href="/sale">For Sale</NavLink>
            </nav>

            {/* Desktop Action Button */}
            <div className="hidden lg:flex items-center gap-2 mt-1">


              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-center w-10 xl:w-12 h-10 xl:h-12 rounded-full bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                  >
                    <UserIcon size={22} className="xl:hidden" />
                    <UserIcon size={24} className="hidden xl:block" />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 mb-2">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>

                      <Link
                        href="/my-account"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <UserIcon size={16} className="mr-2" />
                        My Account
                      </Link>

                      <Link
                        href="/my-booking"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        My Bookings
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 flex items-center"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
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

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="text-slate-600 p-2 mr-1 relative"
              >
                <Bell size={24} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full border border-white"></span>
              </button>
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
          <NavLink href="/" isMobile onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>

          <div className="flex flex-col pl-4 py-2 border-l-2 border-slate-100 gap-2">
            <span className="text-[12px] font-extrabold text-slate-400 uppercase tracking-wider pl-2">Group Travel</span>
            <div className="pl-2 flex flex-col gap-2">
              <div className="pl-4 flex flex-col gap-2 border-l border-slate-200">
                <Link href="/group-travel/new" onClick={() => setIsMobileMenuOpen(false)} className="text-[13px] font-bold text-slate-500 hover:text-primary">New Booking</Link>
                <Link href="/group-travel/view-request" onClick={() => setIsMobileMenuOpen(false)} className="text-[13px] font-bold text-slate-500 hover:text-primary">Request</Link>
                <Link href="/group-travel/add-passenger" onClick={() => setIsMobileMenuOpen(false)} className="text-[13px] font-bold text-slate-500 hover:text-primary">Modified Request</Link>
              </div>
            </div>
          </div>

          <NavLink href="/about" isMobile onClick={() => setIsMobileMenuOpen(false)}>About Us</NavLink>
          <NavLink href="/sale" isMobile onClick={() => setIsMobileMenuOpen(false)}>For Sale</NavLink>
        </nav>

        <div className="mt-auto px-6 pt-6 pb-8 w-full border-t border-slate-100">
          {user ? (
            <div className="flex flex-col items-center space-y-4 bg-gray-50 rounded-2xl p-6">
              <div className="bg-brand/10 p-4 rounded-full text-brand">
                <UserIcon size={32} />
              </div>
              <div className="text-center">
                <p className="font-[700] text-[20px] text-gray-900">{user.name}</p>
                <p className="text-gray-500">{user.email}</p>
              </div>

              <div className="w-full flex flex-col gap-2 pt-2 pb-2">
                <Link
                  href="/my-account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  <UserIcon size={18} className="mr-2" />
                  My Account
                </Link>

                <Link
                  href="/my-booking"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-[18px] h-[18px] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  My Bookings
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

      {/* Notification Modal Portal */}
      <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </>
  );
}
