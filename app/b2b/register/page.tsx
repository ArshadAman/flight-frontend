"use client";

import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { B2BRegistrationForm } from "@/components/B2BRegistrationForm";

export default function B2BRegister() {
  return (
    <main id="main-content" className="min-h-screen flex flex-col overflow-x-hidden w-full max-w-full">
      <B2BNavbar />
      
      {/* Full Page Background Image */}
      <div className="relative w-full min-h-[90vh] flex flex-col items-center justify-center py-16">
        <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat fixed"
            style={{ backgroundImage: "url('/hero-bg.png')" }}
        >
            <div className="absolute inset-0 bg-slate-900/30"></div>
        </div>
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto">
           <B2BRegistrationForm />
        </div>
      </div>

      <Footer />
    </main>
  );
}
