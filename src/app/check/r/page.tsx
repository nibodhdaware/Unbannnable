import type { Metadata } from "next";
import Link from "next/link";
import { SUBREDDIT_PSEO_TARGETS } from "@/lib/pseo/subreddits";

export const metadata: Metadata = {
    title: "Subreddit Rule Checker Pages | Unbannnable",
    description:
        "Browse subreddit-specific Reddit post checker pages and validate your post against each community's rules before publishing.",
    alternates: {
        canonical: "https://unbannnable.com/check/r",
    },
};

export default function SubredditDirectoryPage() {
    return (
        <main className="min-h-screen bg-[#F2F0E9] px-6 py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">
                    Subreddit Rule Checker Directory
                </h1>
                <p className="text-black/80 mb-8">
                    Pick a subreddit page to pre-check your post against community
                    rules and improve your approval odds.
                </p>
                <a
                    href="https://check.unbannnable.com/"
                    className="inline-flex items-center justify-center h-12 px-6 mb-8 rounded-none border-2 border-[#1A1A1A] bg-[#FF4D00] text-white font-bold uppercase tracking-wide hover:bg-[#E04400]"
                >
                    Open Ban Checker
                </a>
                <ul className="grid sm:grid-cols-2 gap-3">
                    {SUBREDDIT_PSEO_TARGETS.map((item) => (
                        <li key={item.slug}>
                            <Link
                                href={`/check/r/${item.slug}`}
                                className="block border-2 border-[#1A1A1A] px-4 py-3 bg-white hover:bg-[#FFF6F1] shadow-[4px_4px_0px_0px_#1A1A1A]"
                            >
                                <span className="font-semibold text-[#1A1A1A]">
                                    r/{item.slug}
                                </span>
                                <p className="text-sm text-black/70 mt-1">
                                    {item.audience}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
}
