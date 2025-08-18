import { NextRequest, NextResponse } from "next/server";

interface RedditTokenResponse {
    access_token: string;
    expires_in: number;
}

interface SubredditRule {
    kind: string;
    short_name: string;
    description: string;
    description_html: string;
    created_utc: number;
    priority: number;
    violation_reason: string;
}

interface AlternativeSubreddit {
    display_name: string;
    public_description: string;
    subscribers: number;
    url: string;
    reason: string;
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
    if (accessToken && Date.now() < tokenExpiry) {
        return accessToken;
    }

    const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Reddit API credentials not configured");
    }

    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data: RedditTokenResponse = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000 - 60000;

    return accessToken;
}

// Function to detect strict rules that might prevent posting
function detectStrictRules(rules: SubredditRule[]): string[] {
    const strictRuleKeywords = [
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
        "no self promotion",
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
    ];

    const detectedRules: string[] = [];

    rules.forEach((rule) => {
        const ruleText = `${rule.short_name} ${rule.description}`.toLowerCase();
        for (const keyword of strictRuleKeywords) {
            if (ruleText.includes(keyword)) {
                detectedRules.push(rule.short_name);
                break;
            }
        }
    });

    return detectedRules;
}

// Function to get alternative subreddits using Gemini AI
async function getAlternativeSubredditsWithAI(
    title: string,
    body: string,
    currentSubreddit: string,
    strictRules: string[],
    token: string,
): Promise<AlternativeSubreddit[]> {
    const alternatives: AlternativeSubreddit[] = [];

    try {
        // Use Gemini API to suggest alternative subreddits
        const apiKey =
            process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
            "AIzaSyDjyDhQmJHb-fNwNmShUkqpCd-QG8Y9T7o";

        const prompt = `You are a Reddit expert. A user wants to post the following content but the subreddit r/${currentSubreddit} has strict rules that prevent it.

**User's Post:**
Title: "${title}"
Body: "${body}"

**Strict Rules Detected:**
${strictRules.map((rule) => `- ${rule}`).join("\n")}

**Task:** Suggest 8 alternative subreddits where this content would be appropriate and welcome. For each subreddit, provide:
1. The subreddit name (without r/)
2. A brief reason why it's suitable
3. The type of content it accepts

**Requirements:**
- Focus on active, popular subreddits
- Ensure the content type matches the subreddit's purpose
- Avoid subreddits with similar strict rules
- Consider the specific content and context

**Output Format:**
Return only a JSON array with this exact structure:
[
  {
    "name": "subreddit_name",
    "reason": "Brief explanation of why this subreddit is suitable",
    "contentType": "self-promotion|product-promotion|service-promotion|discussion|help|review"
  }
]`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024,
                    },
                }),
            },
        );

        if (!response.ok) {
            throw new Error(`Gemini API request failed: ${response.status}`);
        }

        const data = await response.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!result) {
            throw new Error("No content generated from Gemini API");
        }

        // Parse the JSON response
        const suggestedSubreddits = JSON.parse(result);

        // Fetch subreddit information and verify rules for each suggestion
        for (const suggestion of suggestedSubreddits.slice(0, 12)) {
            // Check more to account for filtering
            try {
                // First get subreddit info
                const subredditResponse = await fetch(
                    `https://oauth.reddit.com/r/${suggestion.name}/about`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "User-Agent": "reddit-unbanr/1.0",
                        },
                    },
                );

                if (subredditResponse.ok) {
                    const subredditData = await subredditResponse.json();
                    if (subredditData.data) {
                        // Now check the rules to see if this subreddit also has strict rules
                        const rulesResponse = await fetch(
                            `https://oauth.reddit.com/r/${suggestion.name}/about/rules`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    "User-Agent": "reddit-unbanr/1.0",
                                },
                            },
                        );

                        let hasConflictingRules = false;
                        if (rulesResponse.ok) {
                            const rulesData = await rulesResponse.json();
                            const altRules: SubredditRule[] =
                                rulesData.rules || [];

                            // Check if this alternative subreddit has similar strict rules
                            const conflictingRules =
                                detectStrictRules(altRules);
                            hasConflictingRules = conflictingRules.length > 0;
                        }

                        // Only add if it doesn't have conflicting rules
                        if (!hasConflictingRules) {
                            alternatives.push({
                                display_name: subredditData.data.display_name,
                                public_description:
                                    subredditData.data.public_description ||
                                    "No description available",
                                subscribers:
                                    subredditData.data.subscribers || 0,
                                url: `https://reddit.com/r/${subredditData.data.display_name}`,
                                reason: suggestion.reason,
                            });
                        }
                    }
                }
            } catch (error) {
                console.error(`Error fetching r/${suggestion.name}:`, error);
            }
        }

        // Sort by subscriber count (most popular first)
        return alternatives.sort((a, b) => b.subscribers - a.subscribers);
    } catch (error) {
        console.error("Error getting AI suggestions:", error);

        // Fallback to predefined alternatives
        return getFallbackAlternatives(token);
    }
}

