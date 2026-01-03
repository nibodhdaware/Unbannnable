/**
 * Email Templates for Unbannnable
 * Using inline CSS for maximum email client compatibility
 * Orange (#FF4500) and dark aesthetic to match the website
 */

import { getUnsubscribeUrl, getPreferencesUrl, EMAIL_CONFIG } from "./resend";

// Common styles - Orange and dark theme
const styles = {
    container: `
        max-width: 600px;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: #ffffff;
        color: #1a1a1a;
    `,
    header: `
        background-color: #171717;
        padding: 32px 24px;
        text-align: center;
        border-bottom: 3px solid #FF4500;
    `,
    logo: `
        color: #FF4500;
        font-size: 28px;
        font-weight: 700;
        text-decoration: none;
    `,
    content: `
        padding: 32px 24px;
        line-height: 1.6;
    `,
    heading: `
        font-size: 24px;
        font-weight: 600;
        color: #171717;
        margin: 0 0 16px 0;
    `,
    paragraph: `
        font-size: 16px;
        color: #404040;
        margin: 0 0 16px 0;
    `,
    ctaButton: `
        display: inline-block;
        background-color: #FF4500;
        color: #ffffff;
        padding: 14px 28px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 16px;
        margin: 8px 0;
    `,
    secondaryButton: `
        display: inline-block;
        background-color: #f5f5f5;
        color: #404040;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 500;
        font-size: 14px;
        margin: 8px 0;
        border: 1px solid #e5e5e5;
    `,
    statsBox: `
        background-color: #fafafa;
        border-radius: 12px;
        padding: 24px;
        margin: 24px 0;
        text-align: center;
        border: 1px solid #e5e5e5;
    `,
    statNumber: `
        font-size: 36px;
        font-weight: 700;
        color: #FF4500;
        margin: 0;
    `,
    statLabel: `
        font-size: 14px;
        color: #737373;
        margin: 4px 0 0 0;
    `,
    footer: `
        background-color: #171717;
        padding: 24px;
        text-align: center;
    `,
    footerText: `
        font-size: 12px;
        color: #a3a3a3;
        margin: 0 0 8px 0;
    `,
    footerLink: `
        color: #FF4500;
        text-decoration: none;
    `,
    divider: `
        border: none;
        border-top: 1px solid #e5e5e5;
        margin: 24px 0;
    `,
    highlight: `
        background-color: #fff7ed;
        padding: 16px;
        border-radius: 8px;
        border-left: 4px solid #FF4500;
        margin: 16px 0;
    `,
};

