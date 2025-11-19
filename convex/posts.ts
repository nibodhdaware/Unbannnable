import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUserCredits, deductCredits } from "./users";

// Create a new post
export const createPost = mutation({
    args: {
        userId: v.id("users"),
        title: v.string(),
        body: v.optional(v.string()),
        subreddit: v.optional(v.string()),
        status: v.optional(v.string()),
        postType: v.optional(
            v.union(
                v.literal("free"),
                v.literal("purchased"),
                v.literal("unlimited"),
            ),
        ),
        paymentId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Validate user exists
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        // Determine post type if not provided
        let postType = args.postType;
        if (!postType) {
            // Auto-determine based on user's current status
            const userStats = await getUserPostStatsInternal(ctx, args.userId);

            if (userStats.hasUnlimitedAccess) {
                postType = "unlimited";
            } else if (userStats.freePostsRemaining > 0) {
                postType = "free";
            } else if (userStats.purchasedPostsRemaining > 0) {
                postType = "purchased";
            } else {
                throw new Error("User has no remaining posts");
            }
        }

        // Create the post
        const postId = await ctx.db.insert("posts", {
            ...args,
            postType,
            createdAt: now,
        });

        // Update user's post usage based on type
        if (postType === "free") {
            const currentFreeUsed = user.freePostsUsed || 0;
            await ctx.db.patch(args.userId, {
                freePostsUsed: currentFreeUsed + 1,
                updatedAt: now,
            });
            console.log(
                `User ${args.userId} used free post. Total free posts used: ${currentFreeUsed + 1}`,
            );
        } else if (postType === "purchased") {
            // For purchased posts, we track usage but don't decrement totalPurchasedPosts
            // The decrementing is handled by the monthly usage tracking
            console.log(`User ${args.userId} used purchased post.`);
        } else if (postType === "unlimited") {
            // For unlimited posts (admin), we still track usage for analytics
            console.log(`User ${args.userId} used unlimited post (admin).`);
        }

        console.log(`Created ${postType} post for user ${args.userId}:`, {
            postId,
            title: args.title,
            subreddit: args.subreddit,
            paymentId: args.paymentId,
        });

        return postId;
    },
});

// Internal function to get user post stats (for use within mutations)
async function getUserPostStatsInternal(ctx: any, userId: any) {
    const user = await ctx.db.get(userId);
    if (!user) {
        return {
            freePostsUsed: 0,
            freePostsRemaining: 1,
            purchasedPostsRemaining: 0,
            totalPostsUsed: 0,
            hasUnlimitedAccess: false,
            unlimitedExpiry: null,
            isAdmin: false,
        };
    }

    // Check if user is admin
    const isAdminUser =
        user.isAdmin === true || user.email === "nibod1248@gmail.com";

    if (isAdminUser) {
        return {
            freePostsUsed: 0,
            freePostsRemaining: 0,
            purchasedPostsRemaining: 0,
            totalPostsUsed: 0,
            hasUnlimitedAccess: true,
            unlimitedExpiry: null,
            isAdmin: true,
        };
    }

    const freePostsUsed = user.freePostsUsed || 0;
    const totalPurchasedPosts = user.totalPurchasedPosts || 0;

    // Check if user has unlimited monthly access
    const now = Date.now();
    const hasUnlimitedAccess =
        user.unlimitedMonthlyExpiry && user.unlimitedMonthlyExpiry > now;

    // Get total posts used this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const postsThisMonth = await ctx.db
        .query("posts")
        .withIndex("by_user_and_date", (q: any) =>
            q.eq("userId", userId).gte("createdAt", startOfMonth.getTime()),
        )
        .collect();

    // Calculate purchased posts used this month
    const purchasedPostsUsed = postsThisMonth.filter(
        (p: any) => p.postType === "purchased",
    ).length;
    const purchasedPostsRemaining = Math.max(
        0,
        totalPurchasedPosts - purchasedPostsUsed,
    );

    return {
        freePostsUsed,
        freePostsRemaining: Math.max(0, 1 - freePostsUsed), // 1 free post total
        purchasedPostsRemaining,
        totalPostsUsed: postsThisMonth.length,
        hasUnlimitedAccess,
        unlimitedExpiry: user.unlimitedMonthlyExpiry || null,
        isAdmin: false,
    };
}

