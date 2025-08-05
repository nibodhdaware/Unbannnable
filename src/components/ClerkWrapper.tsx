"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/lib/convex";
import { ReactNode } from "react";

interface ClerkWrapperProps {
    children: ReactNode;
}

export default function ClerkWrapper({ children }: ClerkWrapperProps) {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!publishableKey) {
        console.warn(
            "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY - Clerk features will be disabled",
        );
        return <ConvexClientProvider>{children}</ConvexClientProvider>;
    }

    return (
        <ClerkProvider publishableKey={publishableKey}>
            <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
    );
}
