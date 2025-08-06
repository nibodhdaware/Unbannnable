import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a payment record
export const createPayment = mutation({
    args: {
        paymentId: v.string(),
        subscriptionId: v.optional(v.string()),
        userId: v.union(v.id("users"), v.null()),
        amount: v.number(),
        currency: v.optional(v.string()),
        status: v.string(),
        paymentMethod: v.optional(v.string()),
        customerEmail: v.optional(v.string()),
        customerName: v.optional(v.string()),
        paymentType: v.optional(v.string()),
        metadata: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("payments", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

// Get active payments for a user in the current month
export const getActivePaymentsThisMonth = query({
    args: { userId: v.union(v.id("users"), v.null()) },
    handler: async (ctx, { userId }) => {
        if (!userId) return [];

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfMonthTimestamp = startOfMonth.getTime();

        return await ctx.db
            .query("payments")
            .filter((q) =>
                q.and(
                    q.eq(q.field("userId"), userId),
                    q.gte(q.field("createdAt"), startOfMonthTimestamp),
                    q.eq(q.field("status"), "succeeded"),
                ),
            )
            .collect();
    },
});

// Get payment by payment ID
export const getPaymentByPaymentId = query({
    args: { paymentId: v.string() },
    handler: async (ctx, { paymentId }) => {
        return await ctx.db
            .query("payments")
            .filter((q) => q.eq(q.field("paymentId"), paymentId))
            .first();
    },
});

// Allocate posts from a successful payment
export const allocatePostsFromPayment = mutation({
    args: {
        paymentId: v.string(),
        userId: v.id("users"),
        planType: v.string(),
    },
    handler: async (ctx, { paymentId, userId, planType }) => {
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        let postsToAdd = 0;
        let setUnlimitedExpiry = false;

        // Determine posts based on plan type
        switch (planType) {
            case "onePost":
                postsToAdd = 1;
                break;
            case "fivePosts":
                postsToAdd = 5;
                break;
            case "fifteenPosts":
            case "unlimited_monthly_1499":
                // Set unlimited access for 30 days
                setUnlimitedExpiry = true;
                break;
            default:
                throw new Error("Unknown plan type");
        }

        // Update user's purchased posts or unlimited access
        const updates: any = {
            updatedAt: Date.now(),
        };

        if (setUnlimitedExpiry) {
            const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;
            updates.unlimitedMonthlyExpiry = thirtyDaysFromNow;
        } else {
            const currentPurchased = user.totalPurchasedPosts || 0;
            updates.totalPurchasedPosts = currentPurchased + postsToAdd;
        }

        await ctx.db.patch(userId, updates);

        // Update payment record with allocation info
        const payment = await ctx.db
            .query("payments")
            .filter((q) => q.eq(q.field("paymentId"), paymentId))
            .first();

        if (payment) {
            await ctx.db.patch(payment._id, {
                postsAllocated: setUnlimitedExpiry ? -1 : postsToAdd, // -1 for unlimited
                planType,
                updatedAt: Date.now(),
            });
        }

        return { postsAdded: postsToAdd, unlimitedAccess: setUnlimitedExpiry };
    },
});
