import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        fullName: v.optional(v.string()),
        email: v.string(),
        role: v.optional(v.string()), // "user", "admin"
        isAdmin: v.optional(v.boolean()),
        createdAt: v.number(),
        updatedAt: v.number(),
        // Post tracking fields
        freePostsUsed: v.optional(v.number()),
        totalPurchasedPosts: v.optional(v.number()),
        unlimitedMonthlyExpiry: v.optional(v.number()),
        // LTD tracking fields
        ltdPlan: v.optional(v.string()), // "starter", "standard", "pro"
        ltdPurchaseDate: v.optional(v.number()), // When they bought LTD
        ltdMonthlyCredits: v.optional(v.number()), // Monthly credit allocation (20, 100, 500)
        ltdLastAllocationDate: v.optional(v.number()), // Last time monthly credits were added
        ltdRolloverCredits: v.optional(v.number()), // Unused credits that roll over
    }).index("by_clerk_id", ["clerkId"]),

    payments: defineTable({
        paymentId: v.string(),
        subscriptionId: v.optional(v.string()),
        userId: v.union(v.id("users"), v.null()),
        amount: v.number(), // Amount in cents
        currency: v.optional(v.string()),
        status: v.string(), // succeeded, failed, pending
        paymentMethod: v.optional(v.string()),
        customerEmail: v.optional(v.string()),
        customerName: v.optional(v.string()),
        paymentType: v.optional(v.string()), // one_time, subscription
        metadata: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
        // Post allocation tracking
        postsAllocated: v.optional(v.number()),
        planType: v.optional(v.string()), // "starter", "standard", "pro" for LTD plans
        // LTD-specific fields
        isLTD: v.optional(v.boolean()), // Is this an LTD purchase?
        ltdMonthlyCredits: v.optional(v.number()), // Monthly credits for this LTD plan
    })
        .index("by_payment_id", ["paymentId"])
        .index("by_user_id", ["userId"])
        .index("by_user_and_date", ["userId", "createdAt"]),

    posts: defineTable({
        userId: v.id("users"),
        title: v.string(),
        body: v.optional(v.string()),
        subreddit: v.optional(v.string()),
        status: v.optional(v.string()), // posted, failed, pending
        createdAt: v.number(),
        // Post type tracking
        postType: v.optional(
            v.union(
                v.literal("free"),
                v.literal("purchased"),
                v.literal("unlimited"),
            ),
        ),
        paymentId: v.optional(v.string()),
        // AI functionality tracking
        aiFeaturesUsed: v.optional(v.array(v.string())), // Array of feature names used
        totalCreditsSpent: v.optional(v.number()), // Total credits spent on this post
        aiAnalysisResults: v.optional(
            v.object({
                postAnalyzer: v.optional(v.string()),
                ruleChecker: v.optional(v.string()),
                betterSubreddits: v.optional(v.array(v.string())),
                anomalyDetection: v.optional(v.string()),
                flairSuggestions: v.optional(v.array(v.string())),
            }),
        ),
    })
        .index("by_user_id", ["userId"])
        .index("by_user_and_date", ["userId", "createdAt"]),
});
