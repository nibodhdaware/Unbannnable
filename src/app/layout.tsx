import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import DynamicClientComponent from "./DynamicClientComponent"; // client logic here
import ClerkWrapper from "@/components/ClerkWrapper";
import ReferralHandler from "@/components/ReferralHandler";
import CookieConsent from "@/components/CookieConsent";
import EmailSubscriptionPopup from "@/components/EmailSubscriptionPopup";
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
    title: "Unbannnable: AI Reddit Post Optimizer | Stop Bans in Seconds",
    description:
        "Stop getting banned on Reddit. Unbannnable uses AI to check subreddit rules, fix ban triggers, and optimize your posts for maximum engagement. Never get shadowbanned or removed again—the ultimate Reddit post checker and optimizer.",
    keywords: [
        "reddit post checker",
        "avoid reddit ban",
        "reddit rule compliance tool",
        "fix reddit post for bans",
        "AI reddit optimizer",
        "reddit shadowban test",
        "how to post on reddit without getting banned",
        "reddit posting guide",
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
        canonical: "https://unbannnable.com",
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
                    <link rel="preconnect" href="https://www.googletagmanager.com" />
                    <link rel="preconnect" href="https://www.google-analytics.com" />
                    <link rel="preconnect" href="https://clerk.unbannnable.com" />
                    <link rel="preconnect" href="https://img.clerk.com" />
                    <link rel="preconnect" href="https://api.producthunt.com" />
                    {/* Google Analytics */}
                    <Script
                        strategy="afterInteractive"
                        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || "G-6Z1BS78WMS"}`}
                    />
                    <Script
                        id="google-analytics"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || "G-6Z1BS78WMS"}', {
                                    page_path: window.location.pathname,
                                });
                            `,
                        }}
                    />
                    {/* Datafast Analytics */}
                    <Script
                        defer
                        data-website-id="dfid_yWPu6WidqnIKdvlrFj9kq"
                        data-domain="unbannnable.com"
                        data-allow-localhost="true"
                        src="https://datafa.st/js/script.js"
                    />
                    {/* Prevent FOUC by setting theme before page renders */}
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function() {
                                    try {
                                        var theme = localStorage.getItem('unbannnable-ui-theme') || 'system';
                                        var root = document.documentElement;
                                        
                                        root.classList.remove('light', 'dark');
                                        
                                        if (theme === 'system') {
                                            var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                                            root.classList.add(systemTheme);
                                        } else {
                                            root.classList.add(theme);
                                        }
                                    } catch (e) {}
                                })();
                            `,
                        }}
                    />
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
                    <Suspense fallback={null}>
                        <ReferralHandler />
                    </Suspense>
                    <DynamicClientComponent />
                    {children}
                    <CookieConsent />
                    <EmailSubscriptionPopup />
                    <Analytics />
                </body>
            </html>
        </ClerkWrapper>
    );
}
