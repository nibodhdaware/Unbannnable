import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper function to call Gemini
async function callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
        throw new Error("No content generated from Gemini");
    }

    return text;
}

// Create a new post (simplified - uses credits only)
export const createPost = mutation({
    args: {
        userId: v.id("users"),
        title: v.string(),
        body: v.optional(v.string()),
        subreddit: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Validate user exists
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        // Create the post
        const postId = await ctx.db.insert("posts", {
            userId: args.userId,
            title: args.title,
            body: args.body,
            subreddit: args.subreddit,
            status: args.status || "pending",
            createdAt: now,
        });

        console.log(`Created post for user ${args.userId}:`, {
            postId,
            title: args.title,
            subreddit: args.subreddit,
        });

        return postId;
    },
});

// Get user posts
export const getUserPosts = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        return await ctx.db
            .query("posts")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

// Get user post stats (simplified - only shows credits)
export const getUserPostStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            return {
                totalCredits: 0,
                postsCreated: 0,
                isAdmin: false,
                hasUnlimitedAccess: false,
            };
        }

        // Check if user is admin
        const isAdminUser =
            user.isAdmin === true || user.email === "nibod1248@gmail.com";

        // Count total posts
        const posts = await ctx.db
            .query("posts")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .collect();

        return {
            totalCredits: user.credits || 0,
            postsCreated: posts.length,
            isAdmin: isAdminUser,
            hasUnlimitedAccess: isAdminUser, // Only admins have unlimited access
        };
    },
});

// Check if user can create post (simplified - only checks credits or admin)
export const canUserCreatePost = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            return {
                canCreate: false,
                reason: "User not found",
            };
        }

        // Check if user is admin
        const isAdminUser =
            user.isAdmin === true || user.email === "nibod1248@gmail.com";

        if (isAdminUser) {
            return {
                canCreate: true,
                reason: "Admin - Unlimited access",
            };
        }

        const totalCredits = user.credits || 0;
        if (totalCredits > 0) {
            return {
                canCreate: true,
                reason: `${totalCredits} credits available`,
            };
        }

        return {
            canCreate: false,
            reason: "No credits available",
        };
    },
});

// AI Features - all deduct credits unless admin

export const usePostAnalyzer = action({
    args: {
        userId: v.id("users"),
        postId: v.id("posts"),
        title: v.string(),
        body: v.optional(v.string()),
        subreddit: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if user is admin
        const user = await ctx.runQuery(internal.users.getUserByIdInternal, {
            userId: args.userId,
        });
        const isAdmin =
            user?.isAdmin === true || user?.email === "nibod1248@gmail.com";

        // Deduct 10 credits if not admin (Post Analyzer costs 10 credits)
        if (!isAdmin) {
            await ctx.runMutation(internal.users.deductCreditsInternal, {
                userId: args.userId,
                credits: 10,
            });
        }

        // Build the prompt for post analysis
        const prompt = `Analyze this Reddit post for r/${args.subreddit || "general"}:

Title: ${args.title}
Body: ${args.body || "(no body)"}

Provide a comprehensive analysis including:
1. Overall quality score (1-10)
2. Title effectiveness and suggestions
3. Content clarity and engagement potential
4. Subreddit appropriateness
5. Potential issues or rule violations
6. Specific improvement recommendations

Format your response in a clear, actionable way.`;

        const analysis = await callGemini(prompt);

        // Update post with AI results
        await ctx.runMutation(internal.posts.updatePostAIFeatures, {
            postId: args.postId,
            featureName: "AI Post Analyzer",
            result: analysis,
            creditsSpent: isAdmin ? 0 : 10,
        });

        return analysis;
    },
});

export const useRuleChecker = action({
    args: {
        userId: v.id("users"),
        postId: v.id("posts"),
        title: v.string(),
        body: v.optional(v.string()),
        subreddit: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if user is admin
        const user = await ctx.runQuery(internal.users.getUserByIdInternal, {
            userId: args.userId,
        });
        const isAdmin =
            user?.isAdmin === true || user?.email === "nibod1248@gmail.com";

        // Deduct 5 credits if not admin (Rule Checker costs 5 credits)
        if (!isAdmin) {
            await ctx.runMutation(internal.users.deductCreditsInternal, {
                userId: args.userId,
                credits: 5,
            });
        }

        // Build the prompt for rule checking
        const prompt = `Check if this Reddit post follows typical subreddit rules for r/${args.subreddit}:

Title: ${args.title}
Body: ${args.body || "(no body)"}

Analyze for common Reddit posting rules including:
1. Title formatting requirements
2. Content policy compliance
3. Spam/self-promotion concerns
4. Flair requirements (if typical for this subreddit)
5. Any potential rule violations

Provide:
- A clear YES/NO on whether the post likely complies with rules
- List of potential issues if any
- Specific suggestions to fix any problems`;

        const rulesCheck = await callGemini(prompt);

        // Update post with AI results
        await ctx.runMutation(internal.posts.updatePostAIFeatures, {
            postId: args.postId,
            featureName: "Rule Checker",
            result: rulesCheck,
            creditsSpent: isAdmin ? 0 : 5,
        });

        return rulesCheck;
    },
});

