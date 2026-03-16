import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy | Unbannnable",
    description:
        "Read the Unbannnable privacy policy, including how we collect, process, and protect user data.",
    alternates: {
        canonical: "https://unbannnable.com/privacy",
    },
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Navigation */}
            <nav className="px-4 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link
                        href="/"
                        className="text-2xl font-bold text-[#FF4500]"
                    >
                        Unbannnable
                    </Link>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                    Privacy Policy
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                    Last updated: January 3, 2026
                </p>

                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    {/* Introduction */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                            Introduction
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                            At Unbannnable, we take your privacy seriously. This
                            Privacy Policy explains how we collect, use,
                            disclose, and safeguard your information when you
                            use our Reddit post optimization service.
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            By using Unbannnable, you agree to the collection
                            and use of information in accordance with this
                            policy.
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                            Information We Collect
                        </h2>

                        <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-3">
                            Account Information
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                            When you sign up for Unbannnable, we collect:
                        </p>
                        <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-300 mb-4 space-y-2">
                            <li>
                                <strong>Email address</strong> – To create your
                                account and send important communications
                            </li>
                            <li>
                                <strong>Name</strong> – To personalize your
                                experience
                            </li>
                            <li>
                                <strong>Authentication data</strong> – We use
                                Clerk for secure authentication; we do not store
                                your password directly
                            </li>
                        </ul>

                        <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-3">
                            Usage Information
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                            When you use our service, we collect:
                        </p>
                        <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-300 mb-4 space-y-2">
                            <li>
                                <strong>Post content</strong> – The titles and
                                bodies of posts you submit for analysis (used
                                only for providing the service)
                            </li>
                            <li>
                                <strong>Subreddit information</strong> – Which
                                subreddits you&apos;re targeting for your posts
                            </li>
                            <li>
                                <strong>Credit usage</strong> – How many credits
                                you&apos;ve used and your remaining balance
                            </li>
                            <li>
                                <strong>Feature usage</strong> – Which AI
                                features you use (Post Analyzer, Rule Checker,
                                etc.)
                            </li>
                        </ul>

                        <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-3">
                            Analytics Data
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                            With your consent, we use PostHog to collect:
                        </p>
                        <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-300 mb-4 space-y-2">
                            <li>Page views and navigation patterns</li>
                            <li>Feature engagement metrics</li>
                            <li>
                                Device type, browser, and general location
                                (country/region)
                            </li>
                            <li>Session duration and frequency</li>
                        </ul>
                        <p className="text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
                            <strong>Note:</strong> You can opt out of analytics
                            tracking at any time by selecting &quot;Essential
                            Only&quot; in the cookie consent banner or by
                            contacting us.
                        </p>
                    </section>

                    {/* How We Use Your Information */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                            How We Use Your Information
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-300 space-y-2">
                            <li>
                                <strong>Provide our service</strong> – Analyze
                                your posts against subreddit rules and provide
                                optimization suggestions
                            </li>
                            <li>
                                <strong>Manage your account</strong> – Track
                                credits, process payments, and maintain your
                                subscription
                            </li>
                            <li>
                                <strong>Send communications</strong> – Account
                                updates, usage statistics, and (with consent)
                                newsletters and promotional content
                            </li>
                            <li>
                                <strong>Improve the service</strong> – Analyze
                                usage patterns to enhance features and user
                                experience
                            </li>
                            <li>
                                <strong>Prevent abuse</strong> – Detect and
                                prevent fraudulent or unauthorized use
                            </li>
                        </ul>
                    </section>

                    {/* AI and Data Processing */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                            AI and Data Processing
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                            Unbannnable uses AI (Claude by Anthropic) to analyze
                            your posts. Here&apos;s what you should know:
                        </p>
                        <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-300 space-y-2">
                            <li>
                                Your post content is sent to Anthropic&apos;s
                                API for analysis
                            </li>
                            <li>We do not use your posts to train AI models</li>
                            <li>
                                Post content is processed in real-time and not
                                stored by Anthropic beyond the immediate
                                analysis
                            </li>
                            <li>
                                You can review Anthropic&apos;s privacy
                                practices at{" "}
                                <a
                                    href="https://www.anthropic.com/privacy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#FF4500] hover:underline"
                                >
                                    anthropic.com/privacy
                                </a>
                            </li>
                        </ul>
                    </section>

                    {/* Data Storage */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                            Data Storage and Security
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                            We use industry-standard security measures to
                            protect your data:
                        </p>
                        <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-300 space-y-2">
                            <li>
                                <strong>Database:</strong> Your data is stored
                                in Convex, a secure, encrypted database service
                            </li>
                            <li>
                                <strong>Authentication:</strong> Handled by
                                Clerk with enterprise-grade security
                            </li>
                            <li>
                                <strong>Payments:</strong> Processed by Dodo
                                Payments; we never store your payment card
                                details
                            </li>
                            <li>
                                <strong>Emails:</strong> Sent via Resend with
                                encrypted transmission
                            </li>
                            <li>
                                All data is transmitted over HTTPS/TLS
                                encryption
                            </li>
                        </ul>
                    </section>

                    {/* Data Sharing */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                            Data Sharing
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                            We do not sell your personal information. We share
                            data only with:
                        </p>
                        <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-300 space-y-2">
                            <li>
                                <strong>Service providers</strong> – Third-party
                                services essential to our operation (Clerk,
                                Convex, Anthropic, Resend, PostHog, Dodo
                                Payments)
                            </li>
                            <li>
                                <strong>Legal requirements</strong> – When
                                required by law or to protect our rights
                            </li>
                        </ul>
                    </section>

                    {/* Your Rights */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                            Your Rights
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                            You have the right to:
                        </p>
                        <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-300 space-y-2">
                            <li>
                                <strong>Access</strong> – Request a copy of your
                                personal data
                            </li>
                            <li>
                                <strong>Correct</strong> – Update or correct
                                inaccurate information
                            </li>
                            <li>
                                <strong>Delete</strong> – Request deletion of
                                your account and data
                            </li>
                            <li>
                                <strong>Export</strong> – Receive your data in a
                                portable format
                            </li>
                            <li>
                                <strong>Opt-out</strong> – Unsubscribe from
                                marketing emails or disable analytics tracking
                            </li>
                        </ul>
                        <p className="text-neutral-600 dark:text-neutral-300 mt-4">
                            To exercise any of these rights, contact us at{" "}
                            <a
                                href="mailto:privacy@unbannnable.com"
                                className="text-[#FF4500] hover:underline"
                            >
                                privacy@unbannnable.com
                            </a>
                        </p>
                    </section>

                    {/* Cookies */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                            Cookies
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                            We use cookies for:
                        </p>
                        <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-300 space-y-2">
                            <li>
                                <strong>Essential cookies</strong> –
                                Authentication and session management (required)
                            </li>
                            <li>
                                <strong>Analytics cookies</strong> – Usage
                                tracking via PostHog (optional, with consent)
                            </li>
                        </ul>
                        <p className="text-neutral-600 dark:text-neutral-300 mt-4">
                            You can manage cookie preferences through the cookie
                            consent banner or your browser settings.
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                            Data Retention
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            We retain your account data for as long as your
                            account is active. Post analysis data is retained
                            for 90 days to provide usage statistics. If you
                            delete your account, we will remove your personal
                            data within 30 days, except where required by law.
                        </p>
                    </section>

                    {/* Children */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                            Children&apos;s Privacy
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Unbannnable is not intended for users under 13 years
                            of age. We do not knowingly collect personal
                            information from children. If you believe we have
                            collected data from a child, please contact us
                            immediately.
                        </p>
                    </section>

                    {/* Changes */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                            Changes to This Policy
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            We may update this Privacy Policy from time to time.
                            We will notify you of significant changes by posting
                            a notice on our website or sending you an email. The
                            &quot;Last updated&quot; date at the top indicates
                            when this policy was last revised.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                            Contact Us
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                            If you have questions about this Privacy Policy or
                            our data practices, contact us at:
                        </p>
                        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
                            <p className="text-neutral-700 dark:text-neutral-300">
                                <strong>Unbannnable</strong>
                                <br />
                                Email:{" "}
                                <a
                                    href="mailto:privacy@unbannnable.com"
                                    className="text-[#FF4500] hover:underline"
                                >
                                    privacy@unbannnable.com
                                </a>
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 px-4">
                <div className="max-w-4xl mx-auto text-center text-sm text-neutral-500 dark:text-neutral-400">
                    <p>
                        © {new Date().getFullYear()} Unbannnable. All rights
                        reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
