"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
    name: string;
    email: string;
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthModalOpen: boolean;
    login: (userData: User, accessToken?: string, refreshToken?: string) => void;
    logout: () => void;
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Sync state with localStorage on mount
    useEffect(() => {
        setIsMounted(true);
        try {
            const cachedSession = localStorage.getItem("user_session");
            const cachedToken = localStorage.getItem("access_token") || localStorage.getItem("mock-access-token");
            if (cachedSession && cachedToken) {
                setUser(JSON.parse(cachedSession));
                console.log("[AuthContext] Successfully restored persisted user session:", JSON.parse(cachedSession));
            }
        } catch (err) {
            console.error("[AuthContext] Failed to parse cached session:", err);
        }
    }, []);

    const login = (userData: User, accessToken?: string, refreshToken?: string) => {
        setUser(userData);
        try {
            localStorage.setItem("user_session", JSON.stringify(userData));
            if (accessToken) {
                localStorage.setItem("access_token", accessToken);
            }
            if (refreshToken) {
                localStorage.setItem("refresh_token", refreshToken);
            }
            if (!accessToken) {
                localStorage.setItem("mock-access-token", `mock-token-${Date.now()}`);
                // Also synchronize access_token if backend mock is active
                localStorage.setItem("access_token", `mock-token-${Date.now()}`);
            }
            console.log("[AuthContext] Successfully persisted user session:", userData);
        } catch (err) {
            console.error("[AuthContext] Failed to cache user session:", err);
        }
    };

    const logout = () => {
        setUser(null);
        try {
            localStorage.removeItem("user_session");
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("mock-access-token");
            console.log("[AuthContext] Successfully cleared persisted session on logout.");
        } catch (err) {
            console.error("[AuthContext] Failed to clear cached session:", err);
        }
    };

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    return (
        <AuthContext.Provider value={{ 
            user: isMounted ? user : null, 
            isAuthModalOpen, 
            login, 
            logout, 
            openAuthModal, 
            closeAuthModal 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};