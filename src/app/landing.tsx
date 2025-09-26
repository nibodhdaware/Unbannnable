"use client";

import { motion } from "framer-motion";
import { SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JSX, useEffect } from "react";
import PricingSection from "@/components/PricingSection";

interface Feature {
    icon: ({ className }: { className: string }) => JSX.Element;
    title: string;
    description: string;
    example?: string;
}

interface Step {
    title: string;
    description: string;
    details?: string[];
}

export default function LandingPage() {
    const { isSignedIn, isLoaded } = useUser();
    const router = useRouter();

    // Auto-redirect signed-in users to app
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.push("/app");
        }
    }, [isLoaded, isSignedIn, router]);

    // Don't render anything while checking auth status to avoid flash
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4500]"></div>
            </div>
        );
    }

    // Don't render if user is signed in (will be redirected)
    if (isSignedIn) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Navigation */}
            <nav className="relative z-50 px-4 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center space-x-2"
                    >
                        <div className="text-2xl font-bold text-[#FF4500]">
                            Unbannnable
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="flex items-center space-x-4"
                    >
                        {/* Product Hunt Badge */}
                        <a
                            href="https://www.producthunt.com/products/unbannnable?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-unbannnable"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:block"
                        >
                            <img
                                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1010314&theme=light&t=1756369550719"
                                alt="Unbannnable - Reddit rule compliance made simple | Product Hunt"
                                style={{ width: "200px", height: "43px" }}
                                width="200"
                                height="43"
                            />
                        </a>

                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Link
                                href="/app"
                                className="px-6 py-2 bg-[#FF4500] text-white rounded-lg font-medium hover:bg-[#e03d00] transition-colors"
                            >
                                Open App
                            </Link>
                        </SignedIn>
                    </motion.div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative px-4 sm:px-6 pt-12 pb-20">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight"
                    >
                        Avoid{" "}
                        <span className="text-[#FF4500]">
                            Reddit Post Removals
                        </span>{" "}
                        w/ Our Post Rules Checker + Fixer
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.9,
                            delay: 0.2,
                            ease: "easeOut",
                        }}
                        className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed max-w-2xl mx-auto"
                    >
                        AI analyzes your Reddit posts, tells you exactly what's
                        wrong, why it might not work, and fixes it for you.
                        Never get banned again.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.9,
                            delay: 0.3,
                            ease: "easeOut",
                        }}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                    >
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-8 py-4 bg-[#FF4500] text-white rounded-xl font-semibold text-lg hover:bg-[#e03d00] transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                                    Try It Free
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Link
                                href="/app"
                                className="px-8 py-4 bg-[#FF4500] text-white rounded-xl font-semibold text-lg hover:bg-[#e03d00] transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Open App
                            </Link>
                        </SignedIn>
                        <button
                            onClick={() =>
                                document
                                    .getElementById("features")
                                    ?.scrollIntoView({
                                        behavior: "smooth",
                                    })
                            }
                            className="px-8 py-4 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-semibold text-lg hover:border-[#FF4500] hover:text-[#FF4500] transition-colors"
                        >
                            See How It Works
                        </button>
                    </motion.div>

                    {/* Demo Video */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.9,
                            delay: 0.4,
                            ease: "easeOut",
                        }}
                        className="relative"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 max-w-3xl mx-auto">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-auto"
                            >
                                <source src="/demo.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <FeaturesSection />

            {/* How It Works */}
            <HowItWorksSection />

            {/* Pricing Section */}
            <PricingSection />

            {/* CTA Section */}
            <CTASection />

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 bg-neutral-900 dark:bg-black">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        {/* Company Info */}
                        <div className="md:col-span-2">
                            <div className="text-2xl font-bold text-[#FF4500] mb-4">
                                Unbannnable
                            </div>
                            <p className="text-neutral-400 mb-4 max-w-md">
                                The all-in-one AI-powered Reddit post
                                optimization tool that analyzes your content,
                                checks subreddit rules, and helps you find the
                                perfect communities.
                            </p>
                        </div>

                        {/* Features */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">
                                Features
                            </h3>
                            <ul className="space-y-2 text-neutral-400 text-sm">
                                <li>
                                    <button
                                        onClick={() =>
                                            document
                                                .getElementById("features")
                                                ?.scrollIntoView({
                                                    behavior: "smooth",
                                                })
                                        }
                                        className="hover:text-[#FF4500] transition-colors cursor-pointer"
                                    >
                                        AI Post Analysis
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() =>
                                            document
                                                .getElementById("features")
                                                ?.scrollIntoView({
                                                    behavior: "smooth",
                                                })
                                        }
                                        className="hover:text-[#FF4500] transition-colors cursor-pointer"
                                    >
                                        Rule Checker
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() =>
                                            document
                                                .getElementById("features")
                                                ?.scrollIntoView({
                                                    behavior: "smooth",
                                                })
                                        }
                                        className="hover:text-[#FF4500] transition-colors cursor-pointer"
                                    >
                                        Subreddit Finder
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() =>
                                            document
                                                .getElementById("pricing")
                                                ?.scrollIntoView({
                                                    behavior: "smooth",
                                                })
                                        }
                                        className="hover:text-[#FF4500] transition-colors cursor-pointer"
                                    >
                                        Pricing
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">
                                Get Started
                            </h3>
                            <ul className="space-y-2 text-neutral-400 text-sm">
                                <li>
                                    <SignedOut>
                                        <SignInButton mode="modal">
                                            <button className="hover:text-[#FF4500] transition-colors cursor-pointer">
                                                Try Free Tool
                                            </button>
                                        </SignInButton>
                                    </SignedOut>
                                    <SignedIn>
                                        <Link
                                            href="/app"
                                            className="hover:text-[#FF4500] transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                    </SignedIn>
                                </li>
                                <li>
                                    <button
                                        onClick={() =>
                                            document
                                                .getElementById("how-it-works")
                                                ?.scrollIntoView({
                                                    behavior: "smooth",
                                                })
                                        }
                                        className="hover:text-[#FF4500] transition-colors cursor-pointer"
                                    >
                                        How It Works
                                    </button>
                                </li>
                                <li>
                                    <a
                                        href="https://x.com/nibodhdaware"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-[#FF4500] transition-colors"
                                    >
                                        Contact Support
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-neutral-800 text-center">
                        <div className="text-neutral-500 text-sm">
                            © 2025 Unbannnable. All rights reserved. |
                            <a
                                href="https://x.com/nibodhdaware"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-[#FF4500] transition-colors ml-1"
                            >
                                Follow us on X
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Features Section Component
function FeaturesSection() {
    return (
        <section
            id="features"
            className="py-20 px-4 sm:px-6 bg-neutral-50 dark:bg-neutral-900"
        >
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                        How the Post Fixer Works
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        AI analyzes your post, identifies problems, explains why
                        they're issues, and fixes them automatically
                    </p>
                </motion.div>

                <motion.div
                    className="grid md:grid-cols-2 gap-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.05,
                                ease: [0.25, 0.1, 0.25, 1],
                            }}
                            viewport={{ once: true, margin: "-50px" }}
                            className="bg-white dark:bg-neutral-800 p-6 sm:p-8 rounded-xl border border-neutral-200 dark:border-neutral-700 group"
                            whileHover={{
                                y: -5,
                                boxShadow:
                                    "0 25px 50px -12px rgba(255, 69, 0, 0.25)",
                                borderColor: "rgba(255, 69, 0, 0.3)",
                                transition: { duration: 0.2 },
                            }}
                        >
                            <div className="w-12 h-12 bg-[#FF4500] rounded-xl flex items-center justify-center mb-6">
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                                {feature.description}
                            </p>
                            {feature.example && (
                                <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">
                                        Example: {feature.example}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

// How It Works Section Component
function HowItWorksSection() {
    return (
        <section
            id="how-it-works"
            className="py-20 px-4 sm:px-6 bg-white dark:bg-neutral-950"
        >
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                        Fix Your Posts in 3 Steps
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Upload your post, get instant analysis, and see exactly
                        what's wrong and how to fix it
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.8,
                                delay: index * 0.1,
                                ease: "easeOut",
                            }}
                            viewport={{ once: true, margin: "-50px" }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-[#FF4500] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-lg">
                                    {index + 1}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                                {step.title}
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// CTA Section Component
function CTASection() {
    return (
        <section className="py-16 px-4 sm:px-6 bg-[#FF4500]">
            <div className="max-w-3xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Ready to Fix Your Reddit Posts?
                    </h2>
                    <p className="text-lg text-orange-100 mb-8 max-w-xl mx-auto">
                        Stop getting banned. Let AI tell you what's wrong and
                        fix it for you.
                    </p>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="px-8 py-4 bg-white text-[#FF4500] rounded-xl font-semibold text-lg hover:bg-neutral-50 transform hover:scale-105 transition-all duration-200 shadow-lg">
                                Try Unbannnable Free
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Link
                            href="/app"
                            className="inline-block px-8 py-4 bg-white text-[#FF4500] rounded-xl font-semibold text-lg hover:bg-neutral-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            Open App Now
                        </Link>
                    </SignedIn>
                </motion.div>
            </div>
        </section>
    );
}

// Feature data
const features: Feature[] = [
    {
        icon: ({ className }: { className: string }) => (
            <svg
                className={className}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
            </svg>
        ),
        title: "Rule Compliance Check",
        description:
            "Automatically analyzes your post against all subreddit rules and identifies potential violations before you post.",
        example:
            "Detects if your r/programming post needs a [Question] tag or if it violates the 'no self-promotion' rule",
    },
    {
        icon: ({ className }: { className: string }) => (
            <svg
                className={className}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
        title: "Improvement Suggestions",
        description:
            "When your post doesn't follow the rules, get specific recommendations on what to fix and how to make it compliant.",
        example:
            "Suggests adding more detail to your r/AskReddit question or removing promotional links from r/startups posts",
    },
    {
        icon: ({ className }: { className: string }) => (
            <svg
                className={className}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                />
            </svg>
        ),
        title: "Alternative Subreddits",
        description:
            "If your content isn't suitable for your chosen subreddit, discover better alternatives where your post will thrive.",
        example:
            "Redirects your gaming question from r/gaming to r/tipofmyjoystick or suggests r/webdev instead of r/programming for framework questions",
    },
    {
        icon: ({ className }: { className: string }) => (
            <svg
                className={className}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
            </svg>
        ),
        title: "AI Content Optimization",
        description:
            "Enhance your post content to match subreddit expectations and increase engagement while staying compliant.",
        example:
            "Rephrases your r/explainlikeimfive question to be more approachable or adds context to your r/changemyview post",
    },
    {
        icon: ({ className }: { className: string }) => (
            <svg
                className={className}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
        ),
        title: "Smart Subreddit Search",
        description:
            "Discover the perfect communities for your content based on topic, audience, and posting requirements.",
        example:
            "Finds r/MachineLearning for technical AI papers or r/MachineLearning for beginner questions about AI concepts",
    },
    {
        icon: ({ className }: { className: string }) => (
            <svg
                className={className}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
            </svg>
        ),
        title: "Post Viability Analysis",
        description:
            "Get insights into how well your post will perform in a specific subreddit before you publish it.",
        example:
            "Warns that your meme might get removed from r/ProgrammerHumor on weekdays or suggests better timing for r/AskReddit posts",
    },
];

// Steps data
const steps: Step[] = [
    {
        title: "Upload Your Post",
        description:
            "Paste your Reddit post content and select the subreddit. Our AI will instantly analyze what's wrong.",
        details: [
            "Paste or type your post content",
            "Select your target subreddit",
            "Choose post flair if required",
        ],
    },
    {
        title: "Get Instant Analysis",
        description:
            "AI tells you exactly what's wrong, why it might not work, and how to fix it. No guessing required.",
        details: [
            "See exactly which rules you're violating",
            "Understand why your post might get banned",
            "Get specific fixes for each problem",
            "Find better subreddits for your content",
        ],
    },
    {
        title: "Fix & Post Safely",
        description:
            "Apply the AI fixes and post with confidence. Your content is now optimized and ban-proof.",
        details: [
            "Copy the AI-fixed content",
            "Choose the best subreddit option",
            "Post knowing you won't get banned",
            "Track your post's success",
        ],
    },
];
