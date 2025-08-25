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
            case "tenPosts":
                postsToAdd = 10;
                break;
            case "fiftyPosts":
                postsToAdd = 50;
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
            console.log(
                "Setting unlimited access until:",
                new Date(thirtyDaysFromNow).toISOString(),
            );
        } else {
            const currentPurchased = user.totalPurchasedPosts || 0;
            updates.totalPurchasedPosts = currentPurchased + postsToAdd;
            console.log(
                `Adding ${postsToAdd} posts to user. Previous: ${currentPurchased}, New total: ${currentPurchased + postsToAdd}`,
            );
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
            console.log("Updated payment record with allocation info:", {
                paymentId,
                postsAllocated: setUnlimitedExpiry ? -1 : postsToAdd,
                planType,
            });
        }

        return {
            postsAdded: postsToAdd,
            unlimitedAccess: setUnlimitedExpiry,
            userTotalPosts: setUnlimitedExpiry
                ? "unlimited"
                : (user.totalPurchasedPosts || 0) + postsToAdd,
            expiryDate: setUnlimitedExpiry
                ? Date.now() + 30 * 24 * 60 * 60 * 1000
                : null,
        };
    },
});

// Get user payment history with details
export const getUserPaymentHistory = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const payments = await ctx.db
            .query("payments")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();

        return payments.map((payment) => ({
            ...payment,
            createdAtDate: new Date(payment.createdAt).toISOString(),
            amountDollars: (payment.amount / 100).toFixed(2),
        }));
    },
});

// Validate payment ownership
export const validatePaymentOwnership = query({
    args: {
        paymentId: v.string(),
        userEmail: v.string(),
        isAdmin: v.optional(v.boolean()),
    },
    handler: async (ctx, { paymentId, userEmail, isAdmin = false }) => {
        const payment = await ctx.db
            .query("payments")
            .filter((q) => q.eq(q.field("paymentId"), paymentId))
            .first();

        if (!payment) {
            return { isValid: false, reason: "payment_not_found" };
        }

        // Check if payment belongs to user or user is admin
        const isOwner = payment.customerEmail === userEmail;
        const hasAccess = isOwner || isAdmin;

        return {
            isValid: hasAccess,
            reason: hasAccess ? "authorized" : "not_owner",
            payment: hasAccess ? payment : null,
        };
    },
});

