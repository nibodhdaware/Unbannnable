/**
 * Email Service - Main orchestrator for sending emails
 * Combines Resend, templates, and personalization
 */

import {
    sendEmail,
    EmailType,
    EmailResult,
    addTrackingPixel,
    addClickTracking,
    EMAIL_CONFIG,
    getUnsubscribeUrl,
} from "./resend";
import {
    emailTemplates,
    WelcomeEmailData,
    FirstUseNudgeData,
    ValueReinforcementData,
    UpgradePromptData,
    ReEngagementData,
} from "./templates";
import { getPersonalizedEmailContent, UserStats } from "./personalization";

export { EMAIL_CONFIG } from "./resend";
export type { EmailType } from "./resend";

// User data from Convex
export interface ConvexUser {
    _id: string;
    email: string;
    fullName?: string;
    credits?: number;
    lifetimePlan?: string;
    createdAt: number;
}

// Extended user data with stats
export interface UserWithStats extends ConvexUser {
    stats?: UserStats;
    cachedContent?: {
        content: string;
        generatedAt: number;
        expiresAt: number;
    } | null;
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(
    user: UserWithStats,
): Promise<EmailResult & { emailType: EmailType }> {
    try {
        // Get personalized content if available
        let personalizedContent: string | null = null;
        if (user.stats) {
            personalizedContent = await getPersonalizedEmailContent(
                "welcome",
                user.stats,
                user.cachedContent,
            );
        }

        const emailData: WelcomeEmailData = {
            email: user.email,
            fullName: user.fullName,
            credits: user.credits || 10,
            personalizedContent: personalizedContent || undefined,
        };

        const template = emailTemplates.welcome(emailData);

        // Add tracking
        let html = template.html;
        html = addTrackingPixel(html, user._id, "welcome");
        html = addClickTracking(html, user._id, "welcome");

        const result = await sendEmail({
            to: user.email,
            subject: template.subject,
            html,
            text: template.text,
            tags: [
                { name: "email_type", value: "welcome" },
                { name: "user_id", value: user._id },
            ],
            // Add List-Unsubscribe header for better deliverability
            unsubscribeUrl: getUnsubscribeUrl(user.email),
        });

        return { ...result, emailType: "welcome" };
    } catch (error) {
        console.error("Error sending welcome email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            emailType: "welcome",
        };
    }
}

/**
 * Send a first use nudge email
 */
export async function sendFirstUseNudgeEmail(
    user: UserWithStats,
): Promise<EmailResult & { emailType: EmailType }> {
    try {
        let personalizedContent: string | null = null;
        if (user.stats) {
            personalizedContent = await getPersonalizedEmailContent(
                "first_use_nudge",
                user.stats,
                user.cachedContent,
            );
        }

        const emailData: FirstUseNudgeData = {
            email: user.email,
            fullName: user.fullName,
            personalizedContent: personalizedContent || undefined,
        };

        const template = emailTemplates.first_use_nudge(emailData);

        let html = template.html;
        html = addTrackingPixel(html, user._id, "first_use_nudge");
        html = addClickTracking(html, user._id, "first_use_nudge");

        const result = await sendEmail({
            to: user.email,
            subject: template.subject,
            html,
            text: template.text,
            tags: [
                { name: "email_type", value: "first_use_nudge" },
                { name: "user_id", value: user._id },
            ],
            unsubscribeUrl: getUnsubscribeUrl(user.email),
        });

        return { ...result, emailType: "first_use_nudge" };
    } catch (error) {
        console.error("Error sending first use nudge email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            emailType: "first_use_nudge",
        };
    }
}

/**
 * Send a value reinforcement email
 */
export async function sendValueReinforcementEmail(
    user: UserWithStats & { postsChecked: number },
): Promise<EmailResult & { emailType: EmailType }> {
    try {
        let personalizedContent: string | null = null;
        if (user.stats) {
            personalizedContent = await getPersonalizedEmailContent(
                "value_reinforcement",
                user.stats,
                user.cachedContent,
            );
        }

        const emailData: ValueReinforcementData = {
            email: user.email,
            fullName: user.fullName,
            postsChecked: user.postsChecked,
            personalizedContent: personalizedContent || undefined,
        };

        const template = emailTemplates.value_reinforcement(emailData);

        let html = template.html;
        html = addTrackingPixel(html, user._id, "value_reinforcement");
        html = addClickTracking(html, user._id, "value_reinforcement");

        const result = await sendEmail({
            to: user.email,
            subject: template.subject,
            html,
            text: template.text,
            tags: [
                { name: "email_type", value: "value_reinforcement" },
                { name: "user_id", value: user._id },
            ],
            unsubscribeUrl: getUnsubscribeUrl(user.email),
        });

        return { ...result, emailType: "value_reinforcement" };
    } catch (error) {
        console.error("Error sending value reinforcement email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            emailType: "value_reinforcement",
        };
    }
}

/**
 * Send an upgrade prompt email
 */
export async function sendUpgradePromptEmail(
    user: UserWithStats & { creditsUsed: number; creditsRemaining: number },
): Promise<EmailResult & { emailType: EmailType }> {
    try {
        let personalizedContent: string | null = null;
        if (user.stats) {
            personalizedContent = await getPersonalizedEmailContent(
                "upgrade_prompt",
                user.stats,
                user.cachedContent,
            );
        }

        const emailData: UpgradePromptData = {
            email: user.email,
            fullName: user.fullName,
            creditsRemaining: user.creditsRemaining,
            creditsUsed: user.creditsUsed,
            personalizedContent: personalizedContent || undefined,
        };

        const template = emailTemplates.upgrade_prompt(emailData);

        let html = template.html;
        html = addTrackingPixel(html, user._id, "upgrade_prompt");
        html = addClickTracking(html, user._id, "upgrade_prompt");

        const result = await sendEmail({
            to: user.email,
            subject: template.subject,
            html,
            text: template.text,
            tags: [
                { name: "email_type", value: "upgrade_prompt" },
                { name: "user_id", value: user._id },
            ],
            unsubscribeUrl: getUnsubscribeUrl(user.email),
        });

        return { ...result, emailType: "upgrade_prompt" };
    } catch (error) {
        console.error("Error sending upgrade prompt email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            emailType: "upgrade_prompt",
        };
    }
}

/**
 * Send a re-engagement email
 */
export async function sendReEngagementEmail(
    user: UserWithStats & { daysSinceActivity: number; bonusCredits?: number },
): Promise<EmailResult & { emailType: EmailType }> {
    try {
        const bonusCredits = user.bonusCredits || 10;

        let personalizedContent: string | null = null;
        if (user.stats) {
            personalizedContent = await getPersonalizedEmailContent(
                "re_engagement",
                user.stats,
                user.cachedContent,
            );
        }

        const emailData: ReEngagementData = {
            email: user.email,
            fullName: user.fullName,
            bonusCredits,
            daysSinceActivity: user.daysSinceActivity,
            personalizedContent: personalizedContent || undefined,
        };

        const template = emailTemplates.re_engagement(emailData);

        let html = template.html;
        html = addTrackingPixel(html, user._id, "re_engagement");
        html = addClickTracking(html, user._id, "re_engagement");

        const result = await sendEmail({
            to: user.email,
            subject: template.subject,
            html,
            text: template.text,
            tags: [
                { name: "email_type", value: "re_engagement" },
                { name: "user_id", value: user._id },
            ],
            unsubscribeUrl: getUnsubscribeUrl(user.email),
        });

        return { ...result, emailType: "re_engagement" };
    } catch (error) {
        console.error("Error sending re-engagement email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            emailType: "re_engagement",
        };
    }
}

/**
 * Send email by type
 * Utility function to send any email type
 */
export async function sendEmailByType(
    emailType: EmailType,
    user: UserWithStats & {
        postsChecked?: number;
        creditsUsed?: number;
        creditsRemaining?: number;
        daysSinceActivity?: number;
        bonusCredits?: number;
    },
): Promise<EmailResult & { emailType: EmailType }> {
    switch (emailType) {
        case "welcome":
            return sendWelcomeEmail(user);

        case "first_use_nudge":
            return sendFirstUseNudgeEmail(user);

        case "value_reinforcement":
            if (user.postsChecked === undefined) {
                return {
                    success: false,
                    error: "postsChecked required for value_reinforcement email",
                    emailType,
                };
            }
            return sendValueReinforcementEmail({
                ...user,
                postsChecked: user.postsChecked,
            });

        case "upgrade_prompt":
            if (
                user.creditsUsed === undefined ||
                user.creditsRemaining === undefined
            ) {
                return {
                    success: false,
                    error: "creditsUsed and creditsRemaining required for upgrade_prompt email",
                    emailType,
                };
            }
            return sendUpgradePromptEmail({
                ...user,
                creditsUsed: user.creditsUsed,
                creditsRemaining: user.creditsRemaining,
            });

        case "re_engagement":
            if (user.daysSinceActivity === undefined) {
                return {
                    success: false,
                    error: "daysSinceActivity required for re_engagement email",
                    emailType,
                };
            }
            return sendReEngagementEmail({
                ...user,
                daysSinceActivity: user.daysSinceActivity,
                bonusCredits: user.bonusCredits,
            });

        default:
            return {
                success: false,
                error: `Unknown email type: ${emailType}`,
                emailType,
            };
    }
}

// Re-export everything needed
export {
    sendEmail,
    generateUnsubscribeToken,
    getUnsubscribeUrl,
    getPreferencesUrl,
} from "./resend";
export type { EmailResult } from "./resend";

export { emailTemplates } from "./templates";

export {
    generatePersonalizedContent,
    getPersonalizedEmailContent,
} from "./personalization";
export type { UserStats } from "./personalization";
