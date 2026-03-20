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

        const requirements =
            await redditAPIOptimized.fetchPostRequirements(subreddit);

        return NextResponse.json(requirements);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Error fetching post requirements: ${errorMessage}`);

        // In development, return mock data if Reddit API fails
        if (process.env.NODE_ENV === "development") {
            const subreddit = request.nextUrl.searchParams.get("subreddit");
            console.log(
                `⚠️  Using mock post requirements for r/${subreddit} (Reddit API unavailable)`,
            );
            return NextResponse.json({
                title_required: true,
                title_text_max_length: 300,
                title_text_min_length: 10,
                body_restriction_policy: "none",
                domain_blacklist: [],
                domain_whitelist: [],
                body_blacklisted_strings: [],
                body_required_strings: [],
                title_blacklisted_strings: [],
                title_required_strings: [],
                is_flair_required: false,
            });
        }

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