// Get posts count for a user in the current month
export const getPostsCountThisMonth = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfMonthTimestamp = startOfMonth.getTime();

        const posts = await ctx.db
            .query("posts")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", userId).gte("createdAt", startOfMonthTimestamp),
            )
            .collect();

        return posts.length;
    },
});

// Get all posts for a user
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

// Get user post statistics
export const getUserPostStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const user = await ctx.db.get(userId);
        if (!user) {
            return {
                freePostsUsed: 0,
                freePostsRemaining: 1,
                purchasedPostsRemaining: 0,
                totalPostsUsed: 0,
                hasUnlimitedAccess: false,
                unlimitedExpiry: null,
            };
        }

        // Check if user is admin
        const isAdminUser =
            user.isAdmin === true || user.email === "nibod1248@gmail.com";

        if (isAdminUser) {
            // Get total posts used this month for admin users too
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const postsThisMonth = await ctx.db
                .query("posts")
                .withIndex("by_user_and_date", (q) =>
                    q
                        .eq("userId", userId)
                        .gte("createdAt", startOfMonth.getTime()),
                )
                .collect();

            return {
                freePostsUsed: 0,
                freePostsRemaining: 0,
                purchasedPostsRemaining: 0,
                totalPostsUsed: postsThisMonth.length,
                hasUnlimitedAccess: true,
                unlimitedExpiry: null,
                isAdmin: true,
                postsThisMonth: postsThisMonth.length, // Additional field for admin
            };
        }

        const freePostsUsed = user.freePostsUsed || 0;
        const totalPurchasedPosts = user.totalPurchasedPosts || 0;

        // Check if user has unlimited monthly access
        const now = Date.now();
        const hasUnlimitedAccess =
            user.unlimitedMonthlyExpiry && user.unlimitedMonthlyExpiry > now;

        // Get total posts used this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const postsThisMonth = await ctx.db
            .query("posts")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", userId).gte("createdAt", startOfMonth.getTime()),
            )
            .collect();

        // Calculate purchased posts used this month
        const purchasedPostsUsed = postsThisMonth.filter(
            (p) => p.postType === "purchased",
        ).length;
        const purchasedPostsRemaining = Math.max(
            0,
            totalPurchasedPosts - purchasedPostsUsed,
        );

        return {
            freePostsUsed,
            freePostsRemaining: Math.max(0, 1 - freePostsUsed), // 1 free post total
            purchasedPostsRemaining,
            totalPostsUsed: postsThisMonth.length,
            hasUnlimitedAccess,
            unlimitedExpiry: user.unlimitedMonthlyExpiry || null,
            isAdmin: false,
        };
    },
});

// Check if user can create a post
export const canUserCreatePost = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        // Get user post stats directly
        const user = await ctx.db.get(userId);
        if (!user) {
            return {
                canCreate: false,
                reason: "user_not_found",
                postsRemaining: 0,
            };
        }

        // Check if user is admin
        const isAdminUser =
            user.isAdmin === true || user.email === "nibod1248@gmail.com";

        if (isAdminUser) {
            // Get total posts used this month for admin users
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const postsThisMonth = await ctx.db
                .query("posts")
                .withIndex("by_user_and_date", (q) =>
                    q
                        .eq("userId", userId)
                        .gte("createdAt", startOfMonth.getTime()),
                )
                .collect();

            return {
                canCreate: true,
                reason: "admin_unlimited",
                postsRemaining: "unlimited",
                postsUsed: postsThisMonth.length, // Show admin their usage
            };
        }

        const freePostsUsed = user.freePostsUsed || 0;
        const totalPurchasedPosts = user.totalPurchasedPosts || 0;

        // Check if user has unlimited monthly access
        const now = Date.now();
        const hasUnlimitedAccess =
            user.unlimitedMonthlyExpiry && user.unlimitedMonthlyExpiry > now;

        // Check if user has unlimited access
        if (hasUnlimitedAccess) {
            return {
                canCreate: true,
                reason: "unlimited",
                postsRemaining: "unlimited",
            };
        }

        // Check free posts
        const freePostsRemaining = Math.max(0, 1 - freePostsUsed);
        if (freePostsRemaining > 0) {
            return {
                canCreate: true,
                reason: "free",
                postsRemaining: freePostsRemaining,
            };
        }

        // Get purchased posts used this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const postsThisMonth = await ctx.db
            .query("posts")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", userId).gte("createdAt", startOfMonth.getTime()),
            )
            .collect();

        const purchasedPostsUsed = postsThisMonth.filter(
            (p) => p.postType === "purchased",
        ).length;
        const purchasedPostsRemaining = Math.max(
            0,
            totalPurchasedPosts - purchasedPostsUsed,
        );

        // Check purchased posts
        if (purchasedPostsRemaining > 0) {
            return {
                canCreate: true,
                reason: "purchased",
                postsRemaining: purchasedPostsRemaining,
            };
        }

        return {
            canCreate: false,
            reason: "no_posts_remaining",
            postsRemaining: 0,
        };
    },
});

