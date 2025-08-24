import { NextRequest, NextResponse } from "next/server";

interface RedditTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface PostRequirement {
    title_required: boolean;
    title_text_max_length: number;
    title_text_min_length: number;
    body_restriction_policy: string;
    domain_blacklist: string[];
    domain_whitelist: string[];
    body_blacklisted_strings: string[];
    body_required_strings: string[];
    title_blacklisted_strings: string[];
    title_required_strings: string[];
    is_flair_required: boolean;
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
            `https://oauth.reddit.com/r/${subreddit}/api/post_requirements`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "User-Agent": "reddit-unbanr/1.0",
                },
            },
        );

        if (!response.ok) {
            // If post requirements endpoint doesn't exist or fails, return null
            if (response.status === 404 || response.status === 403) {
                return NextResponse.json(null);
            }
            const errorText = await response.text();
            throw new Error(
                `Failed to fetch post requirements: ${response.statusText} - ${errorText}`,
            );
        }

        const data = await response.json();

        // Map the response to our PostRequirement interface
        const requirements: PostRequirement = {
            title_required: data.title_required !== false,
            title_text_max_length: data.title_text_max_length || 300,
            title_text_min_length: data.title_text_min_length || 1,
            body_restriction_policy: data.body_restriction_policy || "none",
            domain_blacklist: data.domain_blacklist || [],
            domain_whitelist: data.domain_whitelist || [],
            body_blacklisted_strings: data.body_blacklisted_strings || [],
            body_required_strings: data.body_required_strings || [],
            title_blacklisted_strings: data.title_blacklisted_strings || [],
            title_required_strings: data.title_required_strings || [],
            is_flair_required: data.is_flair_required === true,
        };

        return NextResponse.json(requirements);
    } catch (error) {
        console.error("Error fetching post requirements:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch post requirements",
            },
            { status: 500 },
        );
    }
}
