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
