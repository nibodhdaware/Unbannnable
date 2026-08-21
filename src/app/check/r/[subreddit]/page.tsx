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

function getProfile(slug: string) {
    return SUBREDDIT_PSEO_TARGETS.find(
        (item) => item.slug.toLowerCase() === slug.toLowerCase(),
    );
}

function getRelated(currentSlug: string) {
    const idx = SUBREDDIT_PSEO_TARGETS.findIndex(
        (s) => s.slug.toLowerCase() === currentSlug.toLowerCase(),
    );
    if (idx === -1) return SUBREDDIT_PSEO_TARGETS.slice(0, 4);
    const start = Math.max(0, idx - 2);
    return SUBREDDIT_PSEO_TARGETS.filter(
        (s) => s.slug.toLowerCase() !== currentSlug.toLowerCase(),
    ).slice(start, start + 4);
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { subreddit } = await params;
    const canonicalSlug = subreddit.toLowerCase();
    const profile = getProfile(subreddit);
    const audience = profile?.audience ?? "community members";

    return {
        title: profile
            ? `r/${profile.slug} Rules & Post Checker (2026) | Avoid Removal for ${audience}`
            : `Reddit Post Checker for r/${subreddit} | Avoid Removals`,
        description: profile
            ? `${profile.description} Check your post against r/${profile.slug} rules for ${audience}: ${profile.postingTip} Instant AI pre-check before you publish.`
            : `Check your post against r/${subreddit} rules instantly. AI-powered analysis to prevent bans and removals on r/${subreddit}.`,
        alternates: {
            canonical: `https://unbannnable.com/check/r/${canonicalSlug}`,
        },
        keywords: [
            `r/${subreddit} rules`,
            `post on r/${subreddit}`,
            `avoid ban r/${subreddit}`,
            `reddit post checker`,
            `r/${subreddit} posting guide`,
        ],
        openGraph: {
            title: `r/${subreddit} Post Checker - Avoid Removals`,
            description: profile
                ? profile.description
                : `Check your Reddit post against r/${subreddit} rules before publishing.`,
            url: `https://unbannnable.com/check/r/${canonicalSlug}`,
            type: "article",
        },
    };
}

export async function generateStaticParams() {
    return SUBREDDIT_PSEO_TARGETS.map((item) => ({
        subreddit: item.slug,
    }));
}

