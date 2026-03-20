import { NextRequest, NextResponse } from "next/server";
import { redditAPIOptimized } from "@/lib/reddit-api-optimized";

// Mock rules for development
const MOCK_RULES = [
    {
        kind: "all",
        short_name: "Follow Reddit Content Policy",
        description:
            "All posts must follow Reddit's Content Policy and User Agreement.",
        description_html:
            "<p>All posts must follow Reddit's Content Policy and User Agreement.</p>",
        created_utc: 1234567890,
        priority: 0,
        violation_reason: "Reddit Content Policy violation",
    },
    {
        kind: "submission",
        short_name: "No spam or self-promotion",
        description: "Do not post spam or engage in excessive self-promotion.",
        description_html:
            "<p>Do not post spam or engage in excessive self-promotion.</p>",
        created_utc: 1234567890,
        priority: 1,
        violation_reason: "Spam or self-promotion",
    },
    {
        kind: "submission",
        short_name: "Be respectful",
        description:
            "Treat others with respect. No harassment or personal attacks.",
        description_html:
            "<p>Treat others with respect. No harassment or personal attacks.</p>",
        created_utc: 1234567890,
        priority: 2,
        violation_reason: "Disrespectful behavior",
    },
];

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
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Error fetching rules: ${errorMessage}`);

        // In development, return mock data if Reddit API fails
        if (process.env.NODE_ENV === "development") {
            console.log("⚠️  Using mock rules data (Reddit API unavailable)");
            return NextResponse.json(MOCK_RULES);
        }

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