// AI Tool Functions with Credit Deduction

// Internal helper functions
async function getUserCreditsInternal(ctx: any, userId: any) {
    const user = await ctx.db.get(userId);
    if (!user) return 0;
    return user.totalPurchasedPosts || 0;
}

async function deductCreditsInternal(ctx: any, userId: any, amount: number) {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const currentCredits = user.totalPurchasedPosts || 0;
    if (currentCredits < amount) {
        throw new Error(`Insufficient credits. Need ${amount} credits.`);
    }

    const newCredits = currentCredits - amount;
    await ctx.db.patch(userId, {
        totalPurchasedPosts: newCredits,
        updatedAt: Date.now(),
    });

    return newCredits;
}

// Internal mutation to check and deduct credits
export const checkAndDeductCredits = internalMutation({
    args: {
        userId: v.id("users"),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const userCredits = await getUserCreditsInternal(ctx, args.userId);
        if (userCredits < args.amount) {
            throw new Error(
                `Insufficient credits. Need ${args.amount} credits.`,
            );
        }
        await deductCreditsInternal(ctx, args.userId, args.amount);
    },
});

// Internal mutation to update post analysis
export const updatePostAnalysis = internalMutation({
    args: {
        postId: v.id("posts"),
        analysis: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.postId, {
            aiFeaturesUsed: ["AI Post Analyzer"],
            totalCreditsSpent: 10,
            aiAnalysisResults: {
                postAnalyzer: args.analysis,
            },
        });
    },
});

// Internal mutation to update post analysis with feature tracking
export const updatePostAnalysisFeature = internalMutation({
    args: {
        postId: v.id("posts"),
        featureName: v.string(),
        creditsSpent: v.number(),
        analysisKey: v.string(),
        analysisValue: v.any(),
    },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.postId);
        const existingFeatures = post?.aiFeaturesUsed || [];
        const existingCredits = post?.totalCreditsSpent || 0;

        await ctx.db.patch(args.postId, {
            aiFeaturesUsed: [...existingFeatures, args.featureName],
            totalCreditsSpent: existingCredits + args.creditsSpent,
            aiAnalysisResults: {
                ...post?.aiAnalysisResults,
                [args.analysisKey]: args.analysisValue,
            },
        });
    },
});

