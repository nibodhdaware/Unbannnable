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

        const rules = await redditAPIOptimized.fetchSubredditRules(subreddit);

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
