import { NextRequest, NextResponse } from "next/server";
import { getRedditClient } from "@/lib/reddit-client";

interface FlairOption {
    id: string;
    text: string;
    mod_only: boolean;
}

const EXPECTED_BLOCK_MESSAGE = "Reddit API blocked this server/network (HTTP 403). Using fallback data.";

function normalizeSubredditName(raw: string): string {
    return raw.trim().replace(/^r\//i, "");
}

function dedupeFlairs(flairs: FlairOption[]): FlairOption[] {
    const seen = new Set<string>();
    const unique: FlairOption[] = [];

    for (const flair of flairs) {
        const key = flair.text.trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        unique.push(flair);
    }

    return unique;
}

async function fetchFlairsFromPublicFeeds(
    subreddit: string,
): Promise<FlairOption[]> {
    const userAgent = process.env.REDDIT_USER_AGENT || "unbannnable/1.0 by u/NicDevIam";
    const endpoints = [
        `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=100`,
        `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/new.json?limit=100`,
        `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/top.json?t=month&limit=100`,
    ];

    const collectedFlairs: FlairOption[] = [];

    for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
            headers: { "User-Agent": userAgent },
            cache: "no-store",
        });

        if (!response.ok) continue;

        const data: any = await response.json();
        const children = data?.data?.children;
        if (!Array.isArray(children)) continue;

        for (const child of children) {
            const postData = child?.data;
            const flairText = postData?.link_flair_text;
            if (!flairText || typeof flairText !== "string") continue;

            const templateId =
                postData?.link_flair_template_id ||
                `derived_${flairText.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

            collectedFlairs.push({
                id: templateId,
                text: flairText.trim(),
                mod_only: false,
            });
        }
    }

    return dedupeFlairs(collectedFlairs);
}

export async function GET(request: NextRequest) {
    const subredditParam = request.nextUrl.searchParams.get("subreddit");

    if (!subredditParam) {
        return NextResponse.json(
            { error: "Subreddit parameter is required" },
            { status: 400 },
        );
    }

    const subreddit = normalizeSubredditName(subredditParam);

    try {
        const reddit = await getRedditClient();
        const templates = await reddit
            .getSubreddit(subreddit)
            .getLinkFlairTemplates();

        const oauthFlairs: FlairOption[] = templates
            .map((template: any) => ({
                id: template.id || template.flair_template_id || "",
                text: template.text || template.flair_text || "",
                mod_only: template.mod_only === true,
            }))
            .filter((f) => f.id && f.text && !f.mod_only);

        const uniqueOAuthFlairs = dedupeFlairs(oauthFlairs);
        if (uniqueOAuthFlairs.length > 0) {
            return NextResponse.json(uniqueOAuthFlairs);
        }

        const publicFlairs = await fetchFlairsFromPublicFeeds(subreddit);
        return NextResponse.json(publicFlairs);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes(EXPECTED_BLOCK_MESSAGE)) {
            console.warn(`OAuth flair fetch failed for r/${subreddit}: ${errorMessage}`);
        }

        try {
            const publicFlairs = await fetchFlairsFromPublicFeeds(subreddit);
            return NextResponse.json(publicFlairs);
        } catch (fallbackError) {
            const fallbackMessage =
                fallbackError instanceof Error
                    ? fallbackError.message
                    : String(fallbackError);
            console.warn(
                `Public flair fallback failed for r/${subreddit}: ${fallbackMessage}`,
            );
            return NextResponse.json([]);
        }
    }
}