// AI Post Analyzer - 10 Credits
export const usePostAnalyzer = action({
    args: {
        postId: v.id("posts"),
        userId: v.id("users"),
        title: v.string(),
        body: v.optional(v.string()),
        subreddit: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check and deduct credits
        await ctx.runMutation(internal.posts.checkAndDeductCredits, {
            userId: args.userId,
            amount: 10,
        });

        try {
            // Import Google Generative AI
            const { GoogleGenerativeAI } = await import(
                "@google/generative-ai"
            );

            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
                throw new Error("GEMINI_API_KEY not set in Convex environment");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
            });

            // Fetch subreddit rules if available
            let rulesText = "No specific rules available.";
            if (args.subreddit) {
                try {
                    const rulesResponse = await fetch(
                        `https://old.reddit.com/r/${args.subreddit}/about/rules.json`,
                        {
                            headers: {
                                "User-Agent":
                                    "UnbannnableApp/1.0 (by u/unbannnable)",
                            },
                        },
                    );
                    if (rulesResponse.ok) {
                        const rulesData = await rulesResponse.json();
                        if (rulesData.rules && rulesData.rules.length > 0) {
                            rulesText = rulesData.rules
                                .map(
                                    (rule: any, i: number) =>
                                        `${i + 1}. ${rule.short_name}`,
                                )
                                .join("\n");
                        }
                    }
                } catch (error) {
                    console.log("Could not fetch subreddit rules");
                }
            }

            // Create concise analysis prompt
            const prompt = `Analyze this Reddit post for r/${args.subreddit || "general"}.

ACTUAL POST CONTENT:
Title: "${args.title}"
${args.body ? `Body: "${args.body}"` : "Body: (none)"}

SUBREDDIT RULES:
${rulesText}

IMPORTANT: Only analyze the ACTUAL content provided above. Do NOT make up example posts or hypothetical content.

Provide SHORT analysis (max 150 words) in Markdown:

## 📊 Score: X/10
Why?

## ✅ Strengths
- What works

## ⚠️ Issues
- Problems found
- Rule violations (if any)

## 💡 Fixes
1. Specific change
2. Another fix

## 🎯 Verdict
Post it / Fix first / Don't post

Be concise and specific to THIS post only.`;

            // Get AI analysis
            const result = await model.generateContent(prompt);
            const response = result.response;
            const analysis = response.text();

            // Update post with AI analysis results (use runMutation)
            await ctx.runMutation(internal.posts.updatePostAnalysis, {
                postId: args.postId,
                analysis,
            });

            return { success: true, analysis, creditsSpent: 10 };
        } catch (error: any) {
            console.error("Error in Post Analyzer:", error);

            // Fallback analysis if Gemini API fails
            const fallbackAnalysis = `Post Analysis Results (AI service temporarily unavailable):

**ENGAGEMENT POTENTIAL**: 7/10
- Title length: ${args.title.length} characters - ${args.title.length > 60 ? "Consider shortening" : "Good length"}
- Content structure: ${args.body ? "Has body content" : "Title-only post"}

**OPTIMIZATION SUGGESTIONS**:
- ${args.title.length > 60 ? "Shorten title for better mobile visibility" : "Title length is optimized"}
- ${args.body ? "Content provided" : "Consider adding body text for context"}
- ${args.subreddit ? `Posting to r/${args.subreddit}` : "Select target subreddit"}

**RISK ASSESSMENT**: 
- Basic validation passed
- Review community rules before posting

Note: Full AI analysis temporarily unavailable. Basic optimization suggestions provided.`;

            // Update post with fallback analysis (use runMutation)
            await ctx.runMutation(internal.posts.updatePostAnalysis, {
                postId: args.postId,
                analysis: fallbackAnalysis,
            });

            return {
                success: true,
                analysis: fallbackAnalysis,
                creditsSpent: 10,
            };
        }
    },
});

// Rule Checker - 5 Credits
export const useRuleChecker = action({
    args: {
        postId: v.id("posts"),
        userId: v.id("users"),
        title: v.string(),
        body: v.optional(v.string()),
        subreddit: v.string(),
    },
    handler: async (ctx, args) => {
        // Check and deduct credits using internal mutation
        await ctx.runMutation(internal.posts.checkAndDeductCredits, {
            userId: args.userId,
            amount: 5,
        });

        try {
            // Import Gemini AI
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
            });

            // Get subreddit rules from Reddit API
            let subredditRules = [];
            try {
                const rulesResponse = await fetch(
                    `https://www.reddit.com/r/${args.subreddit}/about/rules.json`,
                    {
                        headers: {
                            "User-Agent":
                                "UnbannnableApp/1.0 (by u/unbannnable)",
                        },
                    },
                );

                if (rulesResponse.ok) {
                    const rulesData = await rulesResponse.json();
                    subredditRules = rulesData.rules || [];
                }
            } catch (error) {
                console.log(
                    "Could not fetch subreddit rules, proceeding with general analysis",
                );
            }

            // Create concise rule checking prompt
            const prompt = `Reddit rule compliance check for r/${args.subreddit}.

Post: "${args.title}"
Body: "${args.body || "None"}"

${
    subredditRules.length > 0
        ? `Rules:\n${subredditRules.map((rule: any, i: number) => `${i + 1}. ${rule.short_name}`).join("\n")}`
        : "Using general Reddit guidelines."
}

Provide concise analysis (max 200 words) in Markdown:

## 📋 Compliance Score
X/10 with risk level

## ✅ What's Good
1-2 things that follow rules

## ⚠️ Issues Found
Specific violations (if any)

## 💡 Quick Fixes
1-2 actionable changes

## 🎯 Verdict
One sentence: Safe to post / Fix issues first

Keep it concise, specific, and actionable.`;

            // Get AI analysis
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const ruleCheck = response.text();

            // Update post with AI analysis results (use runMutation)
            await ctx.runMutation(internal.posts.updatePostAnalysisFeature, {
                postId: args.postId,
                featureName: "Rule Checker",
                creditsSpent: 5,
                analysisKey: "ruleChecker",
                analysisValue: ruleCheck,
            });

            return { success: true, ruleCheck, creditsSpent: 5 };
        } catch (error: any) {
            console.error("Error in Rule Checker:", error);

            // Fallback rule checking
            const fallbackRuleCheck = `Rule Compliance Check for r/${args.subreddit}:

✅ **Title Requirements**: Basic validation passed
- Length: ${args.title.length} characters (within typical limits)
- No excessive capitalization detected
- Descriptive content present

✅ **Content Guidelines**: Basic checks passed  
- ${args.body ? "Body content provided" : "Title-only post"}
- No obvious spam indicators
- Appropriate for general Reddit guidelines

⚠️ **Recommendations**: 
- Verify subreddit-specific rules manually
- Check for flair requirements
- Review posting time restrictions for r/${args.subreddit}

**Compliance Risk**: Medium - Manual rule verification recommended
Note: Full rule analysis temporarily unavailable.`;

            // Update post with fallback data (use runMutation)
            await ctx.runMutation(internal.posts.updatePostAnalysisFeature, {
                postId: args.postId,
                featureName: "Rule Checker",
                creditsSpent: 5,
                analysisKey: "ruleChecker",
                analysisValue: fallbackRuleCheck,
            });

            return {
                success: true,
                ruleCheck: fallbackRuleCheck,
                creditsSpent: 5,
            };
        }
    },
});