export default async function SubredditCheckPage({ params }: PageProps) {
    const { subreddit } = await params;
    const profile = getProfile(subreddit);
    const displaySlug = profile?.slug ?? subreddit;
    const canonicalSlug = displaySlug.toLowerCase();
    const related = getRelated(displaySlug);

    const faqItems = profile
        ? [
              {
                  q: `Why was my post removed from r/${displaySlug}?`,
                  a: `Top reasons: ${profile.pitfalls.slice(0, 2).join("; ")}. Our checker scans your title/body against the latest rules and flags these before you post.`,
              },
              {
                  q: `What title works best in r/${displaySlug}?`,
                  a: `${profile.checklist[0]} Keep it specific to ${profile.audience} and avoid hype language that triggers automod.`,
              },
              {
                  q: `Do I need flair in r/${displaySlug}?`,
                  a: `Many posts in r/${displaySlug} require flair. We auto-detect if your title matches a required flair and suggest the best one - paste your post to see the recommendation.`,
              },
          ]
        : [
              {
                  q: `Why was my post removed from r/${subreddit}?`,
                  a: `Most removals are due to missing flair, self-promotion, or low-effort formatting. Use the checker above to scan your post before publishing.`,
              },
          ];

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://unbannnable.com",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Ban Checker",
                item: "https://unbannnable.com/check",
            },
            {
                "@type": "ListItem",
                position: 3,
                name: `r/${displaySlug}`,
                item: `https://unbannnable.com/check/r/${canonicalSlug}`,
            },
        ],
    };

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
    };

    const softwareJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: `Unbannnable - r/${displaySlug} Checker`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: `https://unbannnable.com/check/r/${canonicalSlug}`,
        description:
            profile?.description ??
            `Check posts against r/${subreddit} rules to avoid removals.`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@type": "Organization", name: "Unbannnable" },
    };

    return (
        <div className="min-h-screen bg-[#F2F0E9] text-[#1A1A1A]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
            />

            <nav className="px-4 sm:px-6 py-4 border-b-2 border-[#1A1A1A] bg-[#F2F0E9] sticky top-0 z-10">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-[#FF4500]">
                        Unbannnable
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/check/r"
                            className="hidden sm:inline-flex text-sm font-bold uppercase tracking-wide hover:underline"
                        >
                            Directory
                        </Link>
                        <Link
                            href="/app"
                            className="inline-flex h-10 items-center justify-center border-2 border-[#1A1A1A] bg-[#FF4D00] px-4 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#E04400]"
                        >
                            Check Post Now
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Breadcrumbs */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-sm">
                <ol className="flex flex-wrap gap-2 text-black/60">
                    <li>
                        <Link href="/" className="hover:text-[#FF4500] hover:underline">
                            Home
                        </Link>
                        <span className="mx-2">/</span>
                    </li>
                    <li>
                        <Link href="/check" className="hover:text-[#FF4500] hover:underline">
                            Ban Checker
                        </Link>
                        <span className="mx-2">/</span>
                    </li>
                    <li>
                        <Link href="/check/r" className="hover:text-[#FF4500] hover:underline">
                            Subreddits
                        </Link>
                        <span className="mx-2">/</span>
                    </li>
                    <li className="text-[#1A1A1A] font-semibold">r/{displaySlug}</li>
                </ol>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
                {/* Hero */}
                <div className="text-center mb-10 pt-6">
                    <p className="inline-block border-2 border-[#1A1A1A] bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4 shadow-[3px_3px_0px_0px_#1A1A1A]">
                        Updated Aug 2026 • Free Checker
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
                        Reddit Post Checker for r/{displaySlug}
                    </h1>
                    <p className="text-lg sm:text-xl text-black/75 max-w-3xl mx-auto leading-relaxed">
                        {profile
                            ? profile.description
                            : `Check your post against r/${subreddit} rules instantly and reduce removal risk before you publish.`}{" "}
                        Paste your title + body, pick r/{displaySlug}, and get an instant risk score with a fix.
                    </p>
                    <p className="text-sm text-black/60 mt-3">
                        Built for {profile?.audience ?? "Reddit posters"} • No login required to check
                    </p>
                </div>

                {profile && (
                    <Card className="mb-8 border-2 border-[#1A1A1A] rounded-none bg-white shadow-[6px_6px_0px_0px_#1A1A1A]">
                        <CardHeader>
                            <CardTitle>Posting style that works in r/{displaySlug}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-black/80">
                            <p className="mb-3">
                                Audience fit: <strong>{profile.audience}</strong>
                            </p>
                            <p>{profile.postingTip}</p>
                        </CardContent>
                    </Card>
                )}

                <SubredditRulesClient subreddit={displaySlug} />

                {profile && (
                    <>
                        <section className="mb-10 border-2 border-[#1A1A1A] bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1A1A1A]">
                            <h2 className="text-2xl font-black mb-4">
                                Why posts get removed in r/{displaySlug}
                            </h2>
                            <p className="text-black/70 mb-4">
                                r/{displaySlug} is tuned for {profile.audience}. Automod and human mods remove quickly when signal is low. The most common triggers we see:
                            </p>
                            <ul className="space-y-3">
                                {profile.pitfalls.map((pitfall, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="mt-1 w-6 h-6 flex-shrink-0 bg-[#FF4500] text-white text-xs font-black flex items-center justify-center">
                                            !
                                        </span>
                                        <span className="text-black/80">{pitfall}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="mb-10 border-2 border-[#1A1A1A] bg-[#1A1A1A] text-[#F2F0E9] p-6 sm:p-8">
                            <h2 className="text-2xl font-black mb-4 text-white">
                                r/{displaySlug} checklist — before you publish
                            </h2>
                            <ul className="space-y-3">
                                {profile.checklist.map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="text-[#FF4500] font-black">✓</span>
                                        <span className="text-[#F2F0E9]/90">{item}</span>
                                    </li>
                                ))}
                                <li className="flex gap-3">
                                    <span className="text-[#FF4500] font-black">✓</span>
                                    <span className="text-[#F2F0E9]/90">No promotional links in the title — move them to a comment if needed</span>
                                </li>
                            </ul>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href="/app"
                                    className="inline-flex h-11 items-center justify-center bg-[#FF4500] px-6 text-sm font-black uppercase tracking-wide text-white border-2 border-white hover:bg-[#E04400]"
                                >
                                    Paste Post & Check Now
                                </Link>
                                <Link
                                    href="/check/r"
                                    className="inline-flex h-11 items-center justify-center border-2 border-white px-6 text-sm font-bold uppercase tracking-wide text-white hover:bg-white hover:text-[#1A1A1A]"
                                >
                                    Compare other subreddits
                                </Link>
                            </div>
                        </section>

                        <section className="mb-10 grid md:grid-cols-2 gap-0 border-2 border-[#1A1A1A] bg-white overflow-hidden shadow-[6px_6px_0px_0px_#1A1A1A]">
                            <div className="p-6 border-b-2 md:border-b-0 md:border-r-2 border-[#1A1A1A] bg-red-50">
                                <h3 className="font-black text-[#1A1A1A] mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-red-600 text-white flex items-center justify-center text-xs">✗</span>
                                    Gets removed
                                </h3>
                                <p className="text-sm text-black/70 italic leading-relaxed">
                                    &quot;Hey guys check my new SaaS tool, would love feedback! Link in comments 🚀🚀&quot; — no context, no traction, pure promotion.
                                </p>
                                <p className="text-xs text-red-700 mt-3 font-bold">Why it fails: triggers self-promo + low effort in r/{displaySlug}</p>
                            </div>
                            <div className="p-6 bg-green-50">
                                <h3 className="font-black text-[#1A1A1A] mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-green-600 text-white flex items-center justify-center text-xs">✓</span>
                                    Stays up & gets replies
                                </h3>
                                <p className="text-sm text-black/70 italic leading-relaxed">
                                    &quot;After 3 failed launches, how I got 12 paying users for my {profile.audience} tool — breakdown of cold email + pricing test&quot; — numbers, method, question.
                                </p>
                                <p className="text-xs text-green-700 mt-3 font-bold">Why it wins: shows effort, invites peer advice</p>
                            </div>
                        </section>
                    </>
                )}

                <div className="text-center border-2 border-[#1A1A1A] bg-white p-8 mb-10 shadow-[6px_6px_0px_0px_#1A1A1A]">
                    <h2 className="text-2xl font-black mb-3">Ready to check your post?</h2>
                    <p className="text-black/70 mb-6">Get a fix with correct flair and phrasing in ~15 seconds.</p>
                    <AnalyzeButton subreddit={displaySlug} />
                    <p className="text-xs text-black/50 mt-4">Free • No credit card • Works for any public subreddit</p>
                </div>

                {/* FAQ */}
                <section className="mb-10 border-2 border-[#1A1A1A] bg-white p-6 sm:p-8">
                    <h2 className="text-2xl font-black mb-6">r/{displaySlug} FAQ — posting without getting banned</h2>
                    <div className="space-y-5">
                        {faqItems.map((item, i) => (
                            <div key={i} className="border-l-4 border-[#FF4500] pl-4">
                                <h3 className="font-bold text-[#1A1A1A] mb-1">{item.q}</h3>
                                <p className="text-black/70 text-sm leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-black/50 mt-6">
                        Last checked: Aug 21, 2026 — rules change; always double-check sidebar before publishing.
                    </p>
                </section>

                {/* Related */}
                <section className="mb-8">
                    <h2 className="text-xl font-black mb-4">Try other subreddit checkers</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {related.map((item) => (
                            <Link
                                key={item.slug}
                                href={`/check/r/${item.slug.toLowerCase()}`}
                                className="block border-2 border-[#1A1A1A] px-4 py-3 bg-white hover:bg-[#FFF6F1] shadow-[4px_4px_0px_0px_#1A1A1A] transition-colors"
                            >
                                <span className="font-bold text-[#1A1A1A]">r/{item.slug}</span>
                                <p className="text-sm text-black/60 mt-1 line-clamp-2">{item.description}</p>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center mt-6">
                        <Link
                            href="/check/r"
                            className="text-[#FF4500] font-bold uppercase tracking-wide text-sm hover:underline"
                        >
                            Browse all 25 subreddit checker pages →
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="py-8 text-center text-black/60 text-sm border-t-2 border-[#1A1A1A] mt-4">
                <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span>© 2025 Unbannnable. Not affiliated with Reddit Inc.</span>
                    <div className="flex gap-4">
                        <Link href="/privacy" className="hover:text-[#FF4500] hover:underline">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-[#FF4500] hover:underline">
                            Terms
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
