import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { title, body, subreddit } = await request.json();

        // Mock flair suggestions based on content analysis
        const suggestions = [];
        const content = `${title} ${body}`.toLowerCase();

        // Common flair categories for different subreddits
        const flairCategories = {
            programming: [
                {
                    text: "Help",
                    confidence: 85,
                    reason: "Seeking programming help",
                },
                {
                    text: "Discussion",
                    confidence: 70,
                    reason: "General programming discussion",
                },
                {
                    text: "Showcase",
                    confidence: 60,
                    reason: "Showing off code or projects",
                },
                {
                    text: "Tutorial",
                    confidence: 55,
                    reason: "Educational content",
                },
            ],
            webdev: [
                {
                    text: "Question",
                    confidence: 90,
                    reason: "Web development questions",
                },
                {
                    text: "Showcase",
                    confidence: 75,
                    reason: "Project showcase",
                },
                {
                    text: "Tutorial",
                    confidence: 65,
                    reason: "Educational content",
                },
                {
                    text: "Career",
                    confidence: 50,
                    reason: "Career-related discussion",
                },
            ],
            gaming: [
                {
                    text: "Discussion",
                    confidence: 80,
                    reason: "Gaming discussion",
                },
                { text: "News", confidence: 70, reason: "Gaming news" },
                {
                    text: "Screenshot",
                    confidence: 60,
                    reason: "Game screenshots",
                },
                {
                    text: "Question",
                    confidence: 55,
                    reason: "Gaming questions",
                },
            ],
            AskReddit: [
                {
                    text: "Serious",
                    confidence: 85,
                    reason: "Serious discussion",
                },
                { text: "NSFW", confidence: 70, reason: "Adult content" },
                { text: "Funny", confidence: 60, reason: "Humorous content" },
                { text: "Advice", confidence: 55, reason: "Seeking advice" },
            ],
            default: [
                {
                    text: "Discussion",
                    confidence: 80,
                    reason: "General discussion",
                },
                {
                    text: "Question",
                    confidence: 75,
                    reason: "Asking a question",
                },
                { text: "News", confidence: 60, reason: "News or updates" },
                { text: "Meta", confidence: 50, reason: "Meta discussion" },
            ],
        };

        // Get flair suggestions based on subreddit
        const subredditFlairs =
            flairCategories[subreddit as keyof typeof flairCategories] ||
            flairCategories.default;

        // Analyze content to adjust confidence scores
        subredditFlairs.forEach((flair) => {
            let confidence = flair.confidence;

            // Adjust based on content analysis
            if (
                content.includes("help") ||
                content.includes("question") ||
                content.includes("how")
            ) {
                if (
                    flair.text.toLowerCase().includes("help") ||
                    flair.text.toLowerCase().includes("question")
                ) {
                    confidence += 15;
                }
            }

            if (
                content.includes("show") ||
                content.includes("look") ||
                content.includes("check")
            ) {
                if (flair.text.toLowerCase().includes("showcase")) {
                    confidence += 20;
                }
            }

            if (
                content.includes("tutorial") ||
                content.includes("guide") ||
                content.includes("learn")
            ) {
                if (flair.text.toLowerCase().includes("tutorial")) {
                    confidence += 25;
                }
            }

            if (
                content.includes("news") ||
                content.includes("update") ||
                content.includes("announcement")
            ) {
                if (flair.text.toLowerCase().includes("news")) {
                    confidence += 20;
                }
            }

            if (
                content.includes("serious") ||
                content.includes("serious") ||
                content.includes("important")
            ) {
                if (flair.text.toLowerCase().includes("serious")) {
                    confidence += 15;
                }
            }

            // Cap confidence at 100
            confidence = Math.min(confidence, 100);

            suggestions.push({
                text: flair.text,
                confidence: confidence,
                reason: flair.reason,
            });
        });

        // Sort by confidence and return top 3
        const topSuggestions = suggestions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3);

        return NextResponse.json({
            suggestions: topSuggestions,
            subreddit,
            analyzed: true,
        });
    } catch (error) {
        console.error("Error suggesting flairs:", error);
        return NextResponse.json(
            { error: "Failed to suggest flairs" },
            { status: 500 },
        );
    }
}