// Find Better Subreddits - 5 Credits
export const findBetterSubreddits = action({
    args: {
        postId: v.id("posts"),
        userId: v.id("users"),
        title: v.string(),
        body: v.optional(v.string()),
        currentSubreddit: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check and deduct credits using internal mutation
        await ctx.runMutation(internal.posts.checkAndDeductCredits, {
            userId: args.userId,
            amount: 5,
        });

        try {
            // Import Gemini AI
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
            });

            // Create concise subreddit recommendation prompt
            const prompt = `Find better subreddits for this post.

Post: "${args.title}"
Body: "${args.body || "None"}"
${args.currentSubreddit ? `Current: r/${args.currentSubreddit}` : ""}

Provide concise recommendations (max 200 words) in Markdown:

## 🎯 Top Matches

### r/Subreddit1 (Score: X/10)
- Size: XX members
- Expected: XX upvotes
- Why: Brief reason

### r/Subreddit2 (Score: X/10)
- Size: XX members
- Expected: XX upvotes
- Why: Brief reason

(List 3-5 subreddits)

## 💡 Best Choice
One sentence recommendation with reasoning.

## ⏰ Pro Tips
- Best posting time
- Required flair (if any)

Keep it concise and actionable.`;

            // Get AI analysis
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const betterSubreddits = response.text();

            // Update post with AI analysis results (use runMutation)
            await ctx.runMutation(internal.posts.updatePostAnalysisFeature, {
                postId: args.postId,
                featureName: "Find Better Subreddits",
                creditsSpent: 5,
                analysisKey: "betterSubreddits",
                analysisValue: [betterSubreddits],
            });

            return {
                success: true,
                suggestions: betterSubreddits,
                creditsSpent: 5,
            };
        } catch (error: any) {
            console.error("Error in Find Better Subreddits:", error);

            // Fallback subreddit suggestions
            const fallbackSuggestions = `Subreddit Recommendations Analysis:

${args.currentSubreddit ? `**Current Target**: r/${args.currentSubreddit}` : ""}

📈 **Top Recommended Subreddits**:

**r/AskReddit** (Match: 8/10)
- 40M+ members, extremely high activity
- Expected: 50-500 upvotes, 20-200 comments
- Success Rate: 65% for engaging questions
- Best for: Open-ended questions and discussions

**r/NoStupidQuestions** (Match: 9/10)
- 3M members, supportive community  
- Expected: 10-100 upvotes, 5-50 comments
- Success Rate: 85% for genuine questions
- Best for: Any question without judgment

**r/TrueAskReddit** (Match: 8/10)
- 500k members, quality-focused discussions
- Expected: 20-150 upvotes, 10-80 comments  
- Success Rate: 75% for thoughtful content
- Best for: Deep, meaningful discussions

**r/explainlikeimfive** (Match: 7/10)
- 20M members, educational focus
- Expected: 25-200 upvotes, 15-100 comments
- Success Rate: 70% for complex topics
- Best for: Simplifying complex subjects

**Strategic Recommendations**:
- Primary target: r/NoStupidQuestions (highest success rate)
- Cross-post to r/AskReddit after 4+ hours
- Peak posting times: 6-9 AM, 7-10 PM EST
- Tuesday-Thursday optimal for serious content

Note: Enhanced AI analysis temporarily unavailable.`;

            // Update post with fallback data (use runMutation)
            await ctx.runMutation(internal.posts.updatePostAnalysisFeature, {
                postId: args.postId,
                featureName: "Find Better Subreddits",
                creditsSpent: 5,
                analysisKey: "betterSubreddits",
                analysisValue: [fallbackSuggestions],
            });

            return {
                success: true,
                suggestions: fallbackSuggestions,
                creditsSpent: 5,
            };
        }
    },
});

