"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function PricingPage() {
    const { user } = useUser();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const plans = [
        {
            id: "tenPosts",
            name: "Starter",
            price: "$1",
            posts: 10,
            productId: "pdt_YuBZGtdCE3Crz89JDgLkf", // $1.00 for 10 posts
            amount: 100, // $1.00 in cents
            description: "Perfect for getting started",
            features: [
                "10 posts",
                "Never expire",
                "Basic Reddit integration",
                "Community support",
            ],
        },
        {
            id: "hundredPosts",
            name: "Popular",
            price: "$5",
            posts: 100,
            productId: "pdt_c5oTeIMDSCUcUc2vLCcTe", // $5.00 for 100 posts
            amount: 500, // $5.00 in cents
            description: "Most popular choice",
            features: [
                "100 posts",
                "Never expire",
                "Advanced Reddit integration",
                "Priority support",
                "Analytics & insights",
            ],
        },
        {
            id: "fiveHundredPosts",
            name: "Pro",
            price: "$15",
            posts: 500,
            productId: "pdt_7zSMnSK9jUYRZ5mfqkfAq", // $15.00 for 500 posts
            amount: 1500, // $15.00 in cents
            description: "For power users",
            features: [
                "500 posts",
                "Never expire",
                "Advanced Reddit integration",
                "Priority support",
                "Analytics & insights",
                "Bulk posting tools",
            ],
        },
    ];

    const handleSubscribe = async (planId: string) => {
        if (!user) {
            setError("Please sign in to continue");
            return;
        }

        const plan = plans.find((p) => p.id === planId);
        if (!plan) {
            setError("Invalid plan selected");
            return;
        }

        setIsProcessing(true);
        setError("");

        try {
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
                            productId: plan.productId,
                            quantity: 1,
                            amount: plan.amount,
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
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Buy post credits that never expire and use them whenever
                        you need
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
                        {error}
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.id}
                            className={`bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 border-2 relative ${
                                plan.id === "hundredPosts"
                                    ? "border-blue-500"
                                    : "border-gray-200 dark:border-neutral-700"
                            }`}
                        >
                            {plan.id === "hundredPosts" && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {plan.name}
                                </h3>
                                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    {plan.price}
                                </div>
                                <div className="text-lg text-gray-500 mb-4">
                                    {plan.posts} posts
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                    {plan.description}
                                </p>
                                <ul className="text-left space-y-3 mb-8">
                                    {plan.features.map(
                                        (feature, featureIndex) => (
                                            <li
                                                key={featureIndex}
                                                className="flex items-center"
                                            >
                                                <span className="text-green-500 mr-2">
                                                    ✓
                                                </span>
                                                {feature}
                                            </li>
                                        ),
                                    )}
                                </ul>
                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={isProcessing}
                                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                        plan.id === "hundredPosts"
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "bg-gray-600 text-white hover:bg-gray-700"
                                    }`}
                                >
                                    {isProcessing ? "Processing..." : "Buy Now"}
                                </button>
                            </div>
                        </div>
                    ))}
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
                                Do the posts expire?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                No! Your purchased posts never expire. You can
                                use them today, next month, or next year -
                                they're yours forever.
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
