import { NextRequest, NextResponse } from "next/server";
import { redditAPIOptimized } from "@/lib/reddit-api-optimized";

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

        const subredditInfo =
            await redditAPIOptimized.fetchSubredditInfo(subreddit);

        return NextResponse.json(subredditInfo);
    } catch (error) {
        console.error("Error fetching subreddit info:", error);

        // In development, return mock data if Reddit API fails
        if (process.env.NODE_ENV === "development") {
            const subreddit = request.nextUrl.searchParams.get("subreddit");
            console.log(
                `⚠️  Using mock subreddit info for r/${subreddit} (Reddit API unavailable)`,
            );
            return NextResponse.json({
                display_name: subreddit,
                public_description: `This is a mock description for r/${subreddit}. Reddit API is currently unavailable.`,
                subscribers: 100000,
                url: `https://reddit.com/r/${subreddit}`,
            });
        }

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
