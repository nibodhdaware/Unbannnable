import { NextRequest, NextResponse } from "next/server";

interface RedditTokenResponse {
    access_token: string;
    expires_in: number;
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
        throw new Error("Reddit API credentials not configured");
    }

    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
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

        // Fetch subreddit information
        const response = await fetch(
            `https://oauth.reddit.com/r/${subreddit}/about`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "User-Agent": "reddit-unbanr/1.0",
                },
            },
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch subreddit information" },
                { status: 500 },
            );
        }

        const data = await response.json();

        if (!data.data) {
            return NextResponse.json(
                { error: "Subreddit not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            display_name: data.data.display_name,
            public_description: data.data.public_description || "",
            subscribers: data.data.subscribers || 0,
            url: `https://reddit.com/r/${data.data.display_name}`,
        });
    } catch (error) {
        console.error("Error fetching subreddit info:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch subreddit information",
            },
            { status: 500 },
        );
    }
}
