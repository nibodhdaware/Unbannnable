import { NextRequest, NextResponse } from "next/server";

interface RedditTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface Subreddit {
    display_name: string;
    public_description: string;
    subscribers: number;
    id: string;
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
        throw new Error(
            "Reddit API credentials not configured. Please add REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET to your environment variables.",
        );
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
    tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Refresh 1 minute early

    return accessToken;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = searchParams.get("limit") || "50";
        const query = searchParams.get("query");

        const token = await getAccessToken();

        let url: string;
        if (query) {
            // Search for specific subreddits
            url = `https://oauth.reddit.com/subreddits/search?q=${encodeURIComponent(
                query,
            )}&limit=${limit}&sort=relevance`;
        } else {
            // Get popular subreddits
            url = `https://oauth.reddit.com/subreddits/popular?limit=${limit}`;
        }

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "reddit-unbanr/1.0",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to fetch subreddits: ${response.statusText} - ${errorText}`,
            );
        }

        const data = await response.json();

        if (!data.data || !data.data.children) {
            throw new Error("Invalid response format from Reddit API");
        }

        const subreddits: Subreddit[] = data.data.children.map(
            (child: any) => ({
                display_name: child.data.display_name,
                public_description: child.data.public_description || "",
                subscribers: child.data.subscribers || 0,
                id: child.data.id,
            }),
        );

        return NextResponse.json(subreddits);
    } catch (error) {
        console.error("Error fetching subreddits:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch subreddits",
            },
            { status: 500 },
        );
    }
}
