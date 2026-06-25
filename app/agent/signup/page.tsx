"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, ArrowUpRight, User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AgentSignupPage() {
  const router = useRouter();
  const { registerAgent } = useAuth();
  
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

  const handleFieldChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic Validation
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError("Username, Email, and Password are required fields.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone_number: form.phone_number.trim(),
      };

      await registerAgent(payload);

      setSuccess("Agent account registered successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/agent/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const RenderField = ({
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    autoComplete,
    rightEl,
  }: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    placeholder: string;
    autoComplete?: string;
    rightEl?: React.ReactNode;
  }) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-bold text-[#0C2342] block">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="py-5 rounded-xl border-slate-200 bg-white text-slate-800 focus-visible:ring-[#D60D26] focus-visible:border-[#D60D26] text-base pr-12 placeholder:text-slate-400"
        />
        {rightEl && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row font-sans">
      {/* Left Column: Brand Panel (matching the B2B partner desk style) */}
      <div className="lg:w-[45%] bg-[#121121] text-white flex flex-col justify-between p-8 md:p-14 relative overflow-hidden border-r border-slate-800">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <Logo className="scale-125 origin-left" />
          <div>
            <h1 className="text-[22px] font-[900] tracking-tighter leading-none text-white">
              My Travel Deal
            </h1>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em] block mt-0.5">
              B2B Partner Portal
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12 lg:py-0">
          <span className="bg-red-500/10 border border-red-500/20 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-6">
            Join the Network
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
            Create Agent Account
          </h2>
          <p className="text-white/70 text-base mb-8">
            Register now to join the most powerful B2B travel desk. Create group flights, verify payouts, and manage passenger names with ease.
          </p>
          <div className="space-y-3">
            {[
              "Instant access to Agent Dashboard",
              "Exclusive group airline inventories",
              "11-Stage booking states pipeline",
              "Passenger name manifest management tools",
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 text-xs">
                  ✓
                </div>
                <span className="text-white/85 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs">
          © {new Date().getFullYear()} My Travel Deal. All rights reserved.
        </div>
      </div>

      {/* Right Column: Register Form (matching the app's clean white theme) */}
      <div className="lg:w-[55%] flex items-center justify-center p-8 md:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-[520px]">
          <h2 className="text-2xl font-extrabold text-[#0C2342] mb-1">Create Agent Account</h2>
          <p className="text-slate-500 text-sm font-medium mb-8">
            Register below. Your account will automatically have <strong className="text-primary">B2B Agent</strong> privileges.
          </p>

          {error && (
            <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#D60D26]" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3.5 rounded-xl text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <RenderField
                id="first_name"
                label="First Name"
                value={form.first_name}
                onChange={handleFieldChange("first_name")}
                placeholder="Rajesh"
                autoComplete="given-name"
              />
              <RenderField
                id="last_name"
                label="Last Name"
                value={form.last_name}
                onChange={handleFieldChange("last_name")}
                placeholder="Sharma"
                autoComplete="family-name"
              />
            </div>

            <RenderField
              id="username"
              label="Username *"
              value={form.username}
              onChange={handleFieldChange("username")}
              placeholder="agent_rajesh"
              autoComplete="username"
            />
            <RenderField
              id="email"
              label="Email Address *"
              type="email"
              value={form.email}
              onChange={handleFieldChange("email")}
              placeholder="rajesh@agency.com"
              autoComplete="email"
            />
            <RenderField
              id="phone_number"
              label="Phone Number"
              type="tel"
              value={form.phone_number}
              onChange={handleFieldChange("phone_number")}
              placeholder="+91 98765 43210"
              autoComplete="tel"
            />

            <RenderField
              id="password"
              label="Password *"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleFieldChange("password")}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />
            <RenderField
              id="confirm_password"
              label="Confirm Password *"
              type={showConfirm ? "text" : "password"}
              value={form.confirm_password}
              onChange={handleFieldChange("confirm_password")}
              placeholder="Re-enter password"
              autoComplete="new-password"
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-full bg-primary hover:bg-[#B30B1E] text-white text-base font-bold shadow-md shadow-red-500/10 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Agent Account <ArrowUpRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm font-semibold text-slate-500">
            Already have an account?{" "}
            <Link href="/agent/login" className="text-primary hover:underline hover:text-red-700 transition-colors">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
