import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a new post
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
        return await ctx.db.insert("posts", {
            ...args,
            createdAt: now,
        });
    },
});

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
