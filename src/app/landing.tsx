"use client";

import { motion } from "framer-motion";
import { SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import PricingSection from "@/components/PricingSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

export default function Landing() {
    const { isSignedIn, isLoaded } = useUser();
    const router = useRouter();

    const [userStats, setUserStats] = useState<{
        count: number;
        avatars: string[];
    }>({ count: 0, avatars: [] });

    useEffect(() => {
        fetch("/api/public-stats")
            .then((res) => res.json())
            .then((data) => setUserStats(data))
            .catch((err) => console.error("Failed to fetch user stats:", err));
    }, []);

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

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "Why was my Reddit post removed immediately?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Immediate removal usually means you violated a hard rule like missing a required tag (e.g., [Question]), using a forbidden word, or having low karma. Unbannnable checks all these rules before you post.",
                },
            },
            {
                "@type": "Question",
                name: 'How do I fix "Self-Promotion" bans?',
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Most subreddits have a 9:1 rule (9 helpful posts for every 1 self-promo). Our AI rewrites your post to focus on value first, making it less likely to be flagged as spam.",
                },
            },
            {
                "@type": "Question",
                name: 'Can Unbannnable help with "Low Effort" removals?',
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! The AI analyzes the subreddit's average post length and style, then expands your content to meet community standards for quality and depth.",
                },
            },
            {
                "@type": "Question",
                name: "Does this work for all subreddits?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Unbannnable works with any public subreddit. It reads the latest sidebar rules, wiki, and pinned posts to ensure your content is compliant with the specific community guidelines.",
                },
            },
        ],
    };

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm">
                                    Sign In
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Button
                                asChild
                                className="bg-[#FF4500] hover:bg-[#e03d00]"
                            >
                                <Link href="/app">Open App</Link>
                            </Button>
                        </SignedIn>
                    </motion.div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative px-4 sm:px-6 pt-12 pb-20">
                <div className="max-w-7xl mx-auto">
                    {/* Row Layout: Heading + Video */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        {/* Left: Heading and CTA */}
                        <div className="flex-1 text-center lg:text-left">
                            {/* Product Hunt Badge - Left Aligned */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="flex justify-center lg:justify-start mb-6"
                            >
                                <a
                                    href="https://www.producthunt.com/products/unbannnable?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-unbannnable"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1010314&theme=light&t=1756369550719"
                                        alt="Unbannnable - Reddit rule compliance made simple | Product Hunt"
                                        style={{
                                            width: "200px",
                                            height: "43px",
                                        }}
                                        width="200"
                                        height="43"
                                    />
                                </a>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.9, ease: "easeOut" }}
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-4 sm:mb-6 leading-tight"
                            >
                                Stop Reddit Bans:{" "}
                                <span className="text-[#FF4500] relative inline-block">
                                    <span className="relative">
                                        AI-Powered Post Checker
                                        <span className="absolute inset-x-0 top-1/2 h-0.5 bg-[#FF4500] transform -rotate-2"></span>
                                    </span>
                                </span>{" "}
                                & Optimizer
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.9,
                                    delay: 0.2,
                                    ease: "easeOut",
                                }}
                                className="text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-6 sm:mb-8 leading-relaxed"
                            >
                                Paste your post → AI checks ALL rules → Get an
                                optimized, ban-proof version in seconds. No more
                                removals. No more shadowbans.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.9,
                                    delay: 0.3,
                                    ease: "easeOut",
                                }}
                                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                            >
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <Button
                                            size="lg"
                                            className="w-full sm:w-auto bg-[#FF4500] hover:bg-[#e03d00] text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                        >
                                            Try It Free
                                        </Button>
                                    </SignInButton>
                                </SignedOut>
                                <SignedIn>
                                    <Button
                                        asChild
                                        size="lg"
                                        className="w-full sm:w-auto bg-[#FF4500] hover:bg-[#e03d00] text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    >
                                        <Link href="/app">Open App</Link>
                                    </Button>
                                </SignedIn>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() =>
                                        document
                                            .getElementById("features")
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                            })
                                    }
                                    className="w-full sm:w-auto border-2 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl hover:border-[#FF4500] hover:text-[#FF4500] transition-colors"
                                >
                                    See How It Works
                                </Button>
                            </motion.div>

                            {/* Social Proof with Avatars */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.9, delay: 0.5 }}
                                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mt-6 sm:mt-8"
                            >
                                <div className="flex -space-x-3">
                                    {userStats.avatars.length > 0
                                        ? userStats.avatars.map(
                                              (avatar, idx) => (
                                                  <Avatar
                                                      key={idx}
                                                      className="border-2 border-white dark:border-neutral-950 w-10 h-10"
                                                  >
                                                      <AvatarImage
                                                          src={avatar}
                                                          alt={`User ${idx + 1}`}
                                                      />
                                                      <AvatarFallback>
                                                          U{idx + 1}
                                                      </AvatarFallback>
                                                  </Avatar>
                                              ),
                                          )
                                        : // Fallback to placeholder avatars while loading
                                          Array.from({ length: 5 }).map(
                                              (_, idx) => (
                                                  <Avatar
                                                      key={idx}
                                                      className="border-2 border-white dark:border-neutral-950 w-10 h-10"
                                                  >
                                                      <AvatarImage
                                                          src={`https://avatar.vercel.sh/user${idx + 1}`}
                                                          alt={`User ${idx + 1}`}
                                                      />
                                                      <AvatarFallback>
                                                          U{idx + 1}
                                                      </AvatarFallback>
                                                  </Avatar>
                                              ),
                                          )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex">
                                        <span className="text-yellow-500 text-base sm:text-lg">
                                            ⭐
                                        </span>
                                        <span className="text-yellow-500 text-base sm:text-lg">
                                            ⭐
                                        </span>
                                        <span className="text-yellow-500 text-base sm:text-lg">
                                            ⭐
                                        </span>
                                        <span className="text-yellow-500 text-base sm:text-lg">
                                            ⭐
                                        </span>
                                        <span className="text-yellow-500 text-base sm:text-lg">
                                            ⭐
                                        </span>
                                    </div>
                                    <span className="text-neutral-600 dark:text-neutral-400 font-medium text-sm sm:text-base">
                                        {userStats.count > 0 ? (
                                            <>
                                                <span className="font-bold text-neutral-900 dark:text-white">
                                                    {userStats.count}+
                                                </span>{" "}
                                                Redditors trust us
                                            </>
                                        ) : (
                                            <span className="font-bold text-neutral-900 dark:text-white">
                                                Join early adopters
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right: Demo Video */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.9,
                                delay: 0.4,
                                ease: "easeOut",
                            }}
                            className="flex-1 relative w-full"
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

            {/* Pricing Section */}
            <PricingSection />

            {/* FAQ Section */}
            <FAQSection />

            {/* CTA Section */}
            <CTASection />

            {/* Footer */}
            <footer className="py-8 sm:py-12 px-4 sm:px-6 bg-neutral-900 dark:bg-black">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 mb-6 sm:mb-8">
                        {/* Company Info */}
                        <div className="max-w-md">
                            <div className="text-xl sm:text-2xl font-bold text-[#FF4500] mb-2 sm:mb-3">
                                Unbannnable
                            </div>
                            <p className="text-neutral-400 text-xs sm:text-sm">
                                AI-powered Reddit post checker. Never get banned
                                again.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm">
                            <Button
                                variant="link"
                                onClick={() =>
                                    document
                                        .getElementById("pricing")
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                        })
                                }
                                className="hover:text-[#FF4500] transition-colors p-0 h-auto text-neutral-400"
                            >
                                Pricing
                            </Button>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button
                                        variant="link"
                                        className="hover:text-[#FF4500] transition-colors p-0 h-auto text-neutral-400"
                                    >
                                        Sign In
                                    </Button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <Button
                                    variant="link"
                                    asChild
                                    className="hover:text-[#FF4500] transition-colors p-0 h-auto text-neutral-400"
                                >
                                    <Link href="/app">Dashboard</Link>
                                </Button>
                            </SignedIn>
                            <Button
                                variant="link"
                                asChild
                                className="hover:text-[#FF4500] transition-colors p-0 h-auto text-neutral-400"
                            >
                                <a
                                    href="https://x.com/nibodhdaware"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Support
                                </a>
                            </Button>
                        </div>
                    </div>

                    <Separator className="bg-neutral-800 mb-4 sm:mb-6" />

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                        <div className="text-center text-neutral-500 text-xs sm:text-sm">
                            © 2025 Unbannnable. Never get banned on Reddit
                            again.
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-neutral-500 text-xs">
                                Theme:
                            </span>
                            <ThemeToggle />
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
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                        AI Reddit Rule Check: Catch Bans Before They Happen
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Everything you need to post on Reddit without getting
                        removed or banned
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
                            whileHover={{
                                y: -5,
                                transition: { duration: 0.2 },
                            }}
                        >
                            <Card className="h-full group hover:shadow-2xl hover:shadow-[#FF4500]/20 hover:border-[#FF4500]/30 transition-all duration-200">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-[#FF4500] rounded-xl flex items-center justify-center mb-4">
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <CardTitle className="text-xl mb-2">
                                        {feature.title}
                                    </CardTitle>
                                    <CardDescription className="text-base leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                {feature.example && (
                                    <CardContent>
                                        <div className="bg-muted p-3 rounded-lg border">
                                            <p className="text-sm text-muted-foreground italic">
                                                Example: {feature.example}
                                            </p>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
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
                        How to Fix Reddit Posts in 3 Steps
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Get a ban-proof post in under 30 seconds
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
                        >
                            <Card className="text-center h-full hover:shadow-lg transition-shadow duration-200">
                                <CardHeader>
                                    <Badge className="w-12 h-12 bg-[#FF4500] hover:bg-[#FF4500] rounded-full flex items-center justify-center mx-auto mb-4 text-lg">
                                        {index + 1}
                                    </Badge>
                                    <CardTitle className="text-lg mb-2">
                                        {step.title}
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        {step.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
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
                            <Button
                                size="lg"
                                className="bg-white text-[#FF4500] hover:bg-neutral-50 text-lg px-8 py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                Try Unbannnable Free
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Button
                            asChild
                            size="lg"
                            className="bg-white text-[#FF4500] hover:bg-neutral-50 text-lg px-8 py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            <Link href="/app">Open App Now</Link>
                        </Button>
                    </SignedIn>
                </motion.div>
            </div>
        </section>
    );
}

