import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { title, body, currentSubreddit } = await request.json();

        // Mock subreddit suggestions based on content analysis
        const alternatives = [];

        // Analyze content for topic matching
        const content = `${title} ${body}`.toLowerCase();

        // Tech-related content
        if (
            content.includes("programming") ||
            content.includes("code") ||
            content.includes("developer")
        ) {
            alternatives.push({
                name: "programming",
                subscribers: 4200000,
                reason: "Programming and development content",
            });
            alternatives.push({
                name: "webdev",
                subscribers: 850000,
                reason: "Web development focused",
            });
        }

        // Gaming content
        if (
            content.includes("game") ||
            content.includes("gaming") ||
            content.includes("play")
        ) {
            alternatives.push({
                name: "gaming",
                subscribers: 38000000,
                reason: "General gaming discussion",
            });
            alternatives.push({
                name: "pcgaming",
                subscribers: 3200000,
                reason: "PC gaming specific",
            });
        }

        // General discussion
        if (
            content.includes("question") ||
            content.includes("help") ||
            content.includes("advice")
        ) {
            alternatives.push({
                name: "AskReddit",
                subscribers: 45000000,
                reason: "General questions and discussion",
            });
            alternatives.push({
                name: "NoStupidQuestions",
                subscribers: 4200000,
                reason: "Safe space for any questions",
            });
        }

        // News and current events
        if (
            content.includes("news") ||
            content.includes("update") ||
            content.includes("breaking")
        ) {
            alternatives.push({
                name: "worldnews",
                subscribers: 32000000,
                reason: "International news and events",
            });
            alternatives.push({
                name: "news",
                subscribers: 18000000,
                reason: "General news discussion",
            });
        }

        // If no specific matches, suggest some popular general subreddits
        if (alternatives.length === 0) {
            alternatives.push({
                name: "mildlyinteresting",
                subscribers: 19000000,
                reason: "Interesting content that might fit",
            });
            alternatives.push({
                name: "todayilearned",
                subscribers: 30000000,
                reason: "Educational or informative content",
            });
        }

        return NextResponse.json({
            alternatives,
            currentSubreddit,
            analyzed: true,
        });
    } catch (error) {
        console.error("Error finding subreddits:", error);
        return NextResponse.json(
            { error: "Failed to find subreddits" },
            { status: 500 },
        );
    }
}
