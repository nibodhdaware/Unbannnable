import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const EMAIL_CONFIG = {
    from:
        process.env.RESEND_FROM_EMAIL ||
        "Unbannnable <noreply@unbannnable.com>",
    replyTo: process.env.RESEND_REPLY_TO || "support@unbannnable.com",
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "https://unbannnable.com",
    testMode: process.env.EMAIL_TEST_MODE === "true",
    testEmail: process.env.EMAIL_TEST_RECIPIENT || "",
    // Disable click tracking until deployed to production
    enableClickTracking: process.env.EMAIL_ENABLE_CLICK_TRACKING === "true",
};

// Email types
export type EmailType =
    | "welcome"
    | "first_use_nudge"
    | "value_reinforcement"
    | "upgrade_prompt"
    | "re_engagement";

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
    tags?: { name: string; value: string }[];
    replyTo?: string;
    // For List-Unsubscribe header (critical for spam prevention)
    unsubscribeUrl?: string;
    // Custom headers
    headers?: Record<string, string>;
}

/**
 * Send an email using Resend
 * Includes retry logic and error handling
 */
export async function sendEmail(
    params: SendEmailParams,
    retries = 3,
): Promise<EmailResult> {
    // Use test email if in test mode
    const recipient = EMAIL_CONFIG.testMode
        ? EMAIL_CONFIG.testEmail
        : params.to;

    if (!recipient) {
        return {
            success: false,
            error: "No recipient email provided",
        };
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Build headers with List-Unsubscribe for better deliverability
            const headers: Record<string, string> = {
                ...params.headers,
            };

            // Add List-Unsubscribe header if unsubscribe URL provided
            if (params.unsubscribeUrl) {
                headers["List-Unsubscribe"] = `<${params.unsubscribeUrl}>`;
                headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
            }

            const { data, error } = await resend.emails.send({
                from: EMAIL_CONFIG.from,
                to: recipient,
                subject: params.subject,
                html: params.html,
                text: params.text,
                replyTo: params.replyTo || EMAIL_CONFIG.replyTo,
                tags: params.tags,
                headers: Object.keys(headers).length > 0 ? headers : undefined,
            });

            if (error) {
                console.error(`Email send error (attempt ${attempt}):`, error);

                if (attempt === retries) {
                    return {
                        success: false,
                        error: error.message,
                    };
                }

                // Wait before retry (exponential backoff)
                await new Promise((resolve) =>
                    setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)),
                );
                continue;
            }

            console.log(`Email sent successfully to ${recipient}:`, data?.id);

            return {
                success: true,
                messageId: data?.id,
            };
        } catch (err) {
            console.error(`Email send exception (attempt ${attempt}):`, err);

            if (attempt === retries) {
                return {
                    success: false,
                    error: err instanceof Error ? err.message : "Unknown error",
                };
            }

            // Wait before retry
            await new Promise((resolve) =>
                setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)),
            );
        }
    }

    return {
        success: false,
        error: "Max retries exceeded",
    };
}

/**
 * Send a batch of emails
 */
export async function sendBatchEmails(
    emails: SendEmailParams[],
): Promise<{ sent: number; failed: number; results: EmailResult[] }> {
    const results: EmailResult[] = [];
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
        const result = await sendEmail(email);
        results.push(result);

        if (result.success) {
            sent++;
        } else {
            failed++;
        }

        // Small delay between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return { sent, failed, results };
}

/**
 * Generate unsubscribe token for a user
 */
export function generateUnsubscribeToken(email: string): string {
    return Buffer.from(email).toString("base64");
}

/**
 * Get unsubscribe URL for a user
 */
export function getUnsubscribeUrl(email: string): string {
    const token = generateUnsubscribeToken(email);
    return `${EMAIL_CONFIG.baseUrl}/api/email-preferences/unsubscribe?token=${encodeURIComponent(token)}`;
}

/**
 * Get email preferences URL
 */
export function getPreferencesUrl(email: string): string {
    const token = generateUnsubscribeToken(email);
    return `${EMAIL_CONFIG.baseUrl}/email-preferences?token=${encodeURIComponent(token)}`;
}

/**
 * Add tracking pixel to email HTML
 */
export function addTrackingPixel(
    html: string,
    userId: string,
    emailType: EmailType,
): string {
    const trackingUrl = `${EMAIL_CONFIG.baseUrl}/api/email-preferences/track?u=${encodeURIComponent(userId)}&t=${encodeURIComponent(emailType)}`;
    const pixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none;" alt="" />`;
    return html.replace("</body>", `${pixel}</body>`);
}

/**
 * Wrap links for click tracking
 */
export function addClickTracking(
    html: string,
    userId: string,
    emailType: EmailType,
): string {
    // Skip click tracking if not enabled (useful before deploying tracking routes)
    if (!EMAIL_CONFIG.enableClickTracking) {
        return html;
    }

    const baseTrackUrl = `${EMAIL_CONFIG.baseUrl}/api/email-preferences/click`;

    // Simple regex to find links (in production, use a proper HTML parser)
    return html.replace(/href="(https?:\/\/[^"]+)"/g, (match, url) => {
        // Don't track unsubscribe links
        if (url.includes("unsubscribe") || url.includes("email-preferences")) {
            return match;
        }
        const trackedUrl = `${baseTrackUrl}?u=${encodeURIComponent(userId)}&t=${encodeURIComponent(emailType)}&r=${encodeURIComponent(url)}`;
        return `href="${trackedUrl}"`;
    });
}

// Export the resend client for advanced usage
export { resend };
