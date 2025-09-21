import { NextRequest, NextResponse } from "next/server";
import { redditAPIOptimized } from "@/lib/reddit-api-optimized";

export async function GET(request: NextRequest) {
    const subreddit = request.nextUrl.searchParams.get("subreddit")?.trim();

    if (!subreddit) {
        return NextResponse.json(
            { error: "Subreddit parameter is required" },
            { status: 400 },
        );
    }

    console.log(`🎯 Fetching flairs via OAuth for r/${subreddit}`);

    try {
        const flairs = await redditAPIOptimized.fetchSubredditFlairs(subreddit);

        return NextResponse.json(flairs);
    } catch (error) {
        console.error(`❌ Error fetching flairs for r/${subreddit}:`, error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch flairs",
            },
            { status: 500 },
        );
    }
}
