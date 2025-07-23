import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DynamicClientComponent from "./DynamicClientComponent"; // client logic here

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Reddit Unbanr",
    description: "AI-powered Reddit post assistant",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${geistSans.variable}`}>
            <body>
                <DynamicClientComponent />
                {children}
            </body>
        </html>
    );
}
