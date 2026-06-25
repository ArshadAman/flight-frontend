"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AgentLoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in as agent, redirect to dashboard
  useEffect(() => {
    if (user) {
      if (user.role === "AGENT" || user.role === "ADMIN") {
        router.push("/agent/dashboard");
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const loggedInUser = await login(identifier.trim(), password);
      
      if (!loggedInUser) {
        setError("Login failed. No user details returned.");
        return;
      }

      if (loggedInUser.role !== "AGENT" && loggedInUser.role !== "ADMIN") {
        setError("Access denied. This portal is for Agents only.");
        return;
      }

      router.push("/agent/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row font-sans">
      {/* Left Column: Brand Banner (matching the B2B partner desk style) */}
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
            Agent Desk
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
            Empowering Agents with Premium Booking Tools
          </h2>
          <p className="text-white/75 text-lg mb-8 max-w-lg">
            Log in to manage bookings, track earnings, configure commission slabs, and issue flight tickets seamlessly.
          </p>
          <div className="space-y-4">
            {[
              "Exclusive agent-only flight inventories",
              "B2B group travel and quick quoting desk",
              "Robust cash deposit & credit limits",
              "24/7 dedicated partner support helpline",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 text-xs">
                  ✓
                </div>
                <span className="text-white/95 font-medium text-sm md:text-base">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs">
          © {new Date().getFullYear()} My Travel Deal Partner Desk. All rights reserved.
        </div>
      </div>

      {/* Right Column: Login Form (matching the app's clean white theme) */}
      <div className="lg:w-[50%] flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-[440px]">
          <h2 className="text-3xl font-extrabold text-[#0C2342] mb-2">Agent Sign In</h2>
          <p className="text-slate-500 font-medium mb-8">
            Enter your agent credentials to access the workspace.
          </p>

          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#D60D26]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#0C2342] block" htmlFor="identifier">
                Username / Email
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
                  className="pl-12 py-6 rounded-xl border-slate-200 text-slate-800 focus-visible:ring-[#D60D26] focus-visible:border-[#D60D26] text-base placeholder:text-slate-400 bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#0C2342] block" htmlFor="password">
                Password
              </label>
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
                  className="pl-12 pr-12 py-6 rounded-xl border-slate-200 text-slate-800 focus-visible:ring-[#D60D26] focus-visible:border-[#D60D26] text-base placeholder:text-slate-400 bg-white"
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
              className="w-full py-6 rounded-full bg-primary hover:bg-[#B30B1E] text-white text-lg font-bold shadow-md shadow-red-500/10 flex items-center justify-center gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
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
            <Link href="/agent/signup" className="text-primary hover:underline hover:text-red-700 transition-colors">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