// FAQ Section Component
function FAQSection() {
    return (
        <section className="py-20 px-4 sm:px-6 bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                        Common Reddit Ban Triggers & How Unbannnable Fixes Them
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Learn why posts get removed and how our AI prevents it
                    </p>
                </motion.div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">
                                Why was my Reddit post removed immediately?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Immediate removal usually means you violated a
                                hard rule like missing a required tag (e.g.,
                                [Question]), using a forbidden word, or having
                                low karma. Unbannnable checks all these rules
                                before you post.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">
                                How do I fix "Self-Promotion" bans?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Most subreddits have a 9:1 rule (9 helpful posts
                                for every 1 self-promo). Our AI rewrites your
                                post to focus on value first, making it less
                                likely to be flagged as spam.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">
                                Can Unbannnable help with "Low Effort" removals?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Yes! The AI analyzes the subreddit's average
                                post length and style, then expands your content
                                to meet community standards for quality and
                                depth.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">
                                Does this work for all subreddits?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Unbannnable works with any public subreddit. It
                                reads the latest sidebar rules, wiki, and pinned
                                posts to ensure your content is compliant with
                                the specific community guidelines.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}

// Feature data - Top 4 most important features
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
        title: "Auto Rule Check",
        description:
            "AI instantly scans your post against ALL subreddit rules and tells you exactly what will get you banned.",
        example:
            "Catches missing [Question] tags, self-promotion violations, and wrong flair before you post",
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
        title: "Auto Fix & Optimize",
        description:
            "Don't just find problems—AI rewrites your post to be 100% compliant and more engaging.",
        example:
            "Removes promotional language, adds required context, and rephrases to match community style",
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
        title: "Find Better Subreddits",
        description:
            "Post won't work? AI suggests alternative communities where your content will perform better.",
        example:
            "Suggests r/webdev instead of r/programming, or finds niche communities perfect for your content",
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
            </svg>
        ),
        title: "Smart Flair Selection",
        description:
            "AI picks the perfect flair for your post automatically. No more guessing or trial and error.",
        example:
            "Chooses 'Discussion' vs 'Help' based on your content, preventing auto-removal",
    },
];

// Steps data
const steps: Step[] = [
    {
        title: "1. Paste Your Post",
        description:
            "Copy your Reddit post, select the subreddit, and click analyze.",
    },
    {
        title: "2. AI Checks Everything",
        description:
            "Instantly scans ALL subreddit rules, flair requirements, and common ban triggers.",
    },
    {
        title: "3. Get Fixed Version",
        description:
            "Copy your optimized, ban-proof post and publish with confidence. That's it.",
    },
];
