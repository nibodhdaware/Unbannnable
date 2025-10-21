"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface PricingCardProps {
    title: string;
    price: string;
    credits: string;
    features: string[];
    loading?: boolean;
    onGetStarted?: () => void;
}

function PricingCard({
    title,
    price,
    credits,
    features,
    loading = false,
    onGetStarted,
}: PricingCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="relative overflow-hidden border-2 border-[#FF4500]/20 bg-gradient-to-br from-[#FF4500] to-[#e03d00] text-white">
                <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl text-white mb-2">
                        {title}
                    </CardTitle>
                    <div className="mb-4">
                        <span className="text-5xl font-bold text-white">
                            {price}
                        </span>
                    </div>
                    <Badge className="mx-auto bg-white/20 hover:bg-white/30 text-white border-white/30">
                        {credits}
                    </Badge>
                </CardHeader>

                <CardContent className="space-y-6">
                    <ul className="space-y-4">
                        {features.map((feature, index) => (
                            <li
                                key={index}
                                className="flex items-start space-x-3"
                            >
                                <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                                <span className="text-white">
                                    {feature === "Priority support" ? (
                                        <a
                                            href="https://x.com/nibodhdaware"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline text-white hover:text-white/90"
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

                    <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                        <p className="text-sm text-white text-center">
                            💡 <strong>Refer a friend</strong> and get{" "}
                            <strong>10 free credits</strong> when they sign up!
                        </p>
                    </div>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button
                                disabled={loading}
                                size="lg"
                                className="w-full bg-white text-[#FF4500] hover:bg-neutral-100 font-semibold"
                            >
                                {loading ? "Processing..." : "Get Started"}
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Button
                            onClick={onGetStarted}
                            disabled={loading}
                            size="lg"
                            className="w-full bg-white text-[#FF4500] hover:bg-neutral-100 font-semibold"
                        >
                            {loading ? "Processing..." : "Get Started"}
                        </Button>
                    </SignedIn>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function PricingSection() {
    const { user } = useUser();
    const [paymentLoading, setPaymentLoading] = useState(false);

    const handleGetStarted = async () => {
        if (!user) {
            return;
        }

        setPaymentLoading(true);
        try {
            const response = await fetch("/api/create-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    billing: {
                        street: "Default Address",
                        city: "Mumbai",
                        state: "Maharashtra",
                        zipcode: "400001",
                        country: "IN",
                    },
                    customer: {
                        name: user.fullName || user.firstName || "User",
                        email: user.emailAddresses[0]?.emailAddress || "",
                    },
                }),
            });

            if (!response.ok) {
                throw new Error("Payment creation failed");
            }

            const { paymentLink } = await response.json();
            window.location.href = paymentLink;
        } catch (error) {
            console.error("Payment error:", error);
            alert("Failed to create payment. Please try again.");
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
                            onGetStarted={handleGetStarted}
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
        </section>
    );
}
