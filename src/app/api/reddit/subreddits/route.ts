import { NextRequest, NextResponse } from "next/server";
import { redditAPIOptimized } from "@/lib/reddit-api-optimized";

// Mock subreddits for development when Reddit API is unavailable
let lastFallbackWarningAt = 0;
const FALLBACK_WARNING_INTERVAL_MS = 5 * 60 * 1000;

const MOCK_SUBREDDITS = [
    {
        display_name: "programming",
        public_description: "Computer Programming",
        subscribers: 5000000,
        id: "2qh1i",
    },
    {
        display_name: "webdev",
        public_description: "Web Development",
        subscribers: 1500000,
        id: "2qs0k",
    },
    {
        display_name: "javascript",
        public_description: "The JavaScript Programming Language",
        subscribers: 2500000,
        id: "2qh3l",
    },
    {
        display_name: "learnprogramming",
        public_description:
            "A subreddit for all questions related to programming in any language.",
        subscribers: 3000000,
        id: "2qm7x",
    },
    {
        display_name: "Python",
        public_description:
            "News about the dynamic, interpreted, interactive, object-oriented, extensible programming language Python",
        subscribers: 4000000,
        id: "2qh0u",
    },
    {
        display_name: "reactjs",
        public_description:
            "A subreddit for learning and developing web applications using React",
        subscribers: 800000,
        id: "2qkho",
    },
    {
        display_name: "AskReddit",
        public_description: "Ask Reddit...",
        subscribers: 45000000,
        id: "2qh1u",
    },
    {
        display_name: "technology",
        public_description:
            "Subreddit dedicated to the news and discussions about the creation and use of technology",
        subscribers: 14000000,
        id: "2qh3l",
    },
];

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
        const errorMessage = error instanceof Error ? error.message : String(error);

        const shouldWarn =
            Date.now() - lastFallbackWarningAt > FALLBACK_WARNING_INTERVAL_MS;

        if (shouldWarn) {
            console.warn(`Subreddit API fallback active: ${errorMessage}`);
            lastFallbackWarningAt = Date.now();
        }

        // In development, return mock data if Reddit API fails
        if (process.env.NODE_ENV === "development") {
            const query = request.nextUrl.searchParams.get("query");
            const limit = parseInt(
                request.nextUrl.searchParams.get("limit") || "50",
            );

            let filteredSubreddits = MOCK_SUBREDDITS;
            if (query) {
                filteredSubreddits = MOCK_SUBREDDITS.filter(
                    (sub) =>
                        sub.display_name
                            .toLowerCase()
                            .includes(query.toLowerCase()) ||
                        sub.public_description
                            .toLowerCase()
                            .includes(query.toLowerCase()),
                );
            }

            return NextResponse.json(filteredSubreddits.slice(0, limit));
        }

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