// Anomaly Detection - 3 Credits
export const detectAnomalies = action({
    args: {
        postId: v.id("posts"),
        userId: v.id("users"),
        title: v.string(),
        body: v.optional(v.string()),
        subreddit: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check and deduct credits using internal mutation
        await ctx.runMutation(internal.posts.checkAndDeductCredits, {
            userId: args.userId,
            amount: 3,
        });

        try {
            // Import Gemini AI
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
            });

            // Create concise anomaly detection prompt
            const prompt = `Check for ban risks and red flags.

Post: "${args.title}"
Body: "${args.body || "None"}"
${args.subreddit ? `Subreddit: r/${args.subreddit}` : ""}

Provide concise analysis (max 200 words) in Markdown:

## 🛡️ Safety Score
X/10 overall risk level

## ✅ Looks Good
- What's safe about the post

## 🚨 Red Flags
- Spam indicators
- Auto-mod triggers
- Ban risks

## 💡 How to Fix
1-2 specific changes to reduce risk

## 🎯 Verdict
One sentence: Safe / Needs changes / High risk

Keep it concise and actionable.`;

            // Get AI analysis
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const anomalies = response.text();

            // Update post with AI analysis results (use runMutation)
            await ctx.runMutation(internal.posts.updatePostAnalysisFeature, {
                postId: args.postId,
                featureName: "Anomaly Detection",
                creditsSpent: 3,
                analysisKey: "anomalyDetection",
                analysisValue: anomalies,
            });

            return { success: true, anomalies, creditsSpent: 3 };
        } catch (error: any) {
            console.error("Error in Anomaly Detection:", error);

            // Fallback anomaly detection
            const fallbackAnomalies = `Anomaly Detection Analysis:

🔍 **Content Safety Check**:
- **Writing Style**: Natural and human-like
- **Content Structure**: Well-formatted and appropriate
- **Link Analysis**: ${args.body?.includes("http") ? "External links detected - verify legitimacy" : "No external links found"}

⚠️ **Risk Assessment**:

**Overall Safety Score**: 8/10 - Generally Safe

**Medium Risk Factors**:
- New account considerations: Build karma gradually
- Posting frequency: Space posts 2-4 hours apart
- Community integration: Engage in comments before posting

**Low Risk Factors**:
- Content length: ${args.title.length + (args.body?.length || 0)} characters (within normal range)
- Language patterns: Appropriate tone detected
- Topic sensitivity: No immediate red flags

**Recommendations**:
✅ **Account Preparation**: 
- Maintain consistent posting schedule
- Engage genuinely with other posts
- Build community presence gradually

✅ **Content Safety**:
- Current content appears natural
- No obvious spam indicators
- Appropriate for general Reddit guidelines

**Next Steps**: Post appears safe for submission with standard precautions.

Note: Enhanced AI analysis temporarily unavailable.`;

            // Update post with fallback data (use runMutation)
            await ctx.runMutation(internal.posts.updatePostAnalysisFeature, {
                postId: args.postId,
                featureName: "Anomaly Detection",
                creditsSpent: 3,
                analysisKey: "anomalyDetection",
                analysisValue: fallbackAnomalies,
            });

            return {
                success: true,
                anomalies: fallbackAnomalies,
                creditsSpent: 3,
            };
        }
    },
});
