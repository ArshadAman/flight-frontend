import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";

export default function B2BMyAccountPage() {
    return (
        <div className="w-full min-h-screen bg-slate-50 flex flex-col">
            <B2BNavbar />

            {/* Top Header Banner */}
            <div className="w-full bg-primary py-12">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-[600] text-white tracking-tight">
                        My Account / Wallet Dashboard (B2B)
                    </h1>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="container mx-auto px-6 lg:px-12 py-16 flex-1">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Agent Dashboard Overview</h2>
                    <p className="text-slate-600 text-lg">
                        Welcome to your B2B agent account dashboard. Here you can manage your agent details, view your wallet balance, and update preferences.
                    </p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 border border-slate-100 rounded-xl bg-slate-50">
                            <h3 className="font-bold text-slate-700 mb-2">Agent Wallet Balance</h3>
                            <p className="text-3xl font-extrabold text-primary">₹ 1,24,500</p>
                        </div>
                        <div className="p-6 border border-slate-100 rounded-xl bg-slate-50">
                            <h3 className="font-bold text-slate-700 mb-2">Saved Customers</h3>
                            <p className="text-3xl font-extrabold text-primary">0</p>
                        </div>
                        <div className="p-6 border border-slate-100 rounded-xl bg-slate-50">
                            <h3 className="font-bold text-slate-700 mb-2">Active Bookings</h3>
                            <p className="text-3xl font-extrabold text-primary">0</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