export const findBetterSubreddits = action({
    args: {
        userId: v.id("users"),
        postId: v.id("posts"),
        title: v.string(),
        body: v.optional(v.string()),
        currentSubreddit: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if user is admin
        const user = await ctx.runQuery(internal.users.getUserByIdInternal, {
            userId: args.userId,
        });
        const isAdmin =
            user?.isAdmin === true || user?.email === "nibod1248@gmail.com";

        // Deduct 5 credits if not admin (Find Subreddits costs 5 credits)
        if (!isAdmin) {
            await ctx.runMutation(internal.users.deductCreditsInternal, {
                userId: args.userId,
                credits: 5,
            });
        }

        // Build the prompt for finding better subreddits
        const prompt = `Suggest the best subreddits for this Reddit post:

Title: ${args.title}
Body: ${args.body || "(no body)"}
${args.currentSubreddit ? `Currently targeting: r/${args.currentSubreddit}` : ""}

Provide 5-7 subreddit recommendations with:
1. Subreddit name (r/example)
2. Why it's a good fit
3. Estimated subscriber count/activity level
4. Any specific posting tips for that subreddit

Format as a numbered list. Focus on active communities where the post would get good engagement.`;

        const subreddits = await callGemini(prompt);

        // Update post with AI results
        await ctx.runMutation(internal.posts.updatePostAIFeatures, {
            postId: args.postId,
            featureName: "Better Subreddits",
            result: subreddits,
            creditsSpent: isAdmin ? 0 : 5,
        });

        return subreddits;
    },
});

export const detectAnomalies = action({
    args: {
        userId: v.id("users"),
        postId: v.id("posts"),
        title: v.string(),
        body: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if user is admin
        const user = await ctx.runQuery(internal.users.getUserByIdInternal, {
            userId: args.userId,
        });
        const isAdmin =
            user?.isAdmin === true || user?.email === "nibod1248@gmail.com";

        // Deduct 3 credits if not admin (Anomaly Detection costs 3 credits)
        if (!isAdmin) {
            await ctx.runMutation(internal.users.deductCreditsInternal, {
                userId: args.userId,
                credits: 3,
            });
        }

        // Build the prompt for anomaly detection
        const prompt = `Analyze this Reddit post for potential issues that could cause it to be removed or downvoted:

Title: ${args.title}
Body: ${args.body || "(no body)"}

Check for:
1. Clickbait or misleading title
2. Spam indicators
3. Controversial or inflammatory language
4. Grammar/spelling issues that hurt credibility
5. Formatting problems
6. Missing context that could confuse readers
7. Self-promotion red flags
8. Low-effort content indicators

Provide a risk assessment (Low/Medium/High) and specific recommendations to improve the post's chances of success.`;

        const analysis = await callGemini(prompt);

        // Update post with AI results
        await ctx.runMutation(internal.posts.updatePostAIFeatures, {
            postId: args.postId,
            featureName: "Anomaly Detection",
            result: analysis,
            creditsSpent: isAdmin ? 0 : 3,
        });

        return analysis;
    },
});

// Internal mutation to update post AI features
export const updatePostAIFeatures = internalMutation({
    args: {
        postId: v.id("posts"),
        featureName: v.string(),
        result: v.any(),
        creditsSpent: v.number(),
    },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error("Post not found");

        const currentFeatures = post.aiFeaturesUsed || [];
        const currentCredits = post.totalCreditsSpent || 0;
        const currentResults = post.aiAnalysisResults || {};

        // Map feature names to schema field names
        const featureKeyMap: Record<string, string> = {
            "AI Post Analyzer": "postAnalyzer",
            "Rule Checker": "ruleChecker",
            "Better Subreddits": "betterSubreddits",
            "Anomaly Detection": "anomalyDetection",
        };

        const schemaKey = featureKeyMap[args.featureName] || args.featureName;

        await ctx.db.patch(args.postId, {
            aiFeaturesUsed: [...currentFeatures, args.featureName],
            totalCreditsSpent: currentCredits + args.creditsSpent,
            aiAnalysisResults: {
                ...currentResults,
                [schemaKey]: args.result,
            },
        });
    },
});
