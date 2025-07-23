"use client";
import React from "react";
import { motion } from "framer-motion";
import SubredditFetcher from "@/components/SubredditFetcher";

const plans = [
    {
        name: "Free",
        price: "$0",
        features: [
            "Basic AI model (Gemini)",
            "2 posts per month",
            "Basic subreddit rules check",
        ],
        cta: "Join Waitlist",
        accent: false,
        best: false,
    },
    {
        name: "Pro",
        price: "$4.99/mo",
        features: [
            "Advanced AI models (GPT, Claude)",
            "Unlimited posts",
            "Alternative subreddit recommendations",
            "Priority support",
        ],
        cta: "Join Waitlist",
        accent: true,
        best: true,
    },
    {
        name: "Lifetime",
        price: "$69.99",
        features: ["All Pro features", "Lifetime access"],
        cta: "Join Waitlist",
        accent: false,
        best: false,
    },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 transition-colors duration-300">
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-4xl sm:text-6xl font-extrabold mb-6 drop-shadow-lg text-neutral-900 dark:text-white"
                >
                    <span className="text-[#FF4500]">Reddit Unbanr</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                    className="text-lg sm:text-2xl text-neutral-700 dark:text-neutral-200 max-w-2xl mb-10"
                >
                    AI-powered assistant to help you craft Reddit posts that
                    follow subreddit rules, avoid bans, and maximize engagement.
                    Free for basic use, advanced features for power users.
                </motion.p>
                <motion.a
                    href="#pricing"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="inline-block bg-[#FF4500] text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-[#e03d00] transition text-lg mb-16"
                >
                    Get Started
                </motion.a>
                <motion.section
                    id="about"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="max-w-3xl mx-auto text-center mb-24"
                >
                    <h2 className="text-2xl font-bold text-[#FF4500] mb-4">
                        How It Works
                    </h2>
                    <ul className="text-neutral-700 dark:text-neutral-200 text-lg mb-4 space-y-1">
                        <li>1. Enter your subreddit and draft your post.</li>
                        <li>2. We fetch the latest rules and requirements.</li>
                        <li>
                            3. Our AI reviews your draft and suggests
                            improvements.
                        </li>
                        <li>
                            4. If your post can't be approved, we suggest
                            similar subreddits.
                        </li>
                    </ul>
                </motion.section>
                <motion.section
                    id="pricing"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="w-full max-w-5xl mx-auto flex flex-col items-center"
                >
                    <h2 className="text-3xl font-bold mb-8 text-neutral-900 dark:text-white">
                        Pricing
                    </h2>
                    <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-center">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 * i, duration: 0.5 }}
                                className={`relative flex flex-col items-center rounded-2xl border shadow-lg px-8 py-10 w-80 bg-white dark:bg-neutral-950 transition-colors duration-300 ${
                                    plan.accent
                                        ? "border-[#FF4500] scale-105 z-10"
                                        : "border-neutral-200 dark:border-neutral-800"
                                }`}
                            >
                                {plan.best && (
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF4500] text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                                        Best Seller
                                    </span>
                                )}
                                <h3
                                    className={`text-2xl font-bold mb-2 ${
                                        plan.accent
                                            ? "text-[#FF4500]"
                                            : "text-neutral-900 dark:text-white"
                                    }`}
                                >
                                    {plan.name}
                                </h3>
                                <div className="text-3xl font-extrabold mb-4">
                                    {plan.price}
                                </div>
                                <ul className="mb-6 text-neutral-700 dark:text-neutral-200 text-left space-y-2">
                                    {plan.features.map((f) => (
                                        <li
                                            key={f}
                                            className="flex items-center gap-2"
                                        >
                                            <span className="inline-block w-2 h-2 rounded-full bg-[#FF4500]" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    className={`w-full py-2 rounded-lg font-semibold transition text-lg ${
                                        plan.accent
                                            ? "bg-[#FF4500] text-white hover:bg-[#e03d00]"
                                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    }`}
                                >
                                    {plan.cta}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Add the SubredditFetcher component */}
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-16 w-full"
                >
                    <SubredditFetcher />
                </motion.section>
            </main>
            <footer className="w-full py-6 text-center text-neutral-500 text-sm mt-auto">
                &copy; {new Date().getFullYear()} Reddit Unbanr. Not affiliated
                with Reddit.
            </footer>
        </div>
    );
}
