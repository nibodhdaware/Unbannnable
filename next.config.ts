import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    env: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
    experimental: {
        serverComponentsExternalPackages: ["@clerk/nextjs"],
    },
    images: {
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.producthunt.com",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://us-assets.i.posthog.com https://us.i.posthog.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com",
                            "connect-src 'self' https://us.i.posthog.com https://*.clerk.accounts.dev https://api.convex.cloud wss://*.convex.cloud https://old.reddit.com https://www.reddit.com https://generativelanguage.googleapis.com https://www.google-analytics.com",
                            "img-src 'self' data: https: blob: https://www.google-analytics.com https://api.producthunt.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' data: https://fonts.gstatic.com",
                            "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
                            "worker-src 'self' blob:",
                        ].join("; "),
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
