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
    title: "Unbannnable - AI-Powered Reddit Post Optimization Tool",
    description:
        "AI-powered Reddit post optimization tool that analyzes posts, checks subreddit rules, suggests improvements, and finds the best communities for your content. Never get banned again.",
    keywords: [
        "Reddit",
        "AI",
        "post optimization",
        "subreddit rules",
        "Reddit safety",
        "content analysis",
        "social media optimization",
        "Reddit tool",
        "subreddit finder",
        "content moderation",
    ],
    authors: [{ name: "Unbannnable Team" }],
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
        title: "Unbannnable - AI-Powered Reddit Post Optimization Tool",
        description:
            "AI-powered Reddit post optimization tool that analyzes posts, checks subreddit rules, suggests improvements, and finds the best communities for your content. Never get banned again.",
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
        title: "Unbannnable - AI-Powered Reddit Post Optimization Tool",
        description:
            "AI-powered Reddit post optimization tool that analyzes posts, checks subreddit rules, suggests improvements, and finds the best communities for your content.",
        images: ["/og-image.png"],
        creator: "@nibodhdaware",
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
                    {/* Schema.org structured data for better SEO */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "WebApplication",
                                name: "Unbannnable",
                                description:
                                    "AI-powered Reddit post optimization tool that analyzes posts, checks subreddit rules, suggests improvements, and finds the best communities for your content.",
                                url: "https://unbannnable.com",
                                applicationCategory: "BusinessApplication",
                                operatingSystem: "Web Browser",
                                offers: {
                                    "@type": "Offer",
                                    price: "9.00",
                                    priceCurrency: "USD",
                                },
                                creator: {
                                    "@type": "Person",
                                    name: "Nibodh Daware",
                                },
                            }),
                        }}
                    />
                </head>
                <body>
                    <DynamicClientComponent />
                    {children}
                    <Analytics />
                </body>
            </html>
        </ClerkWrapper>
    );
}
