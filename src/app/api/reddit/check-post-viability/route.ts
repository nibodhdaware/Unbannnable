import { NextRequest, NextResponse } from "next/server";
import { redditAPIOptimized } from "@/lib/reddit-api-optimized";

interface SubredditRule {
    kind: string;
    short_name: string;
    description: string;
    description_html: string;
    created_utc: number;
    priority: number;
    violation_reason: string;
}

interface PostViabilityResult {
    canPost: boolean;
    reason: string;
    conflictingRules: string[];
    suggestions: string[];
}

// Function to analyze post content against subreddit rules
function analyzePostAgainstRules(
    title: string,
    body: string,
    rules: SubredditRule[],
): PostViabilityResult {
    const postContent = `${title} ${body}`.toLowerCase();
    const conflictingRules: string[] = [];
    const suggestions: string[] = [];

    // Define rule patterns and their detection keywords
    const rulePatterns = [
        {
            keywords: [
                "no self promotion",
                "no promotion",
                "no advertising",
                "no spam",
                "no commercial",
                "no business",
                "no marketing",
                "no selling",
                "no affiliate",
                "no referral",
                "no monetization",
                "no profit",
                "no commercial content",
                "no promotional content",
                "no advertising content",
                "no business promotion",
                "no product promotion",
                "no service promotion",
                "no brand promotion",
                "no company promotion",
                "no self-promotion",
                "no promotional",
                "no advertisements",
                "no ads",
                "no sponsored",
                "no sponsorship",
                "no paid content",
                "no monetized content",
                "no business posts",
                "no company posts",
                "no brand posts",
                "no product posts",
                "no service posts",
                "no promotional posts",
                "no advertising posts",
                "no commercial posts",
                "no business content",
                "no company content",
                "no brand content",
                "no product content",
                "no service content",
            ],
            postIndicators: [
                "check out",
                "my new",
                "my app",
                "my product",
                "my service",
                "my website",
                "my business",
                "my company",
                "my startup",
                "my brand",
                "download",
                "sign up",
                "subscribe",
                "buy now",
                "get it",
                "try it",
                "visit",
                "promo",
                "discount",
                "offer",
                "limited time",
                "free trial",
                "affiliate",
                "referral",
                "commission",
                "earn money",
                "make money",
                "revenue",
                "profit",
                "sales",
                "marketing",
                "advertising",
                "sponsored",
                "paid",
                "monetized",
                "commercial",
                "business",
                "company",
                "brand",
                "product",
                "service",
            ],
            ruleName: "Self-Promotion/Advertising",
            suggestion:
                "Consider posting in subreddits that allow self-promotion or focus on discussion rather than promotion",
        },
        {
            keywords: [
                "no personal information",
                "no doxxing",
                "no personal details",
                "no private information",
                "no identifying information",
            ],
            postIndicators: [
                "my name is",
                "my email is",
                "my phone is",
                "my address is",
                "my social media",
                "my instagram",
                "my twitter",
                "my facebook",
                "my linkedin",
                "contact me at",
                "dm me",
                "message me",
                "email me",
                "call me",
                "text me",
            ],
            ruleName: "Personal Information",
            suggestion:
                "Remove personal contact information and use Reddit's messaging system instead",
        },
        {
            keywords: [
                "no spam",
                "no repetitive posts",
                "no duplicate content",
                "no reposts",
                "no low effort",
                "no karma farming",
            ],
            postIndicators: [
                "upvote",
                "downvote",
                "karma",
                "please upvote",
                "please downvote",
                "vote for me",
                "help me get karma",
                "need karma",
                "want karma",
            ],
            ruleName: "Spam/Karma Farming",
            suggestion:
                "Focus on providing valuable content rather than asking for votes",
        },
    ];

    // Check each rule against the post content
    rules.forEach((rule) => {
        const ruleText = `${rule.short_name} ${rule.description}`.toLowerCase();

        rulePatterns.forEach((pattern) => {
            // Check if this rule matches any of our patterns
            const hasStrictRule = pattern.keywords.some((keyword) =>
                ruleText.includes(keyword),
            );

            if (hasStrictRule) {
                // Check if post content triggers this rule
                const triggersRule = pattern.postIndicators.some((indicator) =>
                    postContent.includes(indicator),
                );

                if (triggersRule) {
                    conflictingRules.push(rule.short_name);
                    if (!suggestions.includes(pattern.suggestion)) {
                        suggestions.push(pattern.suggestion);
                    }
                }
            }
        });
    });

    const canPost = conflictingRules.length === 0;
    const reason = canPost
        ? "Post appears to comply with subreddit rules"
        : `Post may violate ${conflictingRules.length} rule(s)`;

    return {
        canPost,
        reason,
        conflictingRules,
        suggestions,
    };
}

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

        if (!title.trim()) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 },
            );
        }

        // Fetch the rules for the subreddit using optimized client
        const rules = await redditAPIOptimized.fetchSubredditRules(subreddit);

        // Analyze the post against the rules
        const analysis = analyzePostAgainstRules(title, body, rules);

        return NextResponse.json({
            subreddit,
            analysis,
            rulesCount: rules.length,
            message: analysis.canPost
                ? "Post appears to comply with subreddit rules"
                : "Post may violate subreddit rules. Consider reviewing the suggestions.",
        });
    } catch (error) {
        console.error("Error checking post viability:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to check post viability",
            },
            { status: 500 },
        );
    }
}
