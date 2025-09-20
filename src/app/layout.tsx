import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import DynamicClientComponent from "./DynamicClientComponent"; // client logic here
import ClerkWrapper from "@/components/ClerkWrapper";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Unbannnable - AI-Powered Reddit Post Optimization",
    description:
        "Never get banned from Reddit again. AI-powered tool that analyzes your posts, checks subreddit rules, suggests improvements, and finds the best subreddits for your content.",
    keywords: [
        "Reddit",
        "AI",
        "post optimization",
        "subreddit rules",
        "Reddit safety",
        "content analysis",
        "social media",
    ],
    authors: [{ name: "Unbannnable" }],
    creator: "Unbannnable",
    publisher: "Unbannnable",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL("https://unbannnable.com"),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "Unbannnable - AI-Powered Reddit Post Optimization",
        description:
            "Never get banned from Reddit again. AI-powered tool that analyzes your posts, checks subreddit rules, suggests improvements, and finds the best subreddits for your content.",
        url: "https://unbannnable.com",
        siteName: "Unbannnable",
        images: [
            {
                url: "/icon.png",
                width: 1200,
                height: 630,
                alt: "Unbannnable - AI-Powered Reddit Post Optimization Tool",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Unbannnable - AI-Powered Reddit Post Optimization",
        description:
            "Never get banned from Reddit again. AI-powered tool that analyzes your posts, checks subreddit rules, suggests improvements, and finds the best subreddits for your content.",
        images: ["/icon.png"],
        creator: "@unbannnable",
        site: "@unbannnable",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
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
                    <Analytics />
                </body>
            </html>
        </ClerkWrapper>
    );
}
