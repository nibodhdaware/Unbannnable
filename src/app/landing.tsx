"use client";

import { motion } from "framer-motion";
import { SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left side - Content */}
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.9, ease: "easeOut" }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight"
                            >
                                Never Get{" "}
                                <span className="text-[#FF4500]">Banned</span>{" "}
                                on Reddit Again
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.9,
                                    delay: 0.2,
                                    ease: "easeOut",
                                }}
                                className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed"
                            >
                                AI-powered tool that analyzes subreddit rules,
                                optimizes your content, and suggests
                                improvements to ensure your posts follow
                                community guidelines.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.9,
                                    delay: 0.4,
                                    ease: "easeOut",
                                }}
                                className="flex flex-col sm:flex-row gap-4"
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
                        </div>

                        {/* Right side - Demo Video */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                                duration: 0.9,
                                delay: 0.3,
                                ease: "easeOut",
                            }}
                            className="relative"
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800">
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
                </div>
            </section>

            {/* Features Section */}
            <FeaturesSection />

            {/* How It Works */}
            <HowItWorksSection />

            {/* CTA Section */}
            <CTASection />

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 bg-neutral-900 dark:bg-black">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="text-2xl font-bold text-[#FF4500] mb-4">
                        Unbannnable
                    </div>
                    <p className="text-neutral-400 mb-6">
                        AI-powered Reddit post optimization and safety assistant
                    </p>
                    <div className="text-neutral-500 text-sm">
                        © 2025 Unbannnable. All rights reserved.
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
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                        How Unbannnable Works
                    </h2>
                    <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                        Smart AI analysis that keeps your Reddit posts safe and
                        optimized
                    </p>
                </motion.div>

                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
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
        <section className="py-20 px-4 sm:px-6 bg-white dark:bg-neutral-950">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                        Simple 3-Step Process
                    </h2>
                    <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                        From content analysis to rule compliance in minutes
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
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
                            <div className="relative">
                                <div className="w-16 h-16 bg-[#FF4500] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <span className="text-white font-bold text-xl">
                                        {index + 1}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-8 left-1/2 w-32 h-0.5 bg-neutral-300 dark:bg-neutral-600 transform translate-x-full"></div>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                {step.title}
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                {step.description}
                            </p>
                            {step.details && (
                                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 text-left">
                                    <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                                        {step.details.map((detail, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start"
                                            >
                                                <span className="text-[#FF4500] mr-2">
                                                    •
                                                </span>
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
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
        <section className="py-20 px-4 sm:px-6 bg-[#FF4500]">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                        Ready to Post with Confidence?
                    </h2>
                    <p className="text-lg sm:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                        Start creating Reddit posts that follow the rules and
                        engage your audience
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
        title: "Input Your Content",
        description:
            "Enter your post title, content, and target subreddit. Our AI will analyze everything instantly.",
        details: [
            "Paste or type your post content",
            "Select your target subreddit",
            "Choose post flair if required",
        ],
    },
    {
        title: "Get Rule Analysis",
        description:
            "Receive detailed feedback on rule compliance, content improvements, and alternative subreddit suggestions.",
        details: [
            "See which rules your post might violate",
            "Get specific improvement recommendations",
            "Discover better subreddit alternatives",
            "View optimized content suggestions",
        ],
    },
    {
        title: "Post Successfully",
        description:
            "Apply the suggested changes and post with confidence, knowing your content follows all community guidelines.",
        details: [
            "Make recommended edits",
            "Choose the best subreddit option",
            "Post directly or copy optimized content",
            "Track your post's success",
        ],
    },
];
