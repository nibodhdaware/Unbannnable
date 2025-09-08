"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/lib/convex";
import { PostHogProvider } from "@/lib/posthog";
import { ReactNode } from "react";

interface ClerkWrapperProps {
    children: ReactNode;
}

export default function ClerkWrapper({ children }: ClerkWrapperProps) {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!publishableKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable",
        );
    }

    return (
        <ClerkProvider publishableKey={publishableKey}>
            <ConvexClientProvider>
                <PostHogProvider>{children}</PostHogProvider>
            </ConvexClientProvider>
        </ClerkProvider>
    );
}
