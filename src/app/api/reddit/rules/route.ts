import { NextRequest, NextResponse } from "next/server";

interface RedditTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface SubredditRule {
    kind: string;
    short_name: string;
    description: string;
    description_html: string;
    created_utc: number;
    priority: number;
    violation_reason: string;
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
    if (accessToken && Date.now() < tokenExpiry) {
        return accessToken;
    }

    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Reddit API credentials not found");
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "User-Agent": "reddit-unbanr/1.0",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to get access token: ${response.statusText} - ${errorText}`,
        );
    }

    const data: RedditTokenResponse = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000 - 60000;

    return accessToken;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const subreddit = searchParams.get("subreddit");

        if (!subreddit) {
            return NextResponse.json(
                { error: "Subreddit parameter is required" },
                { status: 400 },
            );
        }

        const token = await getAccessToken();

        const response = await fetch(
            `https://oauth.reddit.com/r/${subreddit}/about/rules`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "User-Agent": "reddit-unbanr/1.0",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to fetch rules: ${response.statusText} - ${errorText}`,
            );
        }

        const data = await response.json();

        if (!data.rules || !Array.isArray(data.rules)) {
            return NextResponse.json([]);
        }

        const rules: SubredditRule[] = data.rules.map((rule: any) => ({
            kind: rule.kind || "all",
            short_name: rule.short_name || "Rule",
            description: rule.description || "",
            description_html: rule.description_html || "",
            created_utc: rule.created_utc || Date.now() / 1000,
            priority: rule.priority || 0,
            violation_reason: rule.violation_reason || "",
        }));

        return NextResponse.json(rules);
    } catch (error) {
        console.error("Error fetching rules:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch rules",
            },
            { status: 500 },
        );
    }
}