// Comprehensive database sync function for payments
export const syncPaymentToDatabase = mutation({
    args: {
        paymentId: v.string(),
        userId: v.id("users"),
        paymentData: v.any(), // Full payment data from DodoPay
        userEmail: v.string(),
        userName: v.optional(v.string()),
    },
    handler: async (
        ctx,
        { paymentId, userId, paymentData, userEmail, userName },
    ) => {
        const now = Date.now();

        // Check if payment already exists
        const existingPayment = await ctx.db
            .query("payments")
            .filter((q) => q.eq(q.field("paymentId"), paymentId))
            .first();

        let paymentRecord;

        if (!existingPayment) {
            // Create new payment record
            const paymentRecordId = await ctx.db.insert("payments", {
                paymentId: paymentData.payment_id || paymentId,
                subscriptionId: paymentData.subscription_id,
                userId: userId,
                amount: paymentData.total_amount || paymentData.amount || 0,
                currency: paymentData.currency || "USD",
                status: paymentData.status || "succeeded",
                paymentMethod: "dodo",
                customerEmail: paymentData.customer?.email || userEmail,
                customerName: paymentData.customer?.name || userName || "",
                paymentType: paymentData.subscription_id
                    ? "subscription"
                    : "one_time",
                metadata: JSON.stringify({
                    ...paymentData.metadata,
                    clerk_user_id: userId,
                    processed_at: new Date().toISOString(),
                    product_cart: paymentData.product_cart,
                    settlement_amount: paymentData.settlement_amount,
                    tax: paymentData.tax,
                    created_via: "reddit_unbanr_app",
                }),
                createdAt: now,
                updatedAt: now,
            });

            paymentRecord = await ctx.db.get(paymentRecordId);
        } else {
            paymentRecord = existingPayment;
        }

        // Allocate posts if not already done
        if (
            paymentRecord &&
            (!existingPayment || !existingPayment.postsAllocated)
        ) {
            const amount = paymentRecord.amount;
            let planType = "onePost";

            // Determine plan type from amount
            if (amount === 1) planType = "onePost";
            else if (amount === 500) planType = "tenPosts";
            else if (amount === 1500) planType = "fiftyPosts";
            else if (amount === 699) planType = "fivePosts";
            else if (amount === 999)
                planType = "fivePosts"; // Mock payments
            else if (amount === 1499) planType = "unlimited_monthly_1499";

            try {
                // Call the post allocation function directly
                const user = await ctx.db.get(userId);
                if (!user) throw new Error("User not found");

                let postsToAdd = 0;
                let setUnlimitedExpiry = false;

                // Determine posts based on plan type
                switch (planType) {
                    case "onePost":
                        postsToAdd = 1;
                        break;
                    case "tenPosts":
                        postsToAdd = 10;
                        break;
                    case "fiftyPosts":
                        postsToAdd = 50;
                        break;
                    case "fivePosts":
                        postsToAdd = 5;
                        break;
                    case "fifteenPosts":
                    case "unlimited_monthly_1499":
                        setUnlimitedExpiry = true;
                        break;
                    default:
                        throw new Error("Unknown plan type");
                }

                // Update user's purchased posts or unlimited access
                const updates: any = {
                    updatedAt: now,
                };

                if (setUnlimitedExpiry) {
                    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;
                    updates.unlimitedMonthlyExpiry = thirtyDaysFromNow;
                } else {
                    const currentPurchased = user.totalPurchasedPosts || 0;
                    updates.totalPurchasedPosts = currentPurchased + postsToAdd;
                }

                await ctx.db.patch(userId, updates);

                // Update payment record with allocation info
                if (paymentRecord) {
                    await ctx.db.patch(paymentRecord._id, {
                        postsAllocated: setUnlimitedExpiry ? -1 : postsToAdd,
                        planType,
                        updatedAt: now,
                    });
                }

                const allocation = {
                    postsAdded: postsToAdd,
                    unlimitedAccess: setUnlimitedExpiry,
                    userTotalPosts: setUnlimitedExpiry
                        ? "unlimited"
                        : (user.totalPurchasedPosts || 0) + postsToAdd,
                    expiryDate: setUnlimitedExpiry
                        ? now + 30 * 24 * 60 * 60 * 1000
                        : null,
                };

                return {
                    success: true,
                    paymentRecord,
                    allocation,
                    isNewPayment: !existingPayment,
                };
            } catch (allocationError) {
                console.error("Error in post allocation:", allocationError);
                return {
                    success: false,
                    error: "allocation_failed",
                    paymentRecord,
                    isNewPayment: !existingPayment,
                };
            }
        }

        return {
            success: true,
            paymentRecord,
            allocation: null,
            isNewPayment: !existingPayment,
        };
    },
});

// Update payment status (for refunds, disputes, etc.)
export const updatePaymentStatus = mutation({
    args: {
        paymentId: v.string(),
        status: v.string(),
        refundAmount: v.optional(v.number()),
        metadata: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingPayment = await ctx.db
            .query("payments")
            .filter((q) => q.eq(q.field("paymentId"), args.paymentId))
            .first();

        if (!existingPayment) {
            throw new Error(`Payment not found: ${args.paymentId}`);
        }

        const updateData: any = {
            status: args.status,
            updatedAt: Date.now(),
        };

        if (args.refundAmount !== undefined) {
            updateData.refundAmount = args.refundAmount;
        }

        if (args.metadata) {
            updateData.metadata = args.metadata;
        }

        await ctx.db.patch(existingPayment._id, updateData);

        return existingPayment._id;
    },
});
