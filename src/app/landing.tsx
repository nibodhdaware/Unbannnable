"use client";

import { motion } from "framer-motion";
import { SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Globe, ShieldCheck, PenTool, Zap, Check } from "lucide-react";
import LandingPostMaker from "@/components/LandingPostMaker";

interface Feature {
    icon: ({ className }: { className: string }) => JSX.Element;
    title: string;
    description: string;
    example?: string;
}

interface Step {
    title: string;
    description: string;
}

const features: Feature[] = [
    {
        icon: ({ className }) => <ShieldCheck className={className} />,
        title: "Auto Rule Check",
        description:
            "AI instantly scans your post against ALL subreddit rules and tells you exactly what will get you banned.",
        example:
            "Catches missing [Question] tags, self-promotion violations, and wrong flair before you post",
    },
    {
        icon: ({ className }) => <PenTool className={className} />,
        title: "Auto Fix & Optimize",
        description:
            "Don't just find problems—AI rewrites your post to be 100% compliant and more engaging.",
        example:
            "Removes promotional language, adds required context, and rephrases to match community style",
    },
    {
        icon: ({ className }) => <Globe className={className} />,
        title: "Find Better Subreddits",
        description:
            "Post won't work? AI suggests alternative communities where your content will perform better.",
        example:
            "Suggests r/webdev instead of r/programming, or finds niche communities perfect for your content",
    },
    {
        icon: ({ className }) => <Zap className={className} />,
        title: "Smart Flair Selection",
        description:
            "AI picks the perfect flair for your post automatically. No more guessing or trial and error.",
        example:
            "Chooses 'Discussion' vs 'Help' based on your content, preventing auto-removal",
    },
];

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

const faqItems = [
    {
        q: "Why was my Reddit post removed immediately?",
        a: "Immediate removal usually means you violated a hard rule like missing a required tag (e.g., [Question]), using a forbidden word, or having low karma. Unbannnable checks all these rules before you post.",
    },
    {
        q: 'How do I fix "Self-Promotion" bans?',
        a: "Most subreddits have a 9:1 rule (9 helpful posts for every 1 self-promo). Our AI rewrites your post to focus on value first, making it less likely to be flagged as spam.",
    },
    {
        q: 'Can Unbannnable help with "Low Effort" removals?',
        a: "Yes! The AI analyzes the subreddit's average post length and style, then expands your content to meet community standards for quality and depth.",
    },
    {
        q: "Does this work for all subreddits?",
        a: "Unbannnable works with any public subreddit. It reads the latest sidebar rules, wiki, and pinned posts to ensure your content is compliant with the specific community guidelines.",
    },
];

