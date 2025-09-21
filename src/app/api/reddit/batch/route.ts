import { NextRequest, NextResponse } from "next/server";
import { redditAPIOptimized } from "@/lib/reddit-api-optimized";

export async function POST(request: NextRequest) {
    try {
        const { subreddits } = await request.json();

        if (!Array.isArray(subreddits) || subreddits.length === 0) {
            return NextResponse.json(
                { error: "Subreddits array is required" },
                { status: 400 },
            );
        }

        if (subreddits.length > 10) {
            return NextResponse.json(
                { error: "Maximum 10 subreddits allowed per batch request" },
                { status: 400 },
            );
        }

        const batchData =
            await redditAPIOptimized.fetchSubredditDataBatch(subreddits);

        return NextResponse.json(batchData);
    } catch (error) {
        console.error("Error fetching batch subreddit data:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch batch subreddit data",
            },
            { status: 500 },
        );
    }
}
