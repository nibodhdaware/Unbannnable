"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import BillingAddressForm from "./BillingAddressForm";

interface PricingCardProps {
    title: string;
    price: string;
    credits: string;
    features: string[];
    loading?: boolean;
}

function PricingCard({
    title,
    price,
    credits,
    features,
    loading = false,
}: PricingCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-2xl p-8 bg-gradient-to-br from-[#FF4500] to-[#e03d00] text-white"
        >
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <div className="mb-4">
                    <span className="text-4xl font-bold">{price}</span>
                </div>
                <div className="text-lg font-semibold text-white">
                    {credits}
                </div>
            </div>

            <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                        <span className="text-lg text-white">✓</span>
                        <span className="text-white">
                            {feature === "Priority support" ? (
                                <a
                                    href="https://x.com/nibodhdaware"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-white"
                                >
                                    Priority support (chat with founder)
                                </a>
                            ) : (
                                feature
                            )}
                        </span>
                    </li>
                ))}
            </ul>

            <div className="mb-6 p-3 bg-white/10 rounded-lg border border-white/20">
                <p className="text-sm text-white text-center">
                    💡 <strong>Refer a friend</strong> and get{" "}
                    <strong>10 free credits</strong> when they sign up!
                </p>
            </div>

            <SignedOut>
                <SignInButton mode="modal">
                    <button
                        disabled={loading}
                        className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 bg-white text-[#FF4500] hover:bg-neutral-100 ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                    >
                        {loading ? "Processing..." : "Get Started"}
                    </button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
                <button
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 bg-white text-[#FF4500] hover:bg-neutral-100 ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                >
                    {loading ? "Processing..." : "Get Started"}
                </button>
            </SignedIn>
        </motion.div>
    );
}

export default function PricingSection() {
    const [showBillingModal, setShowBillingModal] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const handleBillingSubmit = async (
        billing: any,
        customer: { name: string; email: string },
    ) => {
        setPaymentLoading(true);
        try {
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

            if (!response.ok) {
                throw new Error("Payment creation failed");
            }

            const { paymentLink } = await response.json();
            window.location.href = paymentLink;
        } catch (error) {
            console.error("Payment error:", error);
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <section id="pricing" className="py-20 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-6">
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
                            loading={paymentLoading}
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
            </div>

            {/* Billing Address Form Modal */}
            {showBillingModal && (
                <BillingAddressForm
                    onSubmit={handleBillingSubmit}
                    onCancel={() => setShowBillingModal(false)}
                    loading={paymentLoading}
                />
            )}
        </section>
    );
}
