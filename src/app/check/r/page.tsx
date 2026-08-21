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
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Subreddit Rule Checker Directory",
        description:
            "Browse 25 subreddit-specific Reddit post checker pages and validate your post against each community's rules before publishing.",
        url: "https://unbannnable.com/check/r",
    };
    return (
        <main className="min-h-screen bg-[#F2F0E9] px-6 py-16">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-4xl mx-auto">
                <nav className="text-sm text-black/60 mb-6">
                    <Link href="/" className="hover:text-[#FF4500] hover:underline">
                        Home
                    </Link>
                    <span className="mx-2">/</span>
                    <Link href="/check" className="hover:text-[#FF4500] hover:underline">
                        Ban Checker
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-[#1A1A1A] font-semibold">Subreddits</span>
                </nav>
                <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A] mb-4">
                    Subreddit Rule Checker Directory
                </h1>
                <p className="text-black/80 mb-2">
                    Pick a subreddit guide to pre-check your post against live community
                    rules and improve your approval odds. Each page includes top removal triggers and a checklist tailored to that community.
                </p>
                <p className="text-sm text-black/60 mb-8">
                    25 pages • Updated Aug 2026 • Free checker at /app
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                    <Link
                        href="/app"
                        className="inline-flex items-center justify-center h-12 px-6 rounded-none border-2 border-[#1A1A1A] bg-[#FF4D00] text-white font-bold uppercase tracking-wide hover:bg-[#E04400]"
                    >
                        Open Ban Checker
                    </Link>
                    <Link
                        href="/check"
                        className="inline-flex items-center justify-center h-12 px-6 rounded-none border-2 border-[#1A1A1A] font-bold uppercase tracking-wide text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F2F0E9]"
                    >
                        How it works
                    </Link>
                </div>
                <ul className="grid sm:grid-cols-2 gap-3">
                    {SUBREDDIT_PSEO_TARGETS.map((item) => (
                        <li key={item.slug}>
                            <Link
                                href={`/check/r/${item.slug.toLowerCase()}`}
                                className="block border-2 border-[#1A1A1A] px-4 py-3 bg-white hover:bg-[#FFF6F1] shadow-[4px_4px_0px_0px_#1A1A1A]"
                            >
                                <span className="font-semibold text-[#1A1A1A]">
                                    r/{item.slug}
                                </span>
                                <p className="text-sm text-black/70 mt-1 line-clamp-2">
                                    {item.description}
                                </p>
                                <p className="text-xs text-black/50 mt-1">{item.audience}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
}
