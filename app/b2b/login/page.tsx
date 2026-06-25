"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function B2BAgentLoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show the exact error from the backend (wrong password, access denied, etc.)
        setError(data.detail || "Login failed. Please check your credentials.");
        return;
      }

      // Persist the real authenticated session
      setSession(
        {
          id: data.user.id,
          name: data.user.name,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
        },
        data.access,
        data.refresh
      );

      // Route by role
      if (data.user.role === "ADMIN") {
        router.push("/b2b/group-travel/operator");
      } else {
        router.push("/b2b/group-travel/view-request");
      }
    } catch {
      setError("Cannot reach the server. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row font-sans">
      {/* Left Column: Brand Banner */}
      <div className="lg:w-[50%] bg-[#121121] text-white flex flex-col justify-between p-8 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <Logo className="scale-125 origin-left" />
          <div>
            <h1 className="text-[24px] font-[900] tracking-tighter leading-none text-white">
              My Travel Deal
            </h1>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em] block mt-0.5">
              B2B Partner Portal
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12 lg:py-0">
          <span className="bg-red-500/10 border border-red-500/20 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-6">
            Partner Benefits
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
            Grow Your Travel Business with India's Smartest B2B Portal
          </h2>
          <p className="text-white/75 text-lg mb-8 max-w-lg">
            Access special B2B inventory, negotiated group fares, and automated booking systems
            designed to increase your commissions and streamline your cash flow.
          </p>
          <div className="space-y-4">
            {[
              "Agent Credit Wallet & Instant Deposit slip registration",
              "11-Stage Group Booking State Machine (MMT-style)",
              "Upload Passenger Manifest Lists closer to flight departure",
              "Real-time Upsize/Downsize passenger count requests",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0">
                  ✓
                </div>
                <span className="text-white/90 font-medium text-sm md:text-base">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs">
          © {new Date().getFullYear()} My Travel Deal Partner Desk. All rights reserved.
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="lg:w-[50%] flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-[440px]">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Agent Sign In</h2>
          <p className="text-slate-500 font-medium mb-8">
            Enter your registered agent credentials to access the portal.
          </p>

          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block" htmlFor="identifier">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-5 h-5" />
                </span>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter your username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  className="pl-12 py-6 rounded-xl border-slate-200 text-slate-800 focus-visible:ring-[#D60D26] focus-visible:border-[#D60D26] text-base"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700 block" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pl-12 pr-12 py-6 rounded-xl border-slate-200 text-slate-800 focus-visible:ring-[#D60D26] focus-visible:border-[#D60D26] text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-full bg-primary hover:bg-[#D60D26] text-white text-lg font-bold shadow-md shadow-red-500/10 flex items-center justify-center gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  Login to Agent Portal
                  <ArrowUpRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center text-sm font-semibold text-slate-500">
            Don't have an agent account?{" "}
            <Link href="/b2b/register" className="text-primary hover:underline">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
