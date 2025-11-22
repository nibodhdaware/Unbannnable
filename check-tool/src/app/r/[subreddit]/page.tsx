import { Metadata } from "next";
import { redditAPIOptimized } from "@/lib/reddit-api-optimized";
import Link from "next/link";

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
    const rules = await redditAPIOptimized.fetchSubredditRules(subreddit);

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
            {/* Navbar (simplified) */}
            <nav className="px-4 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href="/"
                        className="text-2xl font-bold text-[#FF4500]"
                    >
                        Unbannnable
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#FF4500] text-white hover:bg-[#FF4500]/90 h-10 px-4 py-2"
                    >
                        Check Post Now
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                        Reddit Post Checker for r/{subreddit}
                    </h1>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400">
                        Check your post against r/{subreddit} rules instantly.
                        Avoid bans and get more upvotes.
                    </p>
                </div>

                <div className="grid gap-8 mb-16">
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                r/{subreddit} Rules You Need to Know
                            </h3>
                        </div>
                        <div className="p-6 pt-0">
                            {rules.length > 0 ? (
                                <ul className="space-y-4">
                                    {rules.map((rule, index) => (
                                        <li key={index} className="flex gap-3">
                                            <span className="font-bold text-[#FF4500] min-w-[24px]">
                                                {index + 1}.
                                            </span>
                                            <div>
                                                <h3 className="font-semibold">
                                                    {rule.short_name}
                                                </h3>
                                                <div
                                                    className="text-neutral-600 dark:text-neutral-400 text-sm mt-1 prose dark:prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{
                                                        __html: (
                                                            rule.description_html ||
                                                            rule.description
                                                        )
                                                            .replace(
                                                                /&lt;/g,
                                                                "<",
                                                            )
                                                            .replace(
                                                                /&gt;/g,
                                                                ">",
                                                            )
                                                            .replace(
                                                                /&amp;/g,
                                                                "&",
                                                            )
                                                            .replace(
                                                                /&quot;/g,
                                                                '"',
                                                            )
                                                            .replace(
                                                                /&#39;/g,
                                                                "'",
                                                            )
                                                            .replace(
                                                                /<!-- SC_OFF -->/g,
                                                                "",
                                                            )
                                                            .replace(
                                                                /<!-- SC_ON -->/g,
                                                                "",
                                                            )
                                                            .replace(
                                                                /<div class="md">/g,
                                                                "",
                                                            )
                                                            .replace(
                                                                /<\/div>/g,
                                                                "",
                                                            ),
                                                    }}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    We couldn't fetch the specific rules for r/
                                    {subreddit} right now, but our AI tool can
                                    still analyze your post against general
                                    Reddit guidelines and community patterns.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6">
                        Ready to check your post?
                    </h2>
                    <Link
                        href={`/?subreddit=${subreddit}`}
                        className="inline-flex items-center justify-center rounded-xl text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#FF4500] text-white hover:bg-[#FF4500]/90 h-14 px-8 py-6"
                    >
                        Analyze for r/{subreddit}
                    </Link>
                </div>
            </main>

            <footer className="py-8 text-center text-neutral-500 text-sm border-t border-neutral-200 dark:border-neutral-800 mt-12">
                © 2025 Unbannnable. Not affiliated with Reddit Inc.
            </footer>
        </div>
    );
}
