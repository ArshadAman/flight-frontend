"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Menu, X, ChevronDown, User as UserIcon, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";

export function B2BNavbar() {
  const { isAuthModalOpen, openAuthModal, closeAuthModal, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMyAccountOpen, setIsMyAccountOpen] = useState(false);
  const [isPaymentExpanded, setIsPaymentExpanded] = useState(true); // Starts expanded just like in the screenshot
  const [balanceHidden, setBalanceHidden] = useState(true);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const myAccountRef = useRef<HTMLDivElement>(null);

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
    }
    if (openDropdown || isUserDropdownOpen || isMyAccountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown, isUserDropdownOpen, isMyAccountOpen]);

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
        className={`relative text-[14px] xl:text-[16px] py-1 flex items-center justify-center transition-colors duration-200 ${
          openDropdown === name || (name === "Group Travel" && pathname.startsWith('/b2b/group-travel'))
            ? 'font-[700] text-primary' 
            : 'font-[500] text-[#8C959F] hover:text-[#57606a]'
        }`}
      >
        <div className="flex items-center gap-1">
          {name}
          {hasDropdown && <ChevronDown size={16} className={`transition-transform duration-200 ${openDropdown === name ? 'rotate-180' : ''}`} />}
        </div>
      </button>
      {hasDropdown && openDropdown === name && options.length > 0 && (
        <div className="absolute top-full left-0 mt-5 min-w-[240px] bg-white border-t-[5px] border-[#E11D48] rounded-xl shadow-xl z-50 p-2">
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
                    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10C7 13.3137 9.68629 16 13 16H18" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 13L18 16L15 19" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  },
                  { 
                    label: "Request", 
                    href: "/b2b/group-travel/view-request",
                    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10C7 13.3137 9.68629 16 13 16H18" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 13L18 16L15 19" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  },
                  { 
                    label: "Modified Request", 
                    href: "/b2b/group-travel/add-passenger",
                    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10C7 13.3137 9.68629 16 13 16H18" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 13L18 16L15 19" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  }
                ]}
              />
              <Link
                href="/b2b/my-booking"
                className={`relative text-[14px] xl:text-[16px] py-1 flex items-center justify-center transition-colors duration-200 ${
                  pathname.startsWith('/b2b/my-booking') ? 'font-[700] text-primary' : 'font-[500] text-[#8C959F] hover:text-[#57606a]'
                }`}
              >
                My Booking
              </Link>
              
              {/* Custom High-Fidelity My Account Dropdown */}
              <div className="relative flex items-center h-full" ref={myAccountRef}>
                <button
                  onClick={() => setIsMyAccountOpen(!isMyAccountOpen)}
                  className={`relative text-[14px] xl:text-[16px] py-1 flex items-center justify-center transition-colors duration-200 ${
                    isMyAccountOpen || pathname.startsWith('/b2b/my-account') || pathname.startsWith('/b2b/payment') || pathname.startsWith('/b2b/reports') || pathname.startsWith('/b2b/manage-commission')
                      ? 'font-[700] text-[#DF1B24]' 
                      : 'font-[500] text-[#8C959F] hover:text-[#57606a]'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    My Account
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isMyAccountOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {/* Active Red Dot */}
                  {(isMyAccountOpen || pathname.startsWith('/b2b/my-account') || pathname.startsWith('/b2b/payment') || pathname.startsWith('/b2b/reports') || pathname.startsWith('/b2b/manage-commission')) && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#DF1B24] rounded-full" />
                  )}
                </button>

                {isMyAccountOpen && (
                  <div className="absolute top-full left-0 mt-5 min-w-[280px] bg-white border-t-[5px] border-[#E11D48] rounded-xl shadow-xl z-50 p-4 animate-in fade-in duration-200">
                    <div className="flex flex-col gap-3">
                      
                      {/* Top-Level: Payment */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => setIsPaymentExpanded(!isPaymentExpanded)}
                          className="flex items-center justify-between w-full hover:bg-slate-50 py-1.5 px-2 rounded transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            {/* Curved Red Arrow Icon */}
                            <svg className="w-4.5 h-4.5 text-[#DF1B24] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                                  className="flex items-center gap-2 pl-1.5 group/sub text-slate-600 hover:text-[#DF1B24] transition-colors text-[13px] font-bold"
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
                        className="flex items-center gap-2 hover:bg-slate-50 py-1.5 px-2 rounded transition-colors text-slate-800 hover:text-[#DF1B24] text-[14px] font-bold"
                      >
                        {/* Curved Red Arrow Icon */}
                        <svg className="w-4.5 h-4.5 text-[#DF1B24] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 6v6a3 3 0 003 3h11" />
                          <path d="M14 11l4 4-4 4" />
                        </svg>
                        <span>Reports</span>
                      </Link>

                      {/* Top-Level: Manage Commission */}
                      <Link
                        href="/b2b/manage-commission"
                        onClick={() => setIsMyAccountOpen(false)}
                        className="flex items-center gap-2 hover:bg-slate-50 py-1.5 px-2 rounded transition-colors text-slate-800 hover:text-[#DF1B24] text-[14px] font-bold"
                      >
                        {/* Curved Red Arrow Icon */}
                        <svg className="w-4.5 h-4.5 text-[#DF1B24] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 6v6a3 3 0 003 3h11" />
                          <path d="M14 11l4 4-4 4" />
                        </svg>
                        <span>Manage Commission</span>
                      </Link>

                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/b2b/for-sale"
                className={`relative text-[14px] xl:text-[16px] py-1 flex items-center justify-center transition-colors duration-200 ${
                  pathname.startsWith('/b2b/for-sale') ? 'font-[700] text-primary' : 'font-[500] text-[#8C959F] hover:text-[#57606a]'
                }`}
              >
                For Sale
              </Link>
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
                  <div className="relative">
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center justify-center w-10 xl:w-12 h-10 xl:h-12 rounded-full bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                    >
                      <UserIcon size={22} className="xl:hidden" />
                      <UserIcon size={24} className="hidden xl:block" />
                    </button>
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100 mb-2">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>

                        <button
                          onClick={() => {
                            logout();
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 flex items-center"
                        >
                          <LogOut size={16} className="mr-2" />
                          Logout
                        </button>
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

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center">
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
          <NavLink href="/b2b/group-travel" isMobile onClick={() => setIsMobileMenuOpen(false)}>Group Travel</NavLink>
          <NavLink href="/b2b/my-booking" isMobile onClick={() => setIsMobileMenuOpen(false)}>My Booking</NavLink>
          
          {/* Mobile My Account Nested Panel */}
          <div className="flex flex-col pl-4 py-2 border-l-2 border-slate-100 gap-2">
            <span className="text-[12px] font-extrabold text-slate-400 uppercase tracking-wider pl-2">My Account</span>
            <div className="pl-2 flex flex-col gap-2">
              <span className="text-[14px] font-extrabold text-slate-700">Payment</span>
              <div className="pl-4 flex flex-col gap-2 border-l border-slate-200">
                <Link href="/b2b/payment?tab=online-deposit" onClick={() => setIsMobileMenuOpen(false)} className="text-[13px] font-bold text-slate-500 hover:text-primary">Online Payment Deposit</Link>
                <Link href="/b2b/payment?tab=payment-request" onClick={() => setIsMobileMenuOpen(false)} className="text-[13px] font-bold text-slate-500 hover:text-primary">Payment Request</Link>
                <Link href="/b2b/payment?tab=deposit-slip" onClick={() => setIsMobileMenuOpen(false)} className="text-[13px] font-bold text-slate-500 hover:text-primary">Deposit Slip</Link>
                <Link href="/b2b/payment?tab=payment-due" onClick={() => setIsMobileMenuOpen(false)} className="text-[13px] font-bold text-slate-500 hover:text-primary">Payment Due</Link>
              </div>
              <Link href="/b2b/reports" onClick={() => setIsMobileMenuOpen(false)} className="text-[14px] font-extrabold text-slate-700 hover:text-primary mt-1">Reports</Link>
              <Link href="/b2b/manage-commission" onClick={() => setIsMobileMenuOpen(false)} className="text-[14px] font-extrabold text-slate-700 hover:text-primary">Manage Commission</Link>
            </div>
          </div>

          <NavLink href="/b2b/for-sale" isMobile onClick={() => setIsMobileMenuOpen(false)}>For Sale</NavLink>
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
                 <p className="text-gray-500">{user.email}</p>
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
    </>
  );
}
