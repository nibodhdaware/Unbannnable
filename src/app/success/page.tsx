"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const subscriptionId = searchParams.get("subscription_id");
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (subscriptionId) {
            // You can add verification logic here if needed
            setIsVerified(true);
        }
        setLoading(false);
    }, [subscriptionId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4500] mx-auto mb-4"></div>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Verifying your subscription...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
            <div className="max-w-md mx-auto text-center p-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                    Subscription Activated!
                </h1>

                <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                    Welcome to Unbannnable Premium! You now have access to
                    unlimited AI optimizations and premium features.
                </p>

                {subscriptionId && (
                    <p className="text-xs text-neutral-500 mb-6">
                        Subscription ID: {subscriptionId}
                    </p>
                )}

                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-[#FF4500] text-white rounded-lg hover:bg-[#e03d00] transition-colors font-medium"
                >
                    Start Creating Posts
                </Link>
            </div>
        </div>
    );
}
