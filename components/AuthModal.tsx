"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, Briefcase, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Which top-level portal: customer or agent
type Portal = "customer" | "agent";
// Which form within the portal
type AuthTab = "login" | "signup";

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [portal, setPortal] = useState<Portal>("customer");
    const [activeTab, setActiveTab] = useState<AuthTab>("login");

    // Shared form fields
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const { login, register, registerAgent } = useAuth();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const isB2bRoute = pathname?.startsWith("/b2b");

    // Lock body scroll while open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    // Reset form when switching portals or tabs
    useEffect(() => {
        setIdentifier("");
        setPassword("");
        setName("");
        setErrorMessage(null);
    }, [portal, activeTab]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!identifier || !password) return;
        setErrorMessage(null);
        setLoading(true);
        try {
            if (activeTab === "login") {
                const loggedInUser = await login(identifier.trim(), password);
                onClose();
                if (loggedInUser && loggedInUser.role === "AGENT") {
                    router.push(pathname?.startsWith("/sale") ? "/sale/inventory" : "/agent/dashboard");
                }
            } else {
                const payload = {
                    username: identifier.trim(),
                    email: identifier.includes("@") ? identifier.trim() : `${identifier.trim()}@example.com`,
                    password,
                    confirm_password: password,
                    first_name: name.split(" ")[0] || "User",
                    last_name: name.split(" ").slice(1).join(" ") || "",
                    phone_number: /^\d+$/.test(identifier) ? identifier : "",
                };
                if (portal === "agent") {
                    await registerAgent(payload);
                    onClose();
                    router.push(pathname?.startsWith("/sale") ? "/sale/inventory" : "/agent/dashboard");
                } else {
                    await register(payload);
                    onClose();
                }
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[200] flex items-center justify-center p-4 sm:p-10"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-[1.25rem] w-full max-w-[520px] max-h-[95vh] overflow-y-auto shadow-2xl relative flex flex-col cursor-auto animate-in fade-in zoom-in-95 duration-200"
            >
                {/* ── Portal Switcher ── */}
                <div className="flex items-center gap-2 px-6 pt-5 pb-0">
                    <button
                        onClick={() => { setPortal("customer"); setActiveTab("login"); }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-[700] transition-all border ${
                            portal === "customer"
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <UserIcon className="w-3.5 h-3.5" />
                        Customer
                    </button>
                    <button
                        onClick={() => { setPortal("agent"); setActiveTab("login"); }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-[700] transition-all border ${
                            portal === "agent"
                                ? "bg-[#0C2342] text-white border-[#0C2342]"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <Briefcase className="w-3.5 h-3.5" />
                        Travel Agent
                    </button>
                </div>

                {/* ── Login / Signup Tabs ── */}
                <div className="flex w-full relative z-0 mt-4">
                    <button
                        onClick={() => setActiveTab("login")}
                        className={`flex-1 py-[14px] text-center text-[22px] transition-colors relative font-[700] ${
                            activeTab === "login"
                                ? `border-b-[3px] ${portal === "agent" ? "text-[#0C2342] border-[#0C2342]" : "text-primary border-primary"}`
                                : "text-[#888] border-b-[3px] border-[#e5e7eb]"
                        }`}
                    >
                        Login
                    </button>
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-200" />
                    <button
                        onClick={() => setActiveTab("signup")}
                        className={`flex-1 py-[14px] text-center text-[22px] transition-colors relative font-[700] ${
                            activeTab === "signup"
                                ? `border-b-[3px] ${portal === "agent" ? "text-[#0C2342] border-[#0C2342]" : "text-primary border-primary"}`
                                : "text-[#888] border-b-[3px] border-[#e5e7eb]"
                        }`}
                    >
                        Signup
                    </button>
                </div>

                {/* ── Form Body ── */}
                <div className="px-6 pt-6 pb-6 w-full flex flex-col items-center">
                    {/* Header */}
                    <div className="text-center w-full mb-5">
                        <h2 className="text-[17px] font-[500] text-[#0C2342] tracking-tight flex items-center justify-center gap-1.5 flex-wrap">
                            {portal === "agent" ? (
                                <>
                                    <Briefcase className="w-4 h-4 text-[#0C2342]" />
                                    <span>Travel Agent Portal —</span>
                                    <span className="font-[800] text-[#0C2342] text-[22px]">My Travel Deal</span>
                                </>
                            ) : (
                                <>
                                    Welcome to <span className="font-[800] text-[#121121] text-[22px]">My Travel Deal!</span>
                                </>
                            )}
                        </h2>
                        <p className="text-[14px] sm:text-[16px] font-[600] text-[#888] mt-1 tracking-tight">
                            {activeTab === "login"
                                ? `${portal === "agent" ? "Agent login" : "Please login"} using your email / username`
                                : `${portal === "agent" ? "Register as a new agent" : "Create your account"} to get started`}
                        </p>
                    </div>

                    {/* B2B signup redirect (keep existing behaviour) */}
                    {activeTab === "signup" && isB2bRoute && portal === "customer" ? (
                        <div className="bg-rose-50/30 rounded-[1.25rem] w-full p-6 sm:px-8 pb-7 border border-rose-100/50 flex flex-col items-center gap-4">
                            <p className="text-[15px] font-[600] text-center text-[#121121]">
                                To register as a B2B Travel Agent, please fill out our comprehensive registration form.
                            </p>
                            <Button
                                onClick={() => { onClose(); router.push("/b2b/register"); }}
                                className="w-full rounded-[100px] bg-primary hover:bg-[#D60D26] text-white h-[50px] text-[18px] font-[700] shadow-none"
                            >
                                Go To Registration Form
                            </Button>
                        </div>
                    ) : (
                        <div className={`rounded-[1.25rem] w-full p-6 sm:px-8 pb-7 border ${
                            portal === "agent"
                                ? "bg-slate-50/40 border-slate-200"
                                : "bg-rose-50/30 border-rose-100/50"
                        }`}>
                            <div className="flex flex-col gap-6 w-full">
                                {/* Full Name — signup only */}
                                {activeTab === "signup" && (
                                    <div className="flex flex-col">
                                        <label className="text-[18px] font-[700] text-[#121121] mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Arshad Khan"
                                            className="w-full border-0 border-b border-gray-300 bg-transparent py-1.5 px-0 text-[14px] font-[600] text-[#121121] focus:border-primary focus:outline-none focus:ring-0 placeholder:text-gray-300"
                                        />
                                    </div>
                                )}

                                {/* Email / Username */}
                                <div className="flex flex-col">
                                    <label className="text-[18px] font-[700] text-[#121121] mb-1">
                                        {activeTab === "login" ? "Username / Email" : "Email / Mobile Number"}
                                    </label>
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder={activeTab === "login" ? "your_username or email@example.com" : "email@example.com"}
                                        className="w-full border-0 border-b border-gray-300 bg-transparent py-1.5 px-0 text-[14px] font-[600] text-[#121121] focus:border-primary focus:outline-none focus:ring-0 placeholder:text-gray-300"
                                    />
                                </div>

                                {/* Password */}
                                <div className="flex flex-col">
                                    <label className="text-[18px] font-[700] text-[#121121] mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                        className="w-full border-0 border-b border-gray-300 bg-transparent py-1.5 px-0 text-[14px] font-[600] text-[#121121] focus:border-primary focus:outline-none focus:ring-0"
                                    />
                                </div>

                                {/* Forgot password */}
                                {activeTab === "login" && (
                                    <div className="flex justify-end -mt-2">
                                        <button type="button" className="text-primary text-[14px] font-[600] hover:underline cursor-pointer">
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Agent disclaimer on signup */}
                            {portal === "agent" && activeTab === "signup" && (
                                <p className="text-[12px] text-slate-500 mt-4 leading-relaxed">
                                    By registering, you confirm you are a licensed travel professional. Your account will have agent-level access to manage group travel requests and quotes.
                                </p>
                            )}

                            {/* Submit button */}
                            <div className="mt-7 flex justify-center w-full">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading || !identifier || !password}
                                    className={`w-full sm:w-[90%] rounded-[100px] text-white h-[50px] text-[20px] font-[700] tracking-wide shadow-none transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                                        portal === "agent"
                                            ? "bg-[#0C2342] hover:bg-[#0a1e38]"
                                            : "bg-primary hover:bg-[#D60D26]"
                                    }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            {activeTab === "login" ? "Logging in..." : "Creating account..."}
                                        </span>
                                    ) : (
                                        <>
                                            {activeTab === "login" ? "Login" : "Create Account"}
                                            <ArrowUpRight className="w-[18px] h-[18px] stroke-[2.5px]" />
                                        </>
                                    )}
                                </Button>
                            </div>

                            {errorMessage && (
                                <div className="mt-4 text-center text-[13px] font-[600] text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                                    {errorMessage}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Social logins — customer only */}
                    {portal === "customer" && !isB2bRoute && (
                        <div className="w-full mt-6 mb-2 flex flex-col items-center">
                            <p className="text-[14px] text-slate-500 font-medium mb-4">
                                Or {activeTab === "login" ? "Login" : "Signup"} With
                            </p>
                            <div className="flex items-center gap-4">
                                <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                                </button>
                                <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
                                    <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-6 h-6" />
                                </button>
                                <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
                                    <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
