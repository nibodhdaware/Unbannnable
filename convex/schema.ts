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
        planType: v.optional(v.string()),
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
    })
        .index("by_user_id", ["userId"])
        .index("by_user_and_date", ["userId", "createdAt"]),
});
