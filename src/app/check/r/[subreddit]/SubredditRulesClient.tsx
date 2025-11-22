"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubredditRule {
    kind: string;
    short_name: string;
    description: string;
    description_html: string;
    created_utc: number;
    priority: number;
    violation_reason: string;
}

interface SubredditRulesClientProps {
    subreddit: string;
}

export function SubredditRulesClient({ subreddit }: SubredditRulesClientProps) {
    const [rules, setRules] = useState<SubredditRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchRules() {
            try {
                setLoading(true);
                setError(false);

                const response = await fetch(
                    `https://www.reddit.com/r/${subreddit}/about/rules.json`,
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch rules: ${response.status}`,
                    );
                }

                const data = await response.json();

                if (!data.rules || !Array.isArray(data.rules)) {
                    setRules([]);
                    setError(true);
                    return;
                }

                const formattedRules = data.rules.map((rule: any) => ({
                    kind: rule.kind || "all",
                    short_name: rule.short_name || "Rule",
                    description: rule.description || "",
                    description_html: rule.description_html || "",
                    created_utc: rule.created_utc || Date.now() / 1000,
                    priority: rule.priority || 0,
                    violation_reason: rule.violation_reason || "",
                }));

                setRules(formattedRules);
            } catch (err) {
                console.error(`Error fetching rules for r/${subreddit}:`, err);
                setError(true);
                setRules([]);
            } finally {
                setLoading(false);
            }
        }

        fetchRules();
    }, [subreddit]);

    return (
        <div className="grid gap-8 mb-16">
            <Card className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                <CardHeader>
                    <CardTitle>r/{subreddit} Rules You Need to Know</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="animate-pulse flex gap-3"
                                >
                                    <div className="h-6 w-6 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
                                        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
                                        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : rules.length > 0 ? (
                        <ul className="space-y-4">
                            {rules.map((rule, index) => (
                                <li key={index} className="flex gap-3">
                                    <span className="font-bold text-[#FF4500] min-w-[24px]">
                                        {index + 1}.
                                    </span>
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                                            {rule.short_name}
                                        </h3>
                                        <div
                                            className="text-neutral-600 dark:text-neutral-400 text-sm mt-1 prose dark:prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: (
                                                    rule.description_html ||
                                                    rule.description
                                                )
                                                    .replace(/&lt;/g, "<")
                                                    .replace(/&gt;/g, ">")
                                                    .replace(/&amp;/g, "&")
                                                    .replace(/&quot;/g, '"')
                                                    .replace(/&#39;/g, "'")
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
                                                    .replace(/<\/div>/g, ""),
                                            }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-neutral-600 dark:text-neutral-400">
                            {error
                                ? `We couldn't fetch the specific rules for r/${subreddit} right now, but our AI tool can still analyze your post against general Reddit guidelines and community patterns.`
                                : `No specific rules found for r/${subreddit}.`}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
