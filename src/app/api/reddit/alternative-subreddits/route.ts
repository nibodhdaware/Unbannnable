import { NextRequest, NextResponse } from "next/server";
import { redditAPIOptimized } from "@/lib/reddit-api-optimized";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const subreddit = searchParams.get("subreddit");
        const title = searchParams.get("title") || "";
        const body = searchParams.get("body") || "";

        if (!subreddit) {
            return NextResponse.json(
                { error: "Subreddit parameter is required" },
                { status: 400 },
            );
        }

        const result = await redditAPIOptimized.fetchAlternativeSubreddits(
            subreddit,
            title,
            body,
        );

        return NextResponse.json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Error fetching alternative subreddits: ${errorMessage}`);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch alternative subreddits",
            },
            { status: 500 },
        );
    }
}
