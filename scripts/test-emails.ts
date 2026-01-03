#!/usr/bin/env node

/**
 * Email Flow Test Script
 * Tests all 5 email templates with mock user data
 *
 * Usage:
 *   npx tsx scripts/test-emails.ts
 *
 * Environment variables required:
 *   - RESEND_API_KEY
 *   - ANTHROPIC_API_KEY (for personalization)
 *   - EMAIL_TEST_RECIPIENT (your email for testing)
 *   - NEXT_PUBLIC_APP_URL
 */

import "dotenv/config";

const TEST_EMAIL = process.env.EMAIL_TEST_RECIPIENT || "";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET || "";

if (!TEST_EMAIL) {
    console.error("❌ EMAIL_TEST_RECIPIENT environment variable is required");
    process.exit(1);
}

console.log("📧 Email Flow Test Script");
console.log("========================");
console.log(`Test email: ${TEST_EMAIL}`);
console.log(`Base URL: ${BASE_URL}`);
console.log("");

interface TestCase {
    name: string;
    emailType: string;
    userData: Record<string, unknown>;
}

const testCases: TestCase[] = [
    {
        name: "Welcome Email",
        emailType: "welcome",
        userData: {
            fullName: "Test User",
            currentCredits: 10,
            totalPostsChecked: 0,
            topSubreddits: [],
            isPowerUser: false,
            isActiveUser: false,
            daysSinceSignup: 0,
        },
    },
    {
        name: "First Use Nudge",
        emailType: "first_use_nudge",
        userData: {
            fullName: "Test User",
            currentCredits: 10,
            totalPostsChecked: 0,
            topSubreddits: [],
            isPowerUser: false,
            isActiveUser: false,
            daysSinceSignup: 2,
        },
    },
    {
        name: "Value Reinforcement",
        emailType: "value_reinforcement",
        userData: {
            fullName: "Active User",
            currentCredits: 5,
            totalPostsChecked: 8,
            topSubreddits: ["technology", "programming", "webdev"],
            isPowerUser: false,
            isActiveUser: true,
            daysSinceSignup: 5,
            postsChecked: 8,
            peakHour: 20, // 8 PM
        },
    },
    {
        name: "Upgrade Prompt",
        emailType: "upgrade_prompt",
        userData: {
            fullName: "Power User",
            currentCredits: 3,
            totalPostsChecked: 15,
            topSubreddits: ["entrepreneur", "startups", "smallbusiness"],
            isPowerUser: true,
            isActiveUser: true,
            daysSinceSignup: 7,
            creditsUsed: 7,
            creditsRemaining: 3,
            peakHour: 14, // 2 PM
        },
    },
    {
        name: "Re-engagement",
        emailType: "re_engagement",
        userData: {
            fullName: "Inactive User",
            currentCredits: 5,
            totalPostsChecked: 3,
            topSubreddits: ["gaming"],
            isPowerUser: false,
            isActiveUser: false,
            daysSinceSignup: 14,
            daysSinceActivity: 10,
            bonusCredits: 10,
        },
    },
];

async function sendTestEmail(testCase: TestCase): Promise<boolean> {
    console.log(`\n📤 Sending: ${testCase.name}...`);

    try {
        const response = await fetch(`${BASE_URL}/api/emails/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${CRON_SECRET}`,
            },
            body: JSON.stringify({
                emailType: testCase.emailType,
                userId: "test-user-id",
                userData: testCase.userData,
                testMode: true,
            }),
        });

        const result = await response.json();

        if (result.success) {
            console.log(`   ✅ Success! Message ID: ${result.messageId}`);
            return true;
        } else {
            console.log(`   ❌ Failed: ${result.error}`);
            return false;
        }
    } catch (error) {
        console.log(
            `   ❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        return false;
    }
}

async function runTests() {
    console.log(`\n🚀 Starting email tests...\n`);

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
        const success = await sendTestEmail(testCase);
        if (success) {
            passed++;
        } else {
            failed++;
        }

        // Wait between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log("\n========================");
    console.log("📊 Test Results");
    console.log("========================");
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📧 Check ${TEST_EMAIL} for the test emails`);

    if (failed > 0) {
        console.log("\n⚠️  Some tests failed. Check the following:");
        console.log("   - RESEND_API_KEY is set correctly");
        console.log("   - EMAIL_TEST_RECIPIENT is a valid email");
        console.log("   - The dev server is running at", BASE_URL);
    }

    process.exit(failed > 0 ? 1 : 0);
}

// Test personalization separately
async function testPersonalization() {
    console.log("\n🤖 Testing AI Personalization...");

    if (!process.env.ANTHROPIC_API_KEY) {
        console.log(
            "   ⚠️  ANTHROPIC_API_KEY not set, skipping personalization test",
        );
        return;
    }

    try {
        // Dynamic import to handle module not found
        const { generatePersonalizedContent } = await import(
            "../src/lib/email/personalization"
        );

        const testStats = {
            totalPostsChecked: 10,
            topSubreddits: ["technology", "programming"],
            peakHour: 20,
            isPowerUser: true,
            isActiveUser: true,
            currentCredits: 15,
            hasLifetimePlan: false,
            daysSinceSignup: 7,
            fullName: "Test User",
        };

        const content = await generatePersonalizedContent("welcome", testStats);

        if (content) {
            console.log("   ✅ Personalization working!");
            console.log(
                `   📝 Sample content: "${content.substring(0, 100)}..."`,
            );
        } else {
            console.log(
                "   ⚠️  Personalization returned null (using fallback)",
            );
        }
    } catch (error) {
        console.log(
            `   ❌ Personalization error: ${error instanceof Error ? error.message : "Unknown"}`,
        );
    }
}

// Main
async function main() {
    await testPersonalization();
    await runTests();
}

main().catch(console.error);