// Email wrapper with common header/footer
function wrapEmail(content: string, email: string): string {
    const unsubscribeUrl = getUnsubscribeUrl(email);
    const preferencesUrl = getPreferencesUrl(email);
    const appUrl = EMAIL_CONFIG.baseUrl;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unbannnable</title>
</head>
<body style="margin: 0; padding: 0; background-color: #e5e5e5;">
    <div style="${styles.container}">
        <!-- Header -->
        <div style="${styles.header}">
            <a href="${appUrl}" style="${styles.logo}">Unbannnable</a>
        </div>
        
        <!-- Content -->
        <div style="${styles.content}">
            ${content}
        </div>
        
        <!-- Footer -->
        <div style="${styles.footer}">
            <p style="${styles.footerText}">
                You're receiving this because you signed up for Unbannnable.
            </p>
            <p style="${styles.footerText}">
                <a href="${preferencesUrl}" style="${styles.footerLink}">Email Preferences</a>
                &nbsp;|&nbsp;
                <a href="${unsubscribeUrl}" style="${styles.footerLink}">Unsubscribe</a>
            </p>
            <p style="${styles.footerText}">
                © ${new Date().getFullYear()} Unbannnable. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

// Template data interfaces
export interface WelcomeEmailData {
    email: string;
    fullName?: string;
    credits: number;
    personalizedContent?: string;
}

export interface FirstUseNudgeData {
    email: string;
    fullName?: string;
    personalizedContent?: string;
}

export interface ValueReinforcementData {
    email: string;
    fullName?: string;
    postsChecked: number;
    potentialBansAvoided?: number;
    personalizedContent?: string;
}

export interface UpgradePromptData {
    email: string;
    fullName?: string;
    creditsRemaining: number;
    creditsUsed: number;
    personalizedContent?: string;
}

export interface ReEngagementData {
    email: string;
    fullName?: string;
    bonusCredits: number;
    daysSinceActivity: number;
    personalizedContent?: string;
}

// Template A: Welcome Email (Day 0)
export function welcomeEmail(data: WelcomeEmailData): {
    subject: string;
    html: string;
    text: string;
} {
    const greeting = data.fullName
        ? `Hey ${data.fullName.split(" ")[0]}!`
        : "Hey there!";
    const appUrl = EMAIL_CONFIG.baseUrl;

    const content = `
        <h1 style="${styles.heading}">${greeting} Welcome to Unbannnable</h1>
        
        <p style="${styles.paragraph}">
            Thanks for signing up. No more guessing if your post will survive the moderators.
        </p>
        
        <p style="${styles.paragraph}">
            <strong>Here's what Unbannnable does for you:</strong>
        </p>
        
        <ul style="${styles.paragraph}">
            <li>Checks your posts against subreddit rules before you post</li>
            <li>Spots potential issues that could get you banned</li>
            <li>Suggests better subreddits for your content</li>
            <li>Saves you from the frustration of deleted posts</li>
        </ul>
        
        <div style="${styles.statsBox}">
            <p style="${styles.statNumber}">${data.credits}</p>
            <p style="${styles.statLabel}">Credits in Your Account</p>
        </div>
        
        ${
            data.personalizedContent
                ? `
        <div style="${styles.highlight}">
            <p style="${styles.paragraph}; margin: 0;">
                ${data.personalizedContent}
            </p>
        </div>
        `
                : ""
        }
        
        <p style="${styles.paragraph}">
            Ready to check your first post? It only takes 30 seconds:
        </p>
        
        <p style="text-align: center; margin: 24px 0;">
            <a href="${appUrl}/app" style="${styles.ctaButton}">
                Check Your First Post →
            </a>
        </p>
        
        <hr style="${styles.divider}" />
        
        <p style="${styles.paragraph}">
            <strong>Quick Start Guide:</strong>
        </p>
        <ol style="${styles.paragraph}">
            <li>Paste your post title and body</li>
            <li>Select your target subreddit</li>
            <li>Click "Check Post" and get instant feedback</li>
        </ol>
        
        <p style="${styles.paragraph}">
            Questions? Just reply to this email – I read every one.
        </p>
        
        <p style="${styles.paragraph}">
            Happy posting!<br />
            <strong>The Unbannnable Team</strong>
        </p>
    `;

    const text = `
${greeting} Welcome to Unbannnable!

You just made the smartest move for your Reddit journey. No more guessing if your post will survive – we've got your back.

Here's what Unbannnable does for you:
- Checks your posts against subreddit rules before you post
- Spots potential issues that could get you banned
- Suggests better subreddits for your content
- Saves you from the frustration of deleted posts

You have ${data.credits} credits in your account.

Ready to check your first post? Visit: ${appUrl}/app

Quick Start Guide:
1. Paste your post title and body
2. Select your target subreddit
3. Click "Check Post" and get instant feedback

Questions? Just reply to this email.

Happy posting!
The Unbannnable Team
    `.trim();

    return {
        subject: "Welcome to Unbannnable",
        html: wrapEmail(content, data.email),
        text,
    };
}

// Template B: First Use Nudge (Day 2, if no usage)
export function firstUseNudgeEmail(data: FirstUseNudgeData): {
    subject: string;
    html: string;
    text: string;
} {
    const greeting = data.fullName
        ? `Hey ${data.fullName.split(" ")[0]}`
        : "Hey";
    const appUrl = EMAIL_CONFIG.baseUrl;

    const content = `
        <h1 style="${styles.heading}">${greeting}, quick question</h1>
        
        <p style="${styles.paragraph}">
            I noticed you signed up a couple days ago but haven't checked your first post yet.
        </p>
        
        <p style="${styles.paragraph}">
            Is everything okay? I want to make sure you're not stuck on something.
        </p>
        
        ${
            data.personalizedContent
                ? `
        <div style="${styles.highlight}">
            <p style="${styles.paragraph}; margin: 0;">
                ${data.personalizedContent}
            </p>
        </div>
        `
                : ""
        }
        
        <p style="${styles.paragraph}">
            <strong>Common questions I hear:</strong>
        </p>
        
        <ul style="${styles.paragraph}">
            <li>"How does it work?" → Paste your post, select subreddit, click check. That's it!</li>
            <li>"Is it actually useful?" → We've helped users avoid 10,000+ potential bans</li>
            <li>"What if I run out of credits?" → You get 10 free credits, plus we have affordable plans</li>
        </ul>
        
        <p style="text-align: center; margin: 24px 0;">
            <a href="${appUrl}/app" style="${styles.ctaButton}">
                Try Your First Check →
            </a>
        </p>
        
        <p style="${styles.paragraph}">
            Or if something's not working right, just hit reply and let me know. I'm here to help!
        </p>
        
        <p style="${styles.paragraph}">
            Cheers,<br />
            <strong>The Unbannnable Team</strong>
        </p>
    `;

    const text = `
${greeting}, quick question...

I noticed you signed up a couple days ago but haven't checked your first post yet.

Is everything okay? I want to make sure you're not stuck on something.

Common questions I hear:
- "How does it work?" → Paste your post, select subreddit, click check. That's it!
- "Is it actually useful?" → We've helped users avoid 10,000+ potential bans
- "What if I run out of credits?" → You get 10 free credits, plus we have affordable plans

Try your first check: ${appUrl}/app

Or if something's not working right, just hit reply and let me know.

Cheers,
The Unbannnable Team
    `.trim();

    return {
        subject: "Quick question about your Unbannnable account",
        html: wrapEmail(content, data.email),
        text,
    };
}

// Template C: Value Reinforcement (Day 5, if active)
export function valueReinforcementEmail(data: ValueReinforcementData): {
    subject: string;
    html: string;
    text: string;
} {
    const greeting = data.fullName ? `${data.fullName.split(" ")[0]}, ` : "";
    const appUrl = EMAIL_CONFIG.baseUrl;
    const bansAvoided =
        data.potentialBansAvoided || Math.floor(data.postsChecked * 0.3); // Estimate ~30% would have issues

    const content = `
        <h1 style="${styles.heading}">${greeting}Your Reddit stats this week</h1>
        
        <p style="${styles.paragraph}">
            You've been putting Unbannnable to work, and the numbers speak for themselves:
        </p>
        
        <div style="${styles.statsBox}">
            <div style="display: inline-block; margin: 0 24px;">
                <p style="${styles.statNumber}">${data.postsChecked}</p>
                <p style="${styles.statLabel}">Posts Checked</p>
            </div>
            <div style="display: inline-block; margin: 0 24px;">
                <p style="${styles.statNumber}">~${bansAvoided}</p>
                <p style="${styles.statLabel}">Potential Issues Caught</p>
            </div>
        </div>
        
        <p style="${styles.paragraph}">
            That's ${bansAvoided} times your post could have been removed or gotten you in trouble with mods. But instead? Everything went through smoothly.
        </p>
        
        ${
            data.personalizedContent
                ? `
        <div style="${styles.highlight}">
            <p style="${styles.paragraph}; margin: 0;">
                ${data.personalizedContent}
            </p>
        </div>
        `
                : ""
        }
        
        <p style="${styles.paragraph}">
            <strong>Pro tip:</strong> Power users check their posts before submitting to <em>any</em> subreddit – even ones they've posted to before. Rules change, and it only takes one oversight to get banned.
        </p>
        
        <p style="text-align: center; margin: 24px 0;">
            <a href="${appUrl}/app" style="${styles.ctaButton}">
                Keep the Streak Going →
            </a>
        </p>
        
        <p style="${styles.paragraph}">
            Keep up the great work!<br />
            <strong>The Unbannnable Team</strong>
        </p>
    `;

    const text = `
${greeting}Your Reddit stats this week

You've been putting Unbannnable to work, and the numbers speak for themselves:

${data.postsChecked} Posts Checked
~${bansAvoided} Potential Issues Caught

That's ${bansAvoided} times your post could have been removed or gotten you in trouble with mods. But instead? Everything went through smoothly.

Pro tip: Power users check their posts before submitting to any subreddit - even ones they've posted to before. Rules change, and it only takes one oversight to get banned.

Keep checking: ${appUrl}/app

Keep up the great work!
The Unbannnable Team
    `.trim();

    return {
        subject: "Your Reddit posting stats this week",
        html: wrapEmail(content, data.email),
        text,
    };
}

// Template D: Upgrade Prompt (Day 7)
export function upgradePromptEmail(data: UpgradePromptData): {
    subject: string;
    html: string;
    text: string;
} {
    const greeting = data.fullName
        ? `Hey ${data.fullName.split(" ")[0]}`
        : "Hey";
    const appUrl = EMAIL_CONFIG.baseUrl;

    const content = `
        <h1 style="${styles.heading}">${greeting}, running low on credits?</h1>
        
        <p style="${styles.paragraph}">
            You've been using Unbannnable like a pro - ${data.creditsUsed} posts checked already!
        </p>
        
        <div style="${styles.statsBox}">
            <p style="${styles.statNumber}">${data.creditsRemaining}</p>
            <p style="${styles.statLabel}">Credits Remaining</p>
        </div>
        
        <p style="${styles.paragraph}">
            Before you run out, I wanted to let you know about your options:
        </p>
        
        ${
            data.personalizedContent
                ? `
        <div style="${styles.highlight}">
            <p style="${styles.paragraph}; margin: 0;">
                ${data.personalizedContent}
            </p>
        </div>
        `
                : ""
        }
        
        <p style="${styles.paragraph}">
            <strong>Lifetime Plans (One-time payment, forever access):</strong>
        </p>
        
        <ul style="${styles.paragraph}">
            <li><strong>Basic:</strong> 20 credits/month, forever - Perfect for casual Redditors</li>
            <li><strong>Premium:</strong> 100 credits/month, forever - For power users</li>
        </ul>
        
        <p style="text-align: center; margin: 24px 0;">
            <a href="${appUrl}/#pricing" style="${styles.ctaButton}">
                View Pricing →
            </a>
        </p>
        
        <p style="${styles.paragraph}">
            <strong>Why upgrade?</strong>
        </p>
        <ul style="${styles.paragraph}">
            <li>Never worry about running out of credits</li>
            <li>Pay once, use forever</li>
            <li>Monthly credits refresh automatically</li>
            <li>Priority support</li>
        </ul>
        
        <p style="${styles.paragraph}">
            Questions about which plan is right for you? Just reply!
        </p>
        
        <p style="${styles.paragraph}">
            Cheers,<br />
            <strong>The Unbannnable Team</strong>
        </p>
    `;

    const text = `
${greeting}, running low on credits?

You've been using Unbannnable like a pro - ${data.creditsUsed} posts checked already!

You have ${data.creditsRemaining} credits remaining.

Before you run out, here are your options:

Lifetime Plans (One-time payment, forever access):
- Basic: 20 credits/month, forever - Perfect for casual Redditors
- Premium: 100 credits/month, forever - For power users

View pricing: ${appUrl}/#pricing

Why upgrade?
- Never worry about running out of credits
- Pay once, use forever
- Monthly credits refresh automatically
- Priority support

Questions about which plan is right for you? Just reply!

Cheers,
The Unbannnable Team
    `.trim();

    return {
        subject: "Your Unbannnable credits are running low",
        html: wrapEmail(content, data.email),
        text,
    };
}

// Template E: Re-engagement (Day 14, if inactive)
export function reEngagementEmail(data: ReEngagementData): {
    subject: string;
    html: string;
    text: string;
} {
    const greeting = data.fullName
        ? `Hey ${data.fullName.split(" ")[0]}`
        : "Hey";
    const appUrl = EMAIL_CONFIG.baseUrl;

    const content = `
        <h1 style="${styles.heading}">${greeting}, it's been a while</h1>
        
        <p style="${styles.paragraph}">
            It's been ${data.daysSinceActivity} days since your last visit. Life gets busy – we get it!
        </p>
        
        <p style="${styles.paragraph}">
            But we don't want you posting blind on Reddit. So here's a little something to welcome you back:
        </p>
        
        <div style="${styles.statsBox}">
            <p style="${styles.statNumber}">+${data.bonusCredits}</p>
            <p style="${styles.statLabel}">Bonus Credits Added</p>
        </div>
        
        <p style="${styles.paragraph}">
            That's right - we just added ${data.bonusCredits} bonus credits to your account. Use them whenever you're ready.
        </p>
        
        ${
            data.personalizedContent
                ? `
        <div style="${styles.highlight}">
            <p style="${styles.paragraph}; margin: 0;">
                ${data.personalizedContent}
            </p>
        </div>
        `
                : ""
        }
        
        <p style="${styles.paragraph}">
            <strong>What's new since you've been gone:</strong>
        </p>
        
        <ul style="${styles.paragraph}">
            <li>Faster rule checking</li>
            <li>Improved subreddit suggestions</li>
            <li>Better AI analysis</li>
        </ul>
        
        <p style="text-align: center; margin: 24px 0;">
            <a href="${appUrl}/app" style="${styles.ctaButton}">
                Use Your Bonus Credits →
            </a>
        </p>
        
        <hr style="${styles.divider}" />
        
        <p style="${styles.paragraph}">
            <strong>Quick feedback?</strong> I'd love to know – was there something that made you stop using Unbannnable? Just hit reply and let me know. Your feedback helps us improve!
        </p>
        
        <p style="${styles.paragraph}">
            See you soon,<br />
            <strong>The Unbannnable Team</strong>
        </p>
    `;

    const text = `
${greeting}, it's been a while

It's been ${data.daysSinceActivity} days since your last visit. Life gets busy - we get it.

But we don't want you posting blind on Reddit. So here's a little something to welcome you back:

+${data.bonusCredits} BONUS CREDITS ADDED

That's right - we just added ${data.bonusCredits} bonus credits to your account. Use them whenever you're ready.

What's new since you've been gone:
- Faster rule checking
- Improved subreddit suggestions
- Better AI analysis

Use your bonus: ${appUrl}/app

Quick feedback? Was there something that made you stop using Unbannnable? Just hit reply and let me know.

See you soon,
The Unbannnable Team
    `.trim();

    return {
        subject: `${data.bonusCredits} bonus credits added to your account`,
        html: wrapEmail(content, data.email),
        text,
    };
}

// Export all templates
export const emailTemplates = {
    welcome: welcomeEmail,
    first_use_nudge: firstUseNudgeEmail,
    value_reinforcement: valueReinforcementEmail,
    upgrade_prompt: upgradePromptEmail,
    re_engagement: reEngagementEmail,
};
