import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DynamicClientComponent from "./DynamicClientComponent"; // client logic here
import ClerkWrapper from "@/components/ClerkWrapper";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Unbannnable",
    description: "AI-powered Reddit post optimization and safety assistant",
    icons: {
        icon: "/icon.png",
        shortcut: "/icon.png",
        apple: "/icon.png",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkWrapper>
            <html lang="en" className={`${geistSans.variable}`}>
                <body>
                    <DynamicClientComponent />
                    {children}
                </body>
            </html>
        </ClerkWrapper>
    );
}