// Fallback function with predefined alternatives
async function getFallbackAlternatives(
    token: string,
): Promise<AlternativeSubreddit[]> {
    const alternatives: AlternativeSubreddit[] = [];

    const fallbackSubreddits = [
        {
            name: "SideProject",
            reason: "Share your side projects and get feedback",
        },
        {
            name: "IndieHackers",
            reason: "Community for indie hackers and bootstrapped founders",
        },
        { name: "SaaS", reason: "Software as a Service discussions" },
        { name: "startups", reason: "Startup discussions and advice" },
        { name: "productivity", reason: "Productivity and efficiency tips" },
        { name: "freelance", reason: "Freelancing and independent work" },
        { name: "webdev", reason: "Web development discussions" },
        { name: "programming", reason: "Programming discussions and help" },
    ];

    for (const alt of fallbackSubreddits) {
        try {
            const response = await fetch(
                `https://oauth.reddit.com/r/${alt.name}/about`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "User-Agent": "reddit-unbanr/1.0",
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    // Check rules for this fallback subreddit too
                    const rulesResponse = await fetch(
                        `https://oauth.reddit.com/r/${alt.name}/about/rules`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "User-Agent": "reddit-unbanr/1.0",
                            },
                        },
                    );

                    let hasConflictingRules = false;
                    if (rulesResponse.ok) {
                        const rulesData = await rulesResponse.json();
                        const altRules: SubredditRule[] = rulesData.rules || [];

                        // Check if this alternative subreddit has similar strict rules
                        const conflictingRules = detectStrictRules(altRules);
                        hasConflictingRules = conflictingRules.length > 0;
                    }

                    // Only add if it doesn't have conflicting rules
                    if (!hasConflictingRules) {
                        alternatives.push({
                            display_name: data.data.display_name,
                            public_description:
                                data.data.public_description ||
                                "No description available",
                            subscribers: data.data.subscribers || 0,
                            url: `https://reddit.com/r/${data.data.display_name}`,
                            reason: alt.reason,
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`Error fetching r/${alt.name}:`, error);
        }
    }

    return alternatives.sort((a, b) => b.subscribers - a.subscribers);
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

        const token = await getAccessToken();

        // First, fetch the rules for the current subreddit
        const rulesResponse = await fetch(
            `https://oauth.reddit.com/r/${subreddit}/about/rules`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "User-Agent": "reddit-unbanr/1.0",
                },
            },
        );

        if (!rulesResponse.ok) {
            return NextResponse.json(
                { error: "Failed to fetch subreddit rules" },
                { status: 500 },
            );
        }

        const rulesData = await rulesResponse.json();
        const rules: SubredditRule[] = rulesData.rules || [];

        // Detect strict rules
        const strictRules = detectStrictRules(rules);

        // If no strict rules detected, return empty array
        if (strictRules.length === 0) {
            return NextResponse.json([]);
        }

        // Get alternative subreddits using AI
        const alternatives = await getAlternativeSubredditsWithAI(
            title,
            body,
            subreddit,
            strictRules,
            token,
        );

        // If no alternatives found, still return the strict rules info
        if (alternatives.length === 0) {
            return NextResponse.json({
                strictRules,
                alternatives: [],
                message: `r/${subreddit} has strict rules that may prevent your post. Consider reviewing the subreddit rules before posting.`,
            });
        }

        return NextResponse.json({
            strictRules,
            alternatives,
            message: `r/${subreddit} has strict rules that may prevent your post. Here are some AI-suggested alternative subreddits where you might be able to share your content.`,
        });
    } catch (error) {
        console.error("Error fetching alternative subreddits:", error);
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
