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
    period: string;
    features: string[];
    loading?: boolean;
    onGetStarted?: () => void;
    popular?: boolean;
    productId: string;
}

function PricingCard({
    title,
    price,
    credits,
    period,
    features,
    loading = false,
    onGetStarted,
    popular = false,
    productId,
}: PricingCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative"
        >
            {popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-white text-[#FF4500] hover:bg-white px-4 py-2 font-bold border-2 border-[#FF4500] shadow-lg">
                        ⭐ Best Seller
                    </Badge>
                </div>
            )}
            <Card
                className={`relative overflow-hidden border-2 ${popular ? "border-[#FF4500] shadow-2xl shadow-[#FF4500]/50" : "border-[#FF4500]/20"} bg-gradient-to-br from-[#FF4500] to-[#e03d00] text-white mt-4`}
            >
                <CardHeader className="text-center pb-6 sm:pb-8 pt-6 sm:pt-8 px-4 sm:px-6">
                    <CardTitle className="text-xl sm:text-2xl text-white mb-2">
                        {title}
                    </CardTitle>
                    <div className="mb-2">
                        <span className="text-4xl sm:text-5xl font-bold text-white">
                            {price}
                        </span>
                    </div>
                    <p className="text-white/90 text-xs sm:text-sm mb-3">
                        {period}
                    </p>
                    <Badge className="mx-auto bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm sm:text-base py-1">
                        {credits}
                    </Badge>
                </CardHeader>

                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
                    <ul className="space-y-2 sm:space-y-3">
                        {features.map((feature, index) => (
                            <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-center space-x-2 sm:space-x-3 group"
                            >
                                <div className="bg-white/20 rounded-full p-1 group-hover:bg-white/30 transition-colors flex-shrink-0">
                                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                </div>
                                <span className="text-white/90 text-xs sm:text-sm group-hover:text-white transition-colors">
                                    {feature === "Priority support" ? (
                                        <a
                                            href="https://x.com/nibodhdaware"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline hover:text-white"
                                        >
                                            Priority support (chat with founder)
                                        </a>
                                    ) : (
                                        feature
                                    )}
                                </span>
                            </motion.li>
                        ))}
                    </ul>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-2 sm:p-3 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm"
                    >
                        <p className="text-[10px] sm:text-xs text-white/90 text-center">
                            💡 <strong>Refer a friend</strong> →{" "}
                            <strong>10 free credits</strong>
                        </p>
                    </motion.div>

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
    const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

    const handleGetStarted = async (
        planType: string,
        productId: string,
        credits: number,
        amount: number,
    ) => {
        if (!user) {
            return;
        }

        setPaymentLoading(planType);
        try {
            const response = await fetch("/api/create-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    planType,
                    productId,
                    credits,
                    amount,
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
            setPaymentLoading(null);
        }
    };

    // LTD Plan configurations - UPDATE PRODUCT IDs HERE
    const plans = [
        {
            id: "starter",
            title: "Starter Lifetime",
            price: "$19",
            period: "One-time payment",
            credits: "20 credits/month",
            productId:
                process.env.NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID ||
                "YOUR_STARTER_PRODUCT_ID",
            monthlyCredits: 20,
            amount: 19,
            popular: false,
            features: [
                "20 AI credits every month",
                "Good for 2-10 posts monthly",
                "Rule compliance checking",
                "Basic anomaly detection",
                "Flair suggestions",
                "Credits roll over if unused",
                "Lifetime access",
            ],
        },
        {
            id: "standard",
            title: "Standard Lifetime",
            price: "$39",
            period: "One-time payment",
            credits: "100 credits/month",
            productId:
                process.env.NEXT_PUBLIC_DODO_STANDARD_PRODUCT_ID ||
                "YOUR_STANDARD_PRODUCT_ID",
            monthlyCredits: 100,
            amount: 39,
            popular: true,
            features: [
                "100 AI credits every month",
                "Perfect for 10-50 posts monthly",
                "All Starter features",
                "Advanced anomaly detection",
                "Smart flair suggestions",
                "Alternative subreddit finder",
                "Priority support",
                "Lifetime access",
            ],
        },
    ];

    return (
        <section id="pricing" className="py-20 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <Badge className="mb-4 bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500]/20 border-[#FF4500]/30 text-sm px-4 py-1">
                        🎉 Lifetime Deal - Pay Once, Use Forever
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-6">
                        <span className="text-[#FF4500]">Lifetime</span> Access
                        Pricing
                    </h2>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                        Pay once and get monthly AI credits forever. No
                        subscriptions, no recurring fees.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <PricingCard
                                title={plan.title}
                                price={plan.price}
                                period={plan.period}
                                credits={plan.credits}
                                productId={plan.productId}
                                loading={paymentLoading === plan.id}
                                popular={plan.popular}
                                onGetStarted={() =>
                                    handleGetStarted(
                                        plan.id,
                                        plan.productId,
                                        plan.monthlyCredits,
                                        plan.amount,
                                    )
                                }
                                features={plan.features}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
