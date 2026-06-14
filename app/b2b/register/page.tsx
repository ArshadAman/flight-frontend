"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, ArrowUpRight, User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";

export default function B2BRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError("Username, email, and password are required.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Registration failed. Please try again.");
        return;
      }

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => router.push("/b2b/login"), 2000);
    } catch {
      setError("Cannot reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    id, label, type = "text", value, onChange, placeholder, autoComplete, rightEl,
  }: {
    id: string; label: string; type?: string; value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    placeholder: string; autoComplete?: string; rightEl?: React.ReactNode;
  }) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-bold text-slate-700 block">{label}</label>
      <div className="relative">
        <Input
          id={id} type={type} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete={autoComplete}
          className="py-5 rounded-xl border-slate-200 text-slate-800 focus-visible:ring-[#D60D26] focus-visible:border-[#D60D26] text-base pr-12"
        />
        {rightEl && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      {/* Left Brand Panel */}
      <div className="lg:w-[45%] bg-[#121121] text-white flex flex-col justify-between p-8 md:p-14 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <Logo className="scale-125 origin-left" />
          <div>
            <h1 className="text-[22px] font-[900] tracking-tighter leading-none text-white">My Travel Deal</h1>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em] block mt-0.5">B2B Partner Portal</span>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12 lg:py-0">
          <span className="bg-red-500/10 border border-red-500/20 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-6">
            Join the Network
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
            Create Your Free Agent Account
          </h2>
          <p className="text-white/70 text-base mb-8">
            Register now and start accessing exclusive B2B fares, group booking tools, and agent commissions immediately after approval.
          </p>
          <div className="space-y-3">
            {[
              "Instant access to B2B group booking dashboard",
              "Exclusive negotiated airline fares",
              "MMT-style 11-stage booking lifecycle",
              "Passenger manifest upload & ticket issuance",
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0 text-xs">✓</div>
                <span className="text-white/85 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs">
          © {new Date().getFullYear()} My Travel Deal. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:w-[55%] flex items-center justify-center p-8 md:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-[520px]">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-1">Create Agent Account</h2>
          <p className="text-slate-500 text-sm font-medium mb-8">
            All accounts are registered as <strong className="text-[#D60D26]">B2B Travel Agents</strong>.
          </p>

          {error && (
            <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3.5 rounded-xl text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field id="first_name" label="First Name" value={form.first_name} onChange={set("first_name")} placeholder="Rajesh" autoComplete="given-name" />
              <Field id="last_name" label="Last Name" value={form.last_name} onChange={set("last_name")} placeholder="Sharma" autoComplete="family-name" />
            </div>

            <Field id="username" label="Username *" value={form.username} onChange={set("username")} placeholder="agent_rajesh" autoComplete="username" />
            <Field id="email" label="Email Address *" type="email" value={form.email} onChange={set("email")} placeholder="rajesh@travelagency.com" autoComplete="email" />
            <Field id="phone_number" label="Phone Number" type="tel" value={form.phone_number} onChange={set("phone_number")} placeholder="+91 98765 43210" autoComplete="tel" />

            <Field
              id="password" label="Password *" type={showPassword ? "text" : "password"}
              value={form.password} onChange={set("password")} placeholder="Min. 8 characters"
              autoComplete="new-password"
              rightEl={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />
            <Field
              id="confirm_password" label="Confirm Password *" type={showConfirm ? "text" : "password"}
              value={form.confirm_password} onChange={set("confirm_password")} placeholder="Re-enter password"
              autoComplete="new-password"
              rightEl={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <Button
              type="submit" disabled={loading}
              className="w-full py-6 rounded-full bg-primary hover:bg-[#D60D26] text-white text-base font-bold shadow-md shadow-red-500/10 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>Create Agent Account <ArrowUpRight className="w-5 h-5" /></>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm font-semibold text-slate-500">
            Already have an account?{" "}
            <Link href="/b2b/login" className="text-primary hover:underline">Sign In Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
