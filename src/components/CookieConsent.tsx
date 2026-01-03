"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            // Small delay to avoid layout shift on page load
            const timer = setTimeout(() => setShowBanner(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem("cookie-consent", "all");
        localStorage.setItem("cookie-consent-date", new Date().toISOString());
        setShowBanner(false);
        // Enable analytics if needed
        if (typeof window !== "undefined" && (window as any).posthog) {
            (window as any).posthog.opt_in_capturing();
        }
    };

    const acceptEssential = () => {
        localStorage.setItem("cookie-consent", "essential");
        localStorage.setItem("cookie-consent-date", new Date().toISOString());
        setShowBanner(false);
        // Disable analytics
        if (typeof window !== "undefined" && (window as any).posthog) {
            (window as any).posthog.opt_out_capturing();
        }
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-lg p-4">
                {/* Close button */}
                <button
                    onClick={acceptEssential}
                    className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Cookie icon and title */}
                <div className="flex items-center gap-2 mb-2 pr-6">
                    <span className="text-xl">🍪</span>
                    <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">
                        Cookie Settings
                    </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                    We use cookies to improve your experience and analyze site
                    usage.{" "}
                    <a
                        href="/privacy"
                        className="text-[#FF4500] hover:underline"
                    >
                        Learn more
                    </a>
                </p>

                {/* Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={acceptEssential}
                        className="flex-1 text-xs h-8 border-neutral-300 dark:border-neutral-700"
                    >
                        Essential Only
                    </Button>
                    <Button
                        size="sm"
                        onClick={acceptAll}
                        className="flex-1 text-xs h-8 bg-[#FF4500] hover:bg-[#e03d00] text-white"
                    >
                        Accept All
                    </Button>
                </div>
            </div>
        </div>
    );
}
