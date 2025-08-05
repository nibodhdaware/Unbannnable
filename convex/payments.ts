import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a payment record
export const createPayment = mutation({
    args: {
        paymentId: v.string(),
        subscriptionId: v.optional(v.string()),
        userId: v.id("users"),
        amount: v.number(),
        currency: v.optional(v.string()),
        status: v.string(),
        paymentMethod: v.optional(v.string()),
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
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfMonthTimestamp = startOfMonth.getTime();

        return await ctx.db
            .query("payments")
            .withIndex("by_user_and_date", (q) =>
                q.eq("userId", userId).gte("createdAt", startOfMonthTimestamp),
            )
            .filter((q) => q.eq(q.field("status"), "succeeded"))
            .collect();
    },
});

// Get payment by payment ID
export const getPaymentById = query({
    args: { paymentId: v.string() },
    handler: async (ctx, { paymentId }) => {
        return await ctx.db
            .query("payments")
            .withIndex("by_payment_id", (q) => q.eq("paymentId", paymentId))
            .first();
    },
});
