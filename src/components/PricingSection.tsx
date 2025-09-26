"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import BillingAddressForm from "./BillingAddressForm";

interface PricingCardProps {
    title: string;
    price: string;
    credits: string;
    features: string[];
    isPopular?: boolean;
    onPurchase: () => void;
    loading?: boolean;
}

function PricingCard({
    title,
    price,
    credits,
    features,
    isPopular = false,
    onPurchase,
    loading = false,
}: PricingCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className={`relative rounded-2xl p-8 ${
                isPopular
                    ? "bg-gradient-to-br from-[#FF4500] to-[#e03d00] text-white"
                    : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
            }`}
        >
            {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white text-[#FF4500] px-4 py-2 rounded-full text-sm font-bold">
                        Most Popular
                    </div>
                </div>
            )}

            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <div className="mb-4">
                    <span className="text-4xl font-bold">{price}</span>
                </div>
                <div
                    className={`text-lg font-semibold ${
                        isPopular ? "text-white" : "text-[#FF4500]"
                    }`}
                >
                    {credits}
                </div>
            </div>

            <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                        <span
                            className={`text-lg ${
                                isPopular ? "text-white" : "text-green-500"
                            }`}
                        >
                            ✓
                        </span>
                        <span
                            className={
                                isPopular
                                    ? "text-white"
                                    : "text-neutral-700 dark:text-neutral-300"
                            }
                        >
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>

            <button
                onClick={onPurchase}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    isPopular
                        ? "bg-white text-[#FF4500] hover:bg-neutral-100"
                        : "bg-[#FF4500] text-white hover:bg-[#e03d00]"
                } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
            >
                {loading ? "Processing..." : "Get Started"}
            </button>
        </motion.div>
    );
}

export default function PricingSection() {
    const { isSignedIn } = useUser();
    const [loading, setLoading] = useState(false);
    const [showBillingForm, setShowBillingForm] = useState(false);

    const handlePurchaseClick = () => {
        if (!isSignedIn) {
            return;
        }
        setShowBillingForm(true);
    };

    const handleBillingSubmit = async (billing: any, customer: any) => {
        setLoading(true);
        try {
            // Create payment with billing address
            const response = await fetch("/api/create-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    billing,
                    customer,
                }),
            });

            if (response.ok) {
                const { paymentLink } = await response.json();
                window.location.href = paymentLink;
            } else {
                const errorData = await response.json();
                console.error("Failed to create payment:", errorData);
                alert("Failed to create payment. Please try again.");
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleBillingCancel = () => {
        setShowBillingForm(false);
        setLoading(false);
    };

    return (
        <section className="py-20 px-4 sm:px-6 bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                        Simple,{" "}
                        <span className="text-[#FF4500]">Affordable</span>{" "}
                        Pricing
                    </h2>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                        Get AI-powered Reddit post optimization for just $9.
                        Perfect for content creators, marketers, and businesses.
                    </p>
                </motion.div>

                <div className="max-w-lg mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <PricingCard
                            title="Credit Pack"
                            price="$9"
                            credits="100 AI Credits"
                            isPopular={true}
                            loading={loading}
                            onPurchase={
                                isSignedIn ? handlePurchaseClick : () => {}
                            }
                            features={[
                                "100 AI Post Analysis credits",
                                "Advanced anomaly detection",
                                "Smart flair suggestions",
                                "Rule compliance checking",
                                "Alternative subreddit finder",
                                "Priority support",
                                "Credits never expire",
                            ]}
                        />
                    </motion.div>
                </div>

                {!isSignedIn && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-center mt-12"
                    >
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                            Sign in to purchase credits and start optimizing
                            your Reddit posts
                        </p>
                        <SignInButton mode="modal">
                            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-[#FF4500] text-white rounded-lg font-medium hover:bg-[#e03d00] transition-colors">
                                <span className="text-lg">⚡</span>
                                <span>Sign In to Get Started</span>
                            </button>
                        </SignInButton>
                    </motion.div>
                )}
            </div>

            {/* Billing Address Form Modal */}
            {showBillingForm && (
                <BillingAddressForm
                    onSubmit={handleBillingSubmit}
                    onCancel={handleBillingCancel}
                    loading={loading}
                />
            )}
        </section>
    );
}
