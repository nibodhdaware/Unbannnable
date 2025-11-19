import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

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

        // Deduct 1 credit if not admin
        if (!isAdmin) {
            await ctx.runMutation(internal.users.deductCreditsInternal, {
                userId: args.userId,
                credits: 1,
            });
        }

        // Call external AI API
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/analyze-post`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: args.title,
                    body: args.body,
                    subreddit: args.subreddit,
                }),
            },
        );

        if (!response.ok) {
            throw new Error("Failed to analyze post");
        }

        const analysis = await response.json();

        // Update post with AI results
        await ctx.runMutation(internal.posts.updatePostAIFeatures, {
            postId: args.postId,
            featureName: "AI Post Analyzer",
            result: analysis.analysis,
            creditsSpent: isAdmin ? 0 : 1,
        });

        return analysis.analysis;
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

        // Deduct 1 credit if not admin
        if (!isAdmin) {
            await ctx.runMutation(internal.users.deductCreditsInternal, {
                userId: args.userId,
                credits: 1,
            });
        }

        // Call external AI API
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/check-rules`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: args.title,
                    body: args.body,
                    subreddit: args.subreddit,
                }),
            },
        );

        if (!response.ok) {
            throw new Error("Failed to check rules");
        }

        const result = await response.json();

        // Update post with AI results
        await ctx.runMutation(internal.posts.updatePostAIFeatures, {
            postId: args.postId,
            featureName: "Rule Checker",
            result: result.rulesCheck,
            creditsSpent: isAdmin ? 0 : 1,
        });

        return result.rulesCheck;
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

        // Deduct 1 credit if not admin
        if (!isAdmin) {
            await ctx.runMutation(internal.users.deductCreditsInternal, {
                userId: args.userId,
                credits: 1,
            });
        }

        // Call external AI API
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/find-subreddits`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: args.title,
                    body: args.body,
                    currentSubreddit: args.currentSubreddit,
                }),
            },
        );

        if (!response.ok) {
            throw new Error("Failed to find subreddits");
        }

        const result = await response.json();

        // Update post with AI results
        await ctx.runMutation(internal.posts.updatePostAIFeatures, {
            postId: args.postId,
            featureName: "Better Subreddits",
            result: result.subreddits,
            creditsSpent: isAdmin ? 0 : 1,
        });

        return result.subreddits;
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

        // Deduct 1 credit if not admin
        if (!isAdmin) {
            await ctx.runMutation(internal.users.deductCreditsInternal, {
                userId: args.userId,
                credits: 1,
            });
        }

        // Call external AI API
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/detect-anomalies`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: args.title,
                    body: args.body,
                }),
            },
        );

        if (!response.ok) {
            throw new Error("Failed to detect anomalies");
        }

        const result = await response.json();

        // Update post with AI results
        await ctx.runMutation(internal.posts.updatePostAIFeatures, {
            postId: args.postId,
            featureName: "Anomaly Detection",
            result: result.analysis,
            creditsSpent: isAdmin ? 0 : 1,
        });

        return result.analysis;
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

        await ctx.db.patch(args.postId, {
            aiFeaturesUsed: [...currentFeatures, args.featureName],
            totalCreditsSpent: currentCredits + args.creditsSpent,
            aiAnalysisResults: {
                ...currentResults,
                [args.featureName.toLowerCase().replace(/ /g, "")]: args.result,
            },
        });
    },
});
