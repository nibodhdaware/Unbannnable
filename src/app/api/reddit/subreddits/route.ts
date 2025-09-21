import { NextRequest, NextResponse } from "next/server";
import { redditAPIOptimized } from "@/lib/reddit-api-optimized";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get("limit") || "50");
        const query = searchParams.get("query");

        const subreddits = await redditAPIOptimized.fetchSubreddits(
            limit,
            query || undefined,
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
