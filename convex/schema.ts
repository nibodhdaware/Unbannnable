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
    }).index("by_clerk_id", ["clerkId"]),

    subscriptions: defineTable({
        subscriptionId: v.string(),
        customerId: v.optional(v.string()),
        userId: v.id("users"),
        clerkId: v.optional(v.string()),
        email: v.string(),
        status: v.string(), // active, on_hold, failed, cancelled
        productId: v.string(),
        amount: v.number(), // Amount in cents
        currency: v.optional(v.string()),
        lastRenewalAt: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_subscription_id", ["subscriptionId"])
        .index("by_user_id", ["userId"]),

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
    })
        .index("by_user_id", ["userId"])
        .index("by_user_and_date", ["userId", "createdAt"]),
});
