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
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_APP_URL || "https://unbannnable.com",
    ),
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
                url: "/og-image.png",
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
        images: ["/og-image.png"],
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
                <head>
                    {/* Manual Open Graph tags for better crawler compatibility */}
                    <meta
                        property="og:title"
                        content="Unbannnable - AI-Powered Reddit Post Optimization"
                    />
                    <meta
                        property="og:description"
                        content="Never get banned from Reddit again. AI-powered tool that analyzes your posts, checks subreddit rules, suggests improvements, and finds the best subreddits for your content."
                    />
                    <meta
                        property="og:image"
                        content={`${process.env.NEXT_PUBLIC_APP_URL || "https://unbannnable.com"}/og-image.png`}
                    />
                    <meta property="og:image:width" content="1200" />
                    <meta property="og:image:height" content="630" />
                    <meta
                        property="og:image:alt"
                        content="Unbannnable - AI-Powered Reddit Post Optimization Tool"
                    />
                    <meta
                        property="og:url"
                        content={
                            process.env.NEXT_PUBLIC_APP_URL ||
                            "https://unbannnable.com"
                        }
                    />
                    <meta property="og:site_name" content="Unbannnable" />
                    <meta property="og:type" content="website" />
                    <meta property="og:locale" content="en_US" />

                    {/* Twitter Card tags */}
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta
                        name="twitter:title"
                        content="Unbannnable - AI-Powered Reddit Post Optimization"
                    />
                    <meta
                        name="twitter:description"
                        content="Never get banned from Reddit again. AI-powered tool that analyzes your posts, checks subreddit rules, suggests improvements, and finds the best subreddits for your content."
                    />
                    <meta
                        name="twitter:image"
                        content={`${process.env.NEXT_PUBLIC_APP_URL || "https://unbannnable.com"}/og-image.png`}
                    />
                    <meta name="twitter:creator" content="@unbannnable" />
                    <meta name="twitter:site" content="@unbannnable" />

                    {/* Additional SEO meta tags */}
                    <meta
                        name="description"
                        content="Never get banned from Reddit again. AI-powered tool that analyzes your posts, checks subreddit rules, suggests improvements, and finds the best subreddits for your content."
                    />
                    <meta
                        name="keywords"
                        content="Reddit, AI, post optimization, subreddit rules, Reddit safety, content analysis, social media"
                    />
                    <meta name="author" content="Unbannnable" />
                    <meta name="robots" content="index, follow" />
                </head>
                <body>
                    <Script
                        async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4994844479889320"
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
