import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyzeButton } from "@/components/AnalyzeButton";
import { SubredditRulesClient } from "./SubredditRulesClient";

interface PageProps {
    params: Promise<{
        subreddit: string;
    }>;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { subreddit } = await params;
    return {
        title: `Reddit Post Checker for r/${subreddit} - Avoid Bans`,
        description: `Check your post against r/${subreddit} rules instantly. AI-powered analysis to prevent bans and removals on r/${subreddit}.`,
        keywords: [
            `r/${subreddit} rules`,
            `post on r/${subreddit}`,
            `avoid ban r/${subreddit}`,
            `reddit post checker`,
        ],
    };
}

export default async function SubredditCheckPage({ params }: PageProps) {
    const { subreddit } = await params;

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Navbar (simplified) */}
            <nav className="px-4 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href="/"
                        className="text-2xl font-bold text-[#FF4500]"
                    >
                        Unbannnable
                    </Link>
                    <Button asChild>
                        <Link href="/app">Check Post Now</Link>
                    </Button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                        Reddit Post Checker for r/{subreddit}
                    </h1>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400">
                        Check your post against r/{subreddit} rules instantly.
                        Avoid bans and get more upvotes.
                    </p>
                </div>

                <SubredditRulesClient subreddit={subreddit} />

                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6">
                        Ready to check your post?
                    </h2>
                    <AnalyzeButton subreddit={subreddit} />
                </div>
            </main>

            <footer className="py-8 text-center text-neutral-500 text-sm border-t border-neutral-200 dark:border-neutral-800 mt-12">
                © 2025 Unbannnable. Not affiliated with Reddit Inc.
            </footer>
        </div>
    );
}
