import { NextRequest, NextResponse } from "next/server";
import { redditAPIOptimized } from "@/lib/reddit-api-optimized";

// Mock flairs for development
const MOCK_FLAIRS = [
    {
        id: "1",
        text: "Discussion",
        css_class: "discussion",
        text_color: "dark",
        background_color: "#E8F5E9",
    },
    {
        id: "2",
        text: "Question",
        css_class: "question",
        text_color: "dark",
        background_color: "#E3F2FD",
    },
    {
        id: "3",
        text: "Help",
        css_class: "help",
        text_color: "dark",
        background_color: "#FFF3E0",
    },
    {
        id: "4",
        text: "News",
        css_class: "news",
        text_color: "light",
        background_color: "#1976D2",
    },
];

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

        console.log(`✅ Fetched ${flairs.length} flairs for r/${subreddit}`);

        // If no flairs returned and in development, use mock data
        if (
            (!flairs || flairs.length === 0) &&
            process.env.NODE_ENV === "development"
        ) {
            console.log("⚠️  No flairs found, using mock flair data");
            return NextResponse.json(MOCK_FLAIRS);
        }

        return NextResponse.json(flairs);
    } catch (error) {
        console.error(`❌ Error fetching flairs for r/${subreddit}:`, error);

        // In development, return mock data if Reddit API fails
        if (process.env.NODE_ENV === "development") {
            console.log("⚠️  Using mock flair data (Reddit API unavailable)");
            return NextResponse.json(MOCK_FLAIRS);
        }

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
