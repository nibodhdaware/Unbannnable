"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/posthog";

export default function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastTrackedPathRef = useRef<string>("");

    useEffect(() => {
        if (!pathname) {
            return;
        }

        const search = searchParams?.toString() || "";
        const currentPath = search ? `${pathname}?${search}` : pathname;

        // Avoid duplicate captures for the same route during re-renders.
        if (lastTrackedPathRef.current === currentPath) {
            return;
        }

        lastTrackedPathRef.current = currentPath;

        trackPageView(currentPath, {
            pathname,
            search,
            referrer:
                typeof document !== "undefined"
                    ? document.referrer
                    : undefined,
            title:
                typeof document !== "undefined" ? document.title : undefined,
        });
    }, [pathname, searchParams]);

    return null;
}