export default function Landing() {
    const { isSignedIn, isLoaded, user } = useUser();
    const router = useRouter();
    const [userStats, setUserStats] = useState<{ count: number; avatars: string[] }>({
        count: 0,
        avatars: [],
    });

    useEffect(() => {
        fetch("/api/public-stats")
            .then((res) => res.json())
            .then((data) => setUserStats(data))
            .catch((err) => console.error("Failed to fetch user stats:", err));
    }, []);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.push("/app");
        }
    }, [isLoaded, isSignedIn, router]);

    if (isSignedIn) return null;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
            },
        })),
    };

    return (
        <div className="min-h-screen bg-[#F2F0E9] text-[#1A1A1A] overflow-x-hidden selection:bg-[#1A1A1A] selection:text-[#F2F0E9]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
                .font-heavy-serif { font-family: 'DM Serif Display', serif; }
                .font-sans-body { font-family: 'Instrument Sans', sans-serif; }
                .animate-marquee { animation: marquee 22s linear infinite; }
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            `}</style>

            <nav className="fixed top-0 w-full z-50 border-b-2 border-[#1A1A1A] bg-[#F2F0E9] px-6 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/unbannnable-mark.svg"
                            alt="Unbannnable mark"
                            width={24}
                            height={24}
                            className="w-6 h-6"
                        />
                        <span className="font-heavy-serif text-xl tracking-tight">
                            Unbannnable.
                        </span>
                    </div>
                    <div className="hidden md:flex gap-8 font-sans-body font-medium text-sm tracking-wide uppercase">
                        <a href="#features" className="hover:underline">Features</a>
                        <a href="https://check.unbannnable.com/" className="hover:underline">Ban Checker</a>
                    </div>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button className="rounded-none border-2 border-[#1A1A1A] bg-transparent text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F2F0E9] font-sans-body font-bold text-xs uppercase tracking-widest">
                                Sign In
                            </Button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </nav>

            <section className="pt-32 pb-20 px-6 border-b-2 border-[#1A1A1A]">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mb-6"
                        >
                            <a
                                href="https://www.producthunt.com/products/unbannnable?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-unbannnable"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Image
                                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1010314&theme=light&t=1756369550719"
                                    alt="Unbannnable on Product Hunt"
                                    width={200}
                                    height={43}
                                    className="border-2 border-[#1A1A1A]"
                                />
                            </a>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                            className="font-heavy-serif text-5xl md:text-7xl leading-[0.95] tracking-tight mb-6"
                        >
                            Stop Reddit Bans:{" "}
                            <span className="italic text-[#FF4500]">
                                AI-Powered Post Checker
                            </span>{" "}
                            & Optimizer
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="font-sans-body text-xl md:text-2xl font-medium leading-relaxed border-l-4 border-[#FF4500] pl-6 mb-8 text-black/80 max-w-2xl"
                        >
                            Paste your post → AI checks ALL rules → Get an optimized, ban-proof
                            version in seconds. No more removals. No more shadowbans.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 mb-8"
                        >
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button className="h-14 px-8 rounded-none bg-[#FF4D00] text-white hover:bg-[#E04400] border-2 border-[#1A1A1A] font-sans-body font-bold text-base uppercase tracking-wide">
                                        Try It Free <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </SignInButton>
                            </SignedOut>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    document.getElementById("features")?.scrollIntoView({
                                        behavior: "smooth",
                                    })
                                }
                                className="h-14 px-8 rounded-none border-2 border-[#1A1A1A] bg-transparent hover:bg-[#1A1A1A] hover:text-[#F2F0E9] font-sans-body font-bold text-base uppercase tracking-wide"
                            >
                                See How It Works
                            </Button>
                        </motion.div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex -space-x-3">
                                {userStats.avatars.length > 0
                                    ? userStats.avatars.map((avatar, idx) => (
                                          <Avatar
                                              key={idx}
                                              className="border-2 border-[#F2F0E9] w-10 h-10"
                                          >
                                              <AvatarImage src={avatar} alt={`User ${idx + 1}`} />
                                              <AvatarFallback>U{idx + 1}</AvatarFallback>
                                          </Avatar>
                                      ))
                                    : Array.from({ length: 5 }).map((_, idx) => (
                                          <Avatar
                                              key={idx}
                                              className="border-2 border-[#F2F0E9] w-10 h-10"
                                          >
                                              <AvatarImage
                                                  src={`https://avatar.vercel.sh/user${idx + 1}`}
                                                  alt={`User ${idx + 1}`}
                                              />
                                              <AvatarFallback>U{idx + 1}</AvatarFallback>
                                          </Avatar>
                                      ))}
                            </div>
                            <div className="font-sans-body text-sm font-bold uppercase tracking-wide">
                                <div className="flex text-[#FF4500] mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Check key={i} className="w-4 h-4" />
                                    ))}
                                </div>
                                {userStats.count > 0
                                    ? `${userStats.count}+ Redditors trust us`
                                    : "Join early adopters"}
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="lg:col-span-6"
                    >
                        <LandingPostMaker />
                    </motion.div>
                </div>
            </section>

            <section className="bg-[#1A1A1A] text-[#F2F0E9] py-4 overflow-hidden border-b-2 border-[#1A1A1A]">
                <div className="animate-marquee whitespace-nowrap font-sans-body font-bold uppercase tracking-widest text-lg">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className="mx-8">
                            NO MORE SHADOWBANS // RULE-CHECKED WRITES // HIGHER POST SURVIVAL //
                        </span>
                    ))}
                </div>
            </section>

            <section id="features" className="py-20 border-b-2 border-[#1A1A1A]">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="font-heavy-serif text-4xl mb-2"
                    >
                        AI Reddit Rule Check: Catch Bans Before They Happen
                    </motion.h2>
                    <p className="font-sans-body text-lg text-black/70 mb-10">
                        Everything you need to post on Reddit without getting removed or banned
                    </p>
                    <div className="grid md:grid-cols-2 gap-0 border-2 border-[#1A1A1A]">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                className="p-8 border-r-2 border-b-2 border-[#1A1A1A] even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0"
                            >
                                <div className="w-12 h-12 bg-[#1A1A1A] text-[#F2F0E9] flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-heavy-serif text-2xl mb-3">{feature.title}</h3>
                                <p className="font-sans-body text-black/80 mb-3">
                                    {feature.description}
                                </p>
                                {feature.example && (
                                    <p className="font-sans-body text-sm text-black/60 italic">
                                        Example: {feature.example}
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 border-b-2 border-[#1A1A1A]">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="font-heavy-serif text-4xl mb-2 text-center">
                        How to Fix Reddit Posts in 3 Steps
                    </h2>
                    <p className="font-sans-body text-lg text-black/70 mb-10 text-center">
                        Get a ban-proof post in under 30 seconds
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: index * 0.08 }}
                                className="border-2 border-[#1A1A1A] p-6 hover:-translate-y-1 transition-transform"
                            >
                                <Badge className="mb-4 bg-[#FF4500] hover:bg-[#FF4500] rounded-none">
                                    {index + 1}
                                </Badge>
                                <h3 className="font-heavy-serif text-2xl mb-3">{step.title}</h3>
                                <p className="font-sans-body text-black/80">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing section removed - all features are now free */}

            <section className="py-20 px-6 bg-[#FF4500] text-white border-b-2 border-[#1A1A1A]">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="font-heavy-serif text-5xl mb-4">
                        Ready to Fix Your Reddit Posts?
                    </h2>
                    <p className="font-sans-body text-lg text-orange-100 mb-8">
                        Stop getting banned. Let AI tell you what's wrong and fix it for you.
                    </p>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button className="rounded-none bg-white text-[#FF4500] hover:bg-neutral-50 font-sans-body font-bold uppercase tracking-wide">
                                Try Unbannnable Free
                            </Button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </section>

            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-heavy-serif text-4xl mb-8 text-center">
                        Common Reddit Ban Triggers & How Unbannnable Fixes Them
                    </h2>
                    <div className="space-y-4">
                        {faqItems.map((faq, i) => (
                            <div key={i} className="border-2 border-[#1A1A1A] p-6 bg-white/50">
                                <h3 className="font-heavy-serif text-2xl mb-2">{faq.q}</h3>
                                <p className="font-sans-body text-black/80">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
