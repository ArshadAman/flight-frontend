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
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const NavItem = ({ name, hasDropdown = true }: { name: string, hasDropdown?: boolean }) => (
    <div className="relative flex items-center h-full">
      <button
        onClick={() => hasDropdown ? toggleDropdown(name) : undefined}
        className={`relative text-[14px] xl:text-[16px] py-1 flex items-center justify-center transition-colors duration-200 ${
          openDropdown === name ? 'font-[700] text-primary' : 'font-[500] text-[#8C959F] hover:text-[#57606a]'
        }`}
      >
        <div className="flex items-center gap-1">
          {name}
          {hasDropdown && <ChevronDown size={16} className={`transition-transform duration-200 ${openDropdown === name ? 'rotate-180' : ''}`} />}
        </div>
      </button>
      {hasDropdown && openDropdown === name && (
        <div className="absolute top-full left-0 mt-5 w-48 bg-white border-t-[5px] border-[#E11D48] rounded-xl shadow-xl z-50 p-2">
           <div className="flex flex-col gap-1">
             <div className="px-4 py-2 hover:bg-slate-50 rounded-lg text-sm cursor-pointer font-medium text-slate-800">Option 1</div>
             <div className="px-4 py-2 hover:bg-slate-50 rounded-lg text-sm cursor-pointer font-medium text-slate-800">Option 2</div>
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
              <NavItem name="Group Travel" />
              <NavItem name="My Booking" />
              <NavItem name="My Account" />
              <NavItem name="For Sale" />
              {user && <NavItem name={user.name || "Sanjay"} />}
            </nav>

            {/* Desktop Action Button */}
            <div className="hidden lg:flex items-center mt-1">
              {user ? (
                <div className="border border-[#E11D48] rounded-full px-5 py-2.5 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-rose-50 transition-colors">
                  <span className="font-bold text-[#E11D48] text-sm xl:text-base">Balance</span>
                  <span className="text-[#E11D48] font-medium text-sm xl:text-base">XXXX</span>
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
        </nav>
        
        <div className="mt-auto px-6 pt-6 pb-8 w-full border-t border-slate-100">
           {user ? (
             <div className="border border-[#E11D48] rounded-full px-5 py-3 flex items-center justify-center gap-2">
               <span className="font-bold text-[#E11D48]">Balance</span>
               <span className="text-[#E11D48]">XXXX</span>
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
