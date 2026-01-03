import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt for email personalization
const SYSTEM_PROMPT = `You are writing a friendly, helpful email for Unbannnable, a SaaS product that helps Reddit users check their posts before submitting to avoid getting banned or having posts removed.

Your role is to add a personalized touch to email templates based on user data.

Guidelines:
- Be concise, warm, and action-oriented
- Never use corporate jargon
- Match a casual, friendly tone like you're talking to a friend
- Keep responses to 1-3 sentences max
- Reference specific data points when available (subreddits, usage patterns, etc.)
- Be encouraging without being cheesy
- Don't repeat information that's already in the email template
- Focus on providing unique value or insight

IMPORTANT: Only output the personalized content snippet, nothing else. No quotes, no formatting, just the raw text.`;

// Personalization types
export type EmailType =
    | "welcome"
    | "first_use_nudge"
    | "value_reinforcement"
    | "upgrade_prompt"
    | "re_engagement";

export interface UserStats {
    totalPostsChecked: number;
    topSubreddits: string[];
    peakHour: number | null;
    isPowerUser: boolean;
    isActiveUser: boolean;
    currentCredits: number;
    hasLifetimePlan: boolean;
    lifetimePlan?: string;
    daysSinceSignup: number;
    fullName?: string;
}

interface PersonalizationPrompt {
    emailType: EmailType;
    userStats: UserStats;
}

// Generate prompts for each email type
function getPersonalizationPrompt(params: PersonalizationPrompt): string {
    const { emailType, userStats } = params;
    const subreddits =
        userStats.topSubreddits.length > 0
            ? userStats.topSubreddits.map((s) => `r/${s}`).join(", ")
            : "various subreddits";

    const timeOfDay =
        userStats.peakHour !== null
            ? getTimeOfDayLabel(userStats.peakHour)
            : null;

    switch (emailType) {
        case "welcome":
            return `Generate a brief personalized welcome message for a new Unbannnable user.
User info:
- Name: ${userStats.fullName || "Unknown"}
- Starting credits: ${userStats.currentCredits}
${userStats.topSubreddits.length > 0 ? `- They seem interested in: ${subreddits}` : ""}

Add something that makes them feel special or gives them a quick tip to get started. Keep it to 1-2 sentences.`;

        case "first_use_nudge":
            return `Generate a personalized nudge for a user who signed up 2 days ago but hasn't used the product yet.
User info:
- Name: ${userStats.fullName || "Unknown"}
- Days since signup: ${userStats.daysSinceSignup}
- Has not checked any posts yet

Offer a specific suggestion or ask a question that might help them get started. Be helpful, not pushy. Keep it to 1-2 sentences.`;

        case "value_reinforcement":
            return `Generate a personalized congratulations for an active user.
User info:
- Name: ${userStats.fullName || "Unknown"}
- Posts checked: ${userStats.totalPostsChecked}
- Most active subreddits: ${subreddits}
${timeOfDay ? `- Usually active in the ${timeOfDay}` : ""}
- Is power user: ${userStats.isPowerUser}

Give them a personalized tip or insight based on their usage. Keep it to 1-2 sentences.`;

        case "upgrade_prompt":
            return `Generate a personalized upgrade suggestion for a user running low on credits.
User info:
- Name: ${userStats.fullName || "Unknown"}
- Current credits: ${userStats.currentCredits}
- Posts checked: ${userStats.totalPostsChecked}
- Most active subreddits: ${subreddits}
${userStats.isPowerUser ? "- They're a power user who checks frequently" : ""}

Suggest why upgrading would benefit them specifically based on their usage. Keep it to 1-2 sentences. Don't mention specific prices.`;

        case "re_engagement":
            return `Generate a personalized re-engagement message for an inactive user.
User info:
- Name: ${userStats.fullName || "Unknown"}
- Days since last activity: ${userStats.daysSinceSignup - (userStats.totalPostsChecked > 0 ? 7 : 0)}
- Previous posts checked: ${userStats.totalPostsChecked}
- Previously active in: ${subreddits}

Welcome them back and give them a reason to return based on their previous activity. Be warm and non-judgmental. Keep it to 1-2 sentences.`;

        default:
            return "Generate a brief, friendly message for an Unbannnable user.";
    }
}

// Helper to convert hour to time of day label
function getTimeOfDayLabel(hour: number): string {
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
}

/**
 * Generate personalized email content using Claude Haiku
 */
export async function generatePersonalizedContent(
    emailType: EmailType,
    userStats: UserStats,
): Promise<string | null> {
    try {
        const prompt = getPersonalizationPrompt({ emailType, userStats });

        const message = await anthropic.messages.create({
            model: "claude-haiku-4-5-20250514",
            max_tokens: 150,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            system: SYSTEM_PROMPT,
        });

        // Extract text from response
        const textBlock = message.content.find(
            (block) => block.type === "text",
        );
        if (!textBlock || textBlock.type !== "text") {
            console.error("No text content in Claude response");
            return null;
        }

        return textBlock.text.trim();
    } catch (error) {
        console.error("Error generating personalized content:", error);
        return null;
    }
}

/**
 * Get personalized content with caching
 * Checks cache first, generates new content if not found or expired
 */
export async function getPersonalizedEmailContent(
    emailType: EmailType,
    userStats: UserStats,
    cachedContent?: {
        content: string;
        generatedAt: number;
        expiresAt: number;
    } | null,
): Promise<string | null> {
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    // Check if cached content is still valid
    if (cachedContent && cachedContent.expiresAt > now) {
        console.log("Using cached personalized content");
        return cachedContent.content;
    }

    // Generate new content
    console.log("Generating new personalized content");
    const content = await generatePersonalizedContent(emailType, userStats);

    if (content) {
        return content;
    }

    // Fallback: return null (template will use static content)
    return null;
}

/**
 * Batch generate personalized content for multiple users
 * Used for efficiency when processing email triggers
 */
export async function batchGeneratePersonalizedContent(
    requests: Array<{
        emailType: EmailType;
        userStats: UserStats;
        userId: string;
    }>,
): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();

    // Process in parallel with concurrency limit
    const CONCURRENCY = 5;

    for (let i = 0; i < requests.length; i += CONCURRENCY) {
        const batch = requests.slice(i, i + CONCURRENCY);
        const promises = batch.map(async (req) => {
            const content = await generatePersonalizedContent(
                req.emailType,
                req.userStats,
            );
            return { userId: req.userId, content };
        });

        const batchResults = await Promise.all(promises);
        batchResults.forEach(({ userId, content }) => {
            results.set(userId, content);
        });

        // Small delay between batches to avoid rate limiting
        if (i + CONCURRENCY < requests.length) {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }

    return results;
}

// Export for testing
export { getPersonalizationPrompt, getTimeOfDayLabel };
