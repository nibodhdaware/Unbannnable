import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import DynamicClientComponent from "./DynamicClientComponent"; // client logic here
import ClerkWrapper from "@/components/ClerkWrapper";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
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
            <html
                lang="en"
                className={`${inter.variable} ${jetbrainsMono.variable}`}
            >
                <body>
                    <Script
                        async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3616361244136854"
                        crossOrigin="anonymous"
                        strategy="afterInteractive"
                    />
                    <DynamicClientComponent />
                    {children}
                </body>
            </html>
        </ClerkWrapper>
    );
}
