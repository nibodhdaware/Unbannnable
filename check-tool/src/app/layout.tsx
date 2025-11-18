import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Will I Get Banned on Reddit? - Free Ban Risk Checker",
    description:
        "Check if your Reddit post will get banned or removed. Instant AI analysis of your post against subreddit rules. Free tool by Unbannnable.",
    keywords:
        "reddit ban checker, reddit post analyzer, will i get banned reddit, reddit rules checker",
    icons: {
        icon: "/favicon.ico",
        apple: "/favicon.ico",
    },
    openGraph: {
        title: "Will I Get Banned on Reddit?",
        description: "Free tool to check if your Reddit post will get banned",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Will I Get Banned on Reddit?",
        description: "Check your ban risk instantly - Free tool",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
