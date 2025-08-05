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
