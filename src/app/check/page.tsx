import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Reddit Ban Checker (Free) | Unbannnable",
    description:
        "Check if your Reddit post will get removed before you publish. Use Unbannnable's free Reddit ban checker to validate rules and reduce ban risk.",
    alternates: {
        canonical: "https://unbannnable.com/check",
    },
    keywords: [
        "reddit ban checker",
        "check reddit ban for free",
        "will i get banned reddit",
        "reddit post checker",
    ],
};

export default function CheckPage() {
    return (
        <main className="min-h-screen bg-[#F2F0E9] px-6 py-20">
            <div className="max-w-4xl mx-auto border-2 border-[#1A1A1A] bg-white p-8 sm:p-12 shadow-[10px_10px_0px_0px_#1A1A1A]">
                <nav className="text-sm text-black/60 mb-6">
                    <Link href="/" className="hover:text-[#FF4500] hover:underline">
                        Home
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#1A1A1A] font-semibold">Ban Checker</span>
                </nav>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-[#1A1A1A]">
                    Free Reddit Ban Checker
                </h1>
                <p className="text-lg text-black/80 mb-2">
                    Paste your post, pick a subreddit, and check if your content is
                    likely to be removed before you publish.
                </p>
                <p className="text-sm text-black/60 mb-8">
                    AI checks title, body, flair and self-promo risk against live subreddit rules. Instant fix suggestion included.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <Link
                        href="/app"
                        className="inline-flex items-center justify-center h-14 px-8 rounded-none border-2 border-[#1A1A1A] bg-[#FF4D00] text-white font-bold uppercase tracking-wide hover:bg-[#E04400]"
                    >
                        Check My Post
                    </Link>
                    <Link
                        href="/check/r"
                        className="inline-flex items-center justify-center h-14 px-8 rounded-none border-2 border-[#1A1A1A] font-bold uppercase tracking-wide text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F2F0E9]"
                    >
                        Browse 25 Subreddit Guides
                    </Link>
                </div>
                <div className="border-t-2 border-[#1A1A1A] pt-6">
                    <h2 className="font-black text-[#1A1A1A] mb-3">How the checker helps</h2>
                    <ul className="space-y-2 text-sm text-black/75">
                        <li>• Scans latest subreddit rules + wiki for ban triggers</li>
                        <li>• Flags self-promo, low-effort, wrong flair and missing context</li>
                        <li>• Rewrites your post to be compliant and more engaging</li>
                        <li>• Suggests better subreddits if your post won&apos;t fit</li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
