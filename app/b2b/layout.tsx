"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Pages inside /b2b that don't need a login
const PUBLIC_PATHS = ["/b2b/login", "/b2b/register"];

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    // Wait until localStorage has been read before making any decision
    if (isLoading) return;
    // If not logged in and on a protected page → redirect to login
    if (!user && !isPublic) {
      router.replace("/b2b/login");
    }
  }, [user, isLoading, isPublic, router]);

  // While reading localStorage — show nothing (prevents flash of wrong page)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-[#D60D26]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-slate-500 text-sm font-semibold">Loading...</span>
        </div>
      </div>
    );
  }

  // Protected page but not logged in — render nothing (redirect in-flight)
  if (!user && !isPublic) return null;

  return <>{children}</>;
}
