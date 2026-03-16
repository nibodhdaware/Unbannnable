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
                <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-[#1A1A1A]">
                    Free Reddit Ban Checker
                </h1>
                <p className="text-lg text-black/80 mb-8">
                    Paste your post, pick a subreddit, and check if your content is
                    likely to be removed before you publish.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <a
                        href="https://check.unbannnable.com/"
                        className="inline-flex items-center justify-center h-14 px-8 rounded-none border-2 border-[#1A1A1A] bg-[#FF4D00] text-white font-bold uppercase tracking-wide hover:bg-[#E04400]"
                    >
                        Check My Post
                    </a>
                    <Link
                        href="/check/r"
                        className="inline-flex items-center justify-center h-14 px-8 rounded-none border-2 border-[#1A1A1A] font-bold uppercase tracking-wide text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F2F0E9]"
                    >
                        Browse 25 Subreddit Guides
                    </Link>
                </div>
            </div>
        </main>
    );
}
