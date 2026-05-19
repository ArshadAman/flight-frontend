import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Travel Deal | Journeys Simple, Safe, And Affordable",
  description: "Book flights and group travel with zero convenience fees. Discover your next dream destination with My Travel Deal.",

};
import { AuthProvider } from "@/context/AuthContext";
import { GroupTravelProvider } from "@/context/GroupTravelContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden w-full`}
      >
        <AuthProvider>
          <GroupTravelProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black">
              Skip to content
            </a>
            {children}
          </GroupTravelProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
