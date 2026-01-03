import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Email sending actions for Convex
 * These actions call the Next.js API routes to send emails
 */

// Base URL for API calls
const getApiBaseUrl = () => {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

// Helper to call email API
async function callEmailApi(
    endpoint: string,
    data: Record<string, unknown>,
): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
        const response = await fetch(
            `${getApiBaseUrl()}/api/emails/${endpoint}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.CRON_SECRET || ""}`,
                },
                body: JSON.stringify(data),
            },
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(`Error calling email API ${endpoint}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Send welcome email action
 */
export const sendWelcomeEmailAction = internalAction({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        // Get user data
        const user = await ctx.runQuery(
            internal.emails.getUserStatsForPersonalization,
            {
                userId,
            },
        );

        if (!user) {
            console.error("User not found for welcome email:", userId);
            return { success: false, error: "User not found" };
        }

        // Call email API
        const result = await callEmailApi("send", {
            emailType: "welcome",
            userId: userId,
            userData: user,
        });

        // Log email event
        await ctx.runMutation(internal.emails.logEmailEventInternal, {
            userId,
            emailType: "welcome",
            status: result.success ? "sent" : "failed",
            metadata: result.success
                ? { messageId: result.messageId }
                : { error: result.error },
        });

        return result;
    },
});

/**
 * Send first use nudge email action
 */
export const sendFirstUseNudgeAction = internalAction({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        const user = await ctx.runQuery(
            internal.emails.getUserStatsForPersonalization,
            {
                userId,
            },
        );

        if (!user) {
            console.error("User not found for first use nudge:", userId);
            return { success: false, error: "User not found" };
        }

        const result = await callEmailApi("send", {
            emailType: "first_use_nudge",
            userId: userId,
            userData: user,
        });

        await ctx.runMutation(internal.emails.logEmailEventInternal, {
            userId,
            emailType: "first_use_nudge",
            status: result.success ? "sent" : "failed",
            metadata: result.success
                ? { messageId: result.messageId }
                : { error: result.error },
        });

        return result;
    },
});

/**
 * Send value reinforcement email action
 */
export const sendValueReinforcementAction = internalAction({
    args: {
        userId: v.id("users"),
        postsChecked: v.number(),
    },
    handler: async (ctx, { userId, postsChecked }) => {
        const user = await ctx.runQuery(
            internal.emails.getUserStatsForPersonalization,
            {
                userId,
            },
        );

        if (!user) {
            console.error("User not found for value reinforcement:", userId);
            return { success: false, error: "User not found" };
        }

        const result = await callEmailApi("send", {
            emailType: "value_reinforcement",
            userId: userId,
            userData: { ...user, postsChecked },
        });

        await ctx.runMutation(internal.emails.logEmailEventInternal, {
            userId,
            emailType: "value_reinforcement",
            status: result.success ? "sent" : "failed",
            metadata: result.success
                ? { messageId: result.messageId }
                : { error: result.error },
        });

        return result;
    },
});

/**
 * Send upgrade prompt email action
 */
export const sendUpgradePromptAction = internalAction({
    args: {
        userId: v.id("users"),
        creditsUsed: v.number(),
        creditsRemaining: v.number(),
    },
    handler: async (ctx, { userId, creditsUsed, creditsRemaining }) => {
        const user = await ctx.runQuery(
            internal.emails.getUserStatsForPersonalization,
            {
                userId,
            },
        );

        if (!user) {
            console.error("User not found for upgrade prompt:", userId);
            return { success: false, error: "User not found" };
        }

        const result = await callEmailApi("send", {
            emailType: "upgrade_prompt",
            userId: userId,
            userData: { ...user, creditsUsed, creditsRemaining },
        });

        await ctx.runMutation(internal.emails.logEmailEventInternal, {
            userId,
            emailType: "upgrade_prompt",
            status: result.success ? "sent" : "failed",
            metadata: result.success
                ? { messageId: result.messageId }
                : { error: result.error },
        });

        return result;
    },
});

/**
 * Send re-engagement email action
 */
export const sendReEngagementAction = internalAction({
    args: {
        userId: v.id("users"),
        daysSinceActivity: v.number(),
        bonusCredits: v.optional(v.number()),
    },
    handler: async (ctx, { userId, daysSinceActivity, bonusCredits = 10 }) => {
        const user = await ctx.runQuery(
            internal.emails.getUserStatsForPersonalization,
            {
                userId,
            },
        );

        if (!user) {
            console.error("User not found for re-engagement:", userId);
            return { success: false, error: "User not found" };
        }

        // Add bonus credits to user
        await ctx.runMutation(api.emails.addReEngagementCredits, {
            userId,
            credits: bonusCredits,
        });

        const result = await callEmailApi("send", {
            emailType: "re_engagement",
            userId: userId,
            userData: { ...user, daysSinceActivity, bonusCredits },
        });

        await ctx.runMutation(internal.emails.logEmailEventInternal, {
            userId,
            emailType: "re_engagement",
            status: result.success ? "sent" : "failed",
            metadata: result.success
                ? { messageId: result.messageId, bonusCredits }
                : { error: result.error },
        });

        return result;
    },
});

/**
 * Process all email triggers
 * Called by cron job daily
 */
export const processEmailTriggers = internalAction({
    handler: async (ctx) => {
        const results = {
            welcome: { sent: 0, failed: 0 },
            first_use_nudge: { sent: 0, failed: 0 },
            value_reinforcement: { sent: 0, failed: 0 },
            upgrade_prompt: { sent: 0, failed: 0 },
            re_engagement: { sent: 0, failed: 0 },
        };

        // 1. Process welcome emails
        const welcomeUsers = await ctx.runQuery(
            api.emails.getUsersForWelcomeEmail,
        );
        for (const user of welcomeUsers) {
            const result = await ctx.runAction(
                internal.emailActions.sendWelcomeEmailAction,
                {
                    userId: user._id,
                },
            );
            if (result.success) {
                results.welcome.sent++;
            } else {
                results.welcome.failed++;
            }
            // Rate limiting delay
            await new Promise((r) => setTimeout(r, 500));
        }

        // 2. Process first use nudge emails
        const nudgeUsers = await ctx.runQuery(
            api.emails.getUsersForFirstUseNudge,
        );
        for (const user of nudgeUsers) {
            const result = await ctx.runAction(
                internal.emailActions.sendFirstUseNudgeAction,
                {
                    userId: user._id,
                },
            );
            if (result.success) {
                results.first_use_nudge.sent++;
            } else {
                results.first_use_nudge.failed++;
            }
            await new Promise((r) => setTimeout(r, 500));
        }

        // 3. Process value reinforcement emails
        const reinforcementUsers = await ctx.runQuery(
            api.emails.getUsersForValueReinforcement,
        );
        for (const user of reinforcementUsers) {
            const result = await ctx.runAction(
                internal.emailActions.sendValueReinforcementAction,
                {
                    userId: user._id,
                    postsChecked: user.postsChecked,
                },
            );
            if (result.success) {
                results.value_reinforcement.sent++;
            } else {
                results.value_reinforcement.failed++;
            }
            await new Promise((r) => setTimeout(r, 500));
        }

        // 4. Process upgrade prompt emails
        const upgradeUsers = await ctx.runQuery(
            api.emails.getUsersForUpgradePrompt,
        );
        for (const user of upgradeUsers) {
            const result = await ctx.runAction(
                internal.emailActions.sendUpgradePromptAction,
                {
                    userId: user._id,
                    creditsUsed: user.creditsUsed,
                    creditsRemaining: user.creditsRemaining,
                },
            );
            if (result.success) {
                results.upgrade_prompt.sent++;
            } else {
                results.upgrade_prompt.failed++;
            }
            await new Promise((r) => setTimeout(r, 500));
        }

        // 5. Process re-engagement emails
        const reEngagementUsers = await ctx.runQuery(
            api.emails.getUsersForReEngagement,
        );
        for (const user of reEngagementUsers) {
            const result = await ctx.runAction(
                internal.emailActions.sendReEngagementAction,
                {
                    userId: user._id,
                    daysSinceActivity: user.daysSinceActivity,
                    bonusCredits: 10,
                },
            );
            if (result.success) {
                results.re_engagement.sent++;
            } else {
                results.re_engagement.failed++;
            }
            await new Promise((r) => setTimeout(r, 500));
        }

        console.log("Email trigger processing complete:", results);
        return results;
    },
});

/**
 * Manual email send action (for testing)
 */
export const sendTestEmail = action({
    args: {
        emailType: v.string(),
        userId: v.id("users"),
        testMode: v.optional(v.boolean()),
    },
    handler: async (ctx, { emailType, userId, testMode }) => {
        const user = await ctx.runQuery(
            internal.emails.getUserStatsForPersonalization,
            {
                userId,
            },
        );

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Call email API with test mode
        const result = await callEmailApi("send", {
            emailType,
            userId,
            userData: {
                ...user,
                postsChecked: 5,
                creditsUsed: 7,
                creditsRemaining: 3,
                daysSinceActivity: 10,
                bonusCredits: 10,
            },
            testMode: testMode ?? true,
        });

        return result;
    },
});
