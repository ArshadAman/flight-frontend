"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#F2FBFF] flex flex-col items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm text-center max-w-md w-full">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-8 h-8 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">
                    Something went wrong
                </h2>
                <p className="text-slate-500 mb-8 px-4">
                    We experienced an issue while preparing your page. Please try again.
                </p>
                <Button
                    onClick={() => {
                        reset();
                        window.location.reload();
                    }}
                    className="w-full bg-primary hover:bg-[#D60D26] text-white font-bold py-6 rounded-xl transition-all active:scale-95"
                >
                    Try Again
                </Button>
            </div>
        </div>
    );
}

