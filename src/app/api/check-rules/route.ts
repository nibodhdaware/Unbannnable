import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { title, body, subreddit, flair } = await request.json();

        // Mock rule checking logic
        const violations = [];

        // Check for common rule violations
        if (title.length < 10) {
            violations.push("Title too short (minimum 10 characters)");
        }

        if (title.length > 300) {
            violations.push("Title too long (maximum 300 characters)");
        }

        if (body.length < 20) {
            violations.push("Post body too short (minimum 20 characters)");
        }

        if (body.length > 40000) {
            violations.push("Post body too long (maximum 40,000 characters)");
        }

        // Check for spam-like content
        if (
            title.toLowerCase().includes("buy") ||
            title.toLowerCase().includes("sell")
        ) {
            violations.push(
                "Title contains commercial language - may violate spam rules",
            );
        }

        // Check for excessive caps
        const capsRatio = (title.match(/[A-Z]/g) || []).length / title.length;
        if (capsRatio > 0.7) {
            violations.push(
                "Title has too many capital letters - may be considered shouting",
            );
        }

        // Check for URL patterns
        const urlPattern = /https?:\/\/[^\s]+/g;
        if (urlPattern.test(body) && !body.includes("reddit.com")) {
            violations.push(
                "External links detected - ensure they're relevant and not spam",
            );
        }

        return NextResponse.json({
            violations,
            checked: true,
            subreddit,
        });
    } catch (error) {
        console.error("Error checking rules:", error);
        return NextResponse.json(
            { error: "Failed to check rules" },
            { status: 500 },
        );
    }
}
