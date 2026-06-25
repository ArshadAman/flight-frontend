import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function AgentManagementPage() {
    return (
        <div className="w-full min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Top Header Banner */}
            <div className="w-full bg-primary py-12">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-[600] text-white tracking-tight">
                        Agent & Sub-Agent Management Portal
                    </h1>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="container mx-auto px-6 lg:px-12 py-16 flex-1">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">B2B Portal Access</h2>
                    <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
                        This section is restricted to authorized agents and sub-agents. Manage your network, view commissions, and access exclusive B2B inventory here.
                    </p>
                    <button className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95">
                        Request Agent Access
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}
