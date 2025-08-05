import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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
                    <DynamicClientComponent />
                    {children}
                </body>
            </html>
        </ClerkWrapper>
    );
}
