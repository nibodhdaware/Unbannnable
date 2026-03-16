import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyzeButton } from "@/components/AnalyzeButton";
import { SubredditRulesClient } from "./SubredditRulesClient";
import { SUBREDDIT_PSEO_TARGETS } from "@/lib/pseo/subreddits";

interface PageProps {
    params: Promise<{
        subreddit: string;
    }>;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { subreddit } = await params;
    const profile = SUBREDDIT_PSEO_TARGETS.find(
        (item) => item.slug.toLowerCase() === subreddit.toLowerCase(),
    );

    return {
        title: `Reddit Post Checker for r/${subreddit} | Avoid Removals`,
        description: profile
            ? `Check your post against r/${subreddit} rules and posting patterns for ${profile.audience}. Prevent removals with a subreddit-specific pre-check.`
            : `Check your post against r/${subreddit} rules instantly. AI-powered analysis to prevent bans and removals on r/${subreddit}.`,
        alternates: {
            canonical: `https://unbannnable.com/check/r/${subreddit}`,
        },
        keywords: [
            `r/${subreddit} rules`,
            `post on r/${subreddit}`,
            `avoid ban r/${subreddit}`,
            `reddit post checker`,
        ],
    };
}

export async function generateStaticParams() {
    return SUBREDDIT_PSEO_TARGETS.map((item) => ({
        subreddit: item.slug,
    }));
}

export default async function SubredditCheckPage({ params }: PageProps) {
    const { subreddit } = await params;
    const profile = SUBREDDIT_PSEO_TARGETS.find(
        (item) => item.slug.toLowerCase() === subreddit.toLowerCase(),
    );

    return (
        <div className="min-h-screen bg-[#F2F0E9] text-[#1A1A1A]">
            <nav className="px-4 sm:px-6 py-4 border-b-2 border-[#1A1A1A]">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href="/"
                        className="text-2xl font-bold text-[#FF4500]"
                    >
                        Unbannnable
                    </Link>
                    <a
                        href="https://check.unbannnable.com/"
                        className="inline-flex h-10 items-center justify-center border-2 border-[#1A1A1A] bg-[#FF4D00] px-4 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#E04400]"
                    >
                        Check Post Now
                    </a>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                        Reddit Post Checker for r/{subreddit}
                    </h1>
                    <p className="text-xl text-black/75">
                        Check your post against r/{subreddit} rules instantly and
                        reduce removal risk before you publish.
                    </p>
                </div>

                {profile && (
                    <Card className="mb-8 border-2 border-[#1A1A1A] rounded-none bg-white shadow-[6px_6px_0px_0px_#1A1A1A]">
                        <CardHeader>
                            <CardTitle>Posting style that works in r/{subreddit}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-black/80">
                            <p className="mb-3">
                                Audience fit: <strong>{profile.audience}</strong>
                            </p>
                            <p>{profile.postingTip}</p>
                        </CardContent>
                    </Card>
                )}

                <SubredditRulesClient subreddit={subreddit} />

                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6">
                        Ready to check your post?
                    </h2>
                    <AnalyzeButton subreddit={subreddit} />
                </div>

                <div className="text-center mt-8">
                    <Link
                        href="/check/r"
                        className="text-[#FF4500] font-bold uppercase tracking-wide hover:underline"
                    >
                        Browse more subreddit checker pages
                    </Link>
                </div>
            </main>

            <footer className="py-8 text-center text-black/60 text-sm border-t-2 border-[#1A1A1A] mt-12">
                © 2025 Unbannnable. Not affiliated with Reddit Inc.
            </footer>
        </div>
    );
}
