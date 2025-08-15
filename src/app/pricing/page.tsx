"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function PricingPage() {
    const { user } = useUser();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");

    const handleSubscribe = async () => {
        if (!user) {
            setError("Please sign in to continue");
            return;
        }

        setIsProcessing(true);
        setError("");

        try {
            // Map plan types to product IDs and amounts
            const productMap = {
                post: {
                    productId: "pdt_YuBZGtdCE3Crz89JDgLkf", // $1.99 monthly unlimited
                    amount: 199,
                },
            };

            const selectedProduct = productMap["post"];

            const response = await fetch("/api/payments/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    billing: {
                        name:
                            user.fullName ||
                            `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                        email: user.emailAddresses[0]?.emailAddress || "",
                        phoneNumber: "",
                        city: "",
                        state: "",
                        country: "US",
                        street: "",
                        zipcode: "",
                    },
                    productCart: [
                        {
                            product_id: selectedProduct.productId,
                            quantity: 1,
                        },
                    ],
                }),
            });

            if (response.ok) {
                const { url } = await response.json();
                window.location.href = url;
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Failed to create payment");
            }
        } catch (error) {
            console.error("Error creating payment:", error);
            setError("An error occurred while processing your request");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 py-12">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Unlock unlimited Reddit posting with our premium plans
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
                        {error}
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-neutral-700">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Free
                            </h3>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                $0
                                <span className="text-lg font-normal text-gray-500">
                                    /month
                                </span>
                            </div>
                            <ul className="text-left space-y-3 mb-8">
                                <li className="flex items-center">
                                    <span className="text-green-500 mr-2">
                                        ✓
                                    </span>
                                    5 posts per month
                                </li>
                                <li className="flex items-center">
                                    <span className="text-green-500 mr-2">
                                        ✓
                                    </span>
                                    Basic Reddit integration
                                </li>
                                <li className="flex items-center">
                                    <span className="text-green-500 mr-2">
                                        ✓
                                    </span>
                                    Community support
                                </li>
                            </ul>
                            <button
                                disabled
                                className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                            >
                                Current Plan
                            </button>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 border-2 border-blue-500 relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                                Most Popular
                            </span>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Pro
                            </h3>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                $9.99
                                <span className="text-lg font-normal text-gray-500">
                                    /month
                                </span>
                            </div>
                            <ul className="text-left space-y-3 mb-8">
                                <li className="flex items-center">
                                    <span className="text-green-500 mr-2">
                                        ✓
                                    </span>
                                    Unlimited posts
                                </li>
                                <li className="flex items-center">
                                    <span className="text-green-500 mr-2">
                                        ✓
                                    </span>
                                    Advanced Reddit integration
                                </li>
                                <li className="flex items-center">
                                    <span className="text-green-500 mr-2">
                                        ✓
                                    </span>
                                    Priority support
                                </li>
                                <li className="flex items-center">
                                    <span className="text-green-500 mr-2">
                                        ✓
                                    </span>
                                    Analytics & insights
                                </li>
                            </ul>
                            <button
                                onClick={() => handleSubscribe()}
                                disabled={isProcessing}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                            >
                                {isProcessing
                                    ? "Processing..."
                                    : "Subscribe Now"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-16 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-gray-200 dark:border-neutral-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                How do payments work?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                All purchases are one-time payments. You buy
                                post credits that never expire and can be used
                                whenever you need them.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-gray-200 dark:border-neutral-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                What happens to my posts if I downgrade?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Your existing posts remain active. You'll just
                                be limited to the free tier's posting limits
                                going forward.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-gray-200 dark:border-neutral-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Is my Reddit account information secure?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Absolutely. We use industry-standard encryption
                                and never store your Reddit passwords. All
                                integrations use secure OAuth protocols.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-12">
                    <a
                        href="/"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
