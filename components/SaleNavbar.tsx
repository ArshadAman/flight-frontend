"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Menu, X, ChevronDown, ChevronRight, User as UserIcon, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";

export function SaleNavbar() {
  const { isAuthModalOpen, openAuthModal, closeAuthModal, user: authUser, logout } = useAuth();
  const user = authUser || { name: "Sanjay", email: "sanjay@destinyholidays.com" };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(true);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    setIsUserDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    if (openDropdown || isUserDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown, isUserDropdownOpen]);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  type DropdownOption = {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };

  const CurvedArrowIcon = () => (
    <svg className="w-4.5 h-4.5 text-[#D60D26] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6v6a3 3 0 003 3h11" />
      <path d="M14 11l4 4-4 4" />
    </svg>
  );

  const NavItem = ({ name, hasDropdown = true, options = [], linkHref }: { name: string, hasDropdown?: boolean, options?: DropdownOption[], linkHref?: string }) => {
    const isActive = openDropdown === name || (linkHref && pathname === linkHref) || (!linkHref && pathname.includes(name.toLowerCase()));

    if (!hasDropdown && linkHref) {
      return (
        <div className="relative flex items-center h-full">
          <Link
            href={linkHref}
            className={`relative text-[14px] xl:text-[16px] py-1 flex items-center justify-center transition-colors duration-200 ${isActive ? 'font-[700] text-[#D60D26]' : 'font-[500] text-[#888] hover:text-[#0C2342]'}`}
          >
            {name}
            {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-[#D60D26] rounded-full" />}
          </Link>
        </div>
      );
    }

    return (
      <div className="relative flex items-center h-full">
        <button
          onClick={() => hasDropdown ? toggleDropdown(name) : undefined}
          className={`relative text-[14px] xl:text-[16px] py-1 flex flex-col items-center justify-center transition-colors duration-200 ${isActive
            ? 'font-[700] text-[#D60D26]'
            : 'font-[500] text-[#888] hover:text-[#0C2342]'
            }`}
        >
          <div className="flex items-center gap-1">
            {name}
            {hasDropdown && <ChevronDown size={16} className={`transition-transform duration-200 ${openDropdown === name ? 'rotate-180' : ''}`} />}
          </div>
          {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-[#D60D26] rounded-full" />}
        </button>
        {hasDropdown && openDropdown === name && options.length > 0 && (
          <div className="absolute top-full left-0 mt-5 min-w-[200px] bg-white border-t-[5px] border-[#D60D26] rounded-xl shadow-xl z-50 p-2">
            <div className="flex flex-col gap-1">
              {options.map((opt, idx) => (
                <Link
                  key={idx}
                  href={opt.href}
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {opt.icon && <div className="shrink-0">{opt.icon}</div>}
                  <span className="font-bold text-slate-800 text-[13px]">{opt.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 w-full z-[100] bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 lg:px-10">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <Link href="/" className="flex flex-col items-center justify-center select-none cursor-pointer">
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
              <NavItem name="Home" hasDropdown={false} linkHref="/" />
              <NavItem
                name="Flight"
                options={[
                  { label: "All Booking", href: "/sale/flight/all", icon: <CurvedArrowIcon /> },
                  { label: "Pending Booking", href: "/sale/flight/pending", icon: <CurvedArrowIcon /> },
                  { label: "Bookable", href: "/sale/flight/bookable", icon: <CurvedArrowIcon /> },
                  { label: "Sold Out", href: "/sale/flight/sold-out", icon: <CurvedArrowIcon /> },
                  { label: "Export", href: "/sale/flight/export", icon: <CurvedArrowIcon /> },
                ]}
              />
              <NavItem name="Booking" hasDropdown={false} linkHref="/my-booking" />
              <NavItem name="Reports" hasDropdown={false} linkHref="/sale/reports" />
              <NavItem name="Inventory" hasDropdown={false} linkHref="/sale/inventory" />
              <NavItem name="History" hasDropdown={false} linkHref="/sale/history" />
            </nav>

            {/* Desktop Action Button */}
            <div className="hidden lg:flex items-center gap-4 mt-1">
              {user ? (
                <div className="flex items-center gap-4" ref={userDropdownRef}>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="relative flex flex-col items-center justify-center py-1 transition-colors duration-200 select-none group"
                    >
                      <div className="flex items-center gap-1 font-[700] text-slate-800 group-hover:text-primary transition-colors text-[15px] xl:text-[17px]">
                        <span>{user?.name || "Sanjay"}</span>
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180 text-primary' : 'text-slate-500'}`} />
                      </div>
                    </button>

                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-4 w-[240px] bg-white border-t-[4px] border-[#D60D26] rounded-xl shadow-xl z-50 p-2 animate-in fade-in duration-200">
                        <div className="flex flex-col gap-1">

                          <Link href="/sale/profile" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center justify-between hover:bg-slate-50 py-2.5 px-3 rounded-lg transition-colors group">
                            <div className="flex items-center gap-2">
                              <CurvedArrowIcon />
                              <span className="font-bold text-slate-800 text-[14px]">Profile Management</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600" />
                          </Link>

                          <Link href="/sale/notice-board" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-2 hover:bg-slate-50 py-2.5 px-3 rounded-lg transition-colors group">
                            <CurvedArrowIcon />
                            <span className="font-bold text-slate-800 text-[14px]">Notice Board</span>
                          </Link>

                          <Link href="/sale/contact" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-2 hover:bg-slate-50 py-2.5 px-3 rounded-lg transition-colors group">
                            <CurvedArrowIcon />
                            <span className="font-bold text-slate-800 text-[14px]">Contact</span>
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

                </div>
              ) : (
                <Button
                  onClick={() => openAuthModal()}
                  className="text-[16px] xl:text-[22px] rounded-full px-4 xl:px-6 py-[20px] xl:py-[24px] font-[700] tracking-wide shadow-none transition-transform hover:scale-105 active:scale-95 bg-brand text-white hover:bg-brand/90"
                >
                  Login / Signup
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

      {/* Mobile Menu (simplified for sale) */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[105] bg-slate-900/50 transition-opacity backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

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
          <NavLink href="/sale/flight/all" isMobile onClick={() => setIsMobileMenuOpen(false)}>Flight</NavLink>
          <NavLink href="/my-booking" isMobile onClick={() => setIsMobileMenuOpen(false)}>Booking</NavLink>
          <NavLink href="/sale/reports" isMobile onClick={() => setIsMobileMenuOpen(false)}>Reports</NavLink>
          <NavLink href="/sale/inventory" isMobile onClick={() => setIsMobileMenuOpen(false)}>Inventory</NavLink>
          <NavLink href="/sale/history" isMobile onClick={() => setIsMobileMenuOpen(false)}>History</NavLink>
        </nav>

        <div className="mt-auto px-6 pt-6 pb-8 w-full border-t border-slate-100">
          {user && (
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
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
}
