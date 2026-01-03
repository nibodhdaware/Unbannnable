"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAdmin } from "@/hooks/useAdmin";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Mail,
    Send,
    AlertCircle,
    Eye,
    MousePointerClick,
    TrendingUp,
    RefreshCw,
} from "lucide-react";

interface EmailStats {
    total: number;
    sent: number;
    failed: number;
    opened: number;
    clicked: number;
    byType: Record<string, number>;
}

const EMAIL_TYPE_LABELS: Record<string, string> = {
    welcome: "Welcome",
    first_use_nudge: "First Use Nudge",
    value_reinforcement: "Value Reinforcement",
    upgrade_prompt: "Upgrade Prompt",
    re_engagement: "Re-engagement",
};

export default function EmailDashboardPage() {
    const { isAdmin, loading: adminLoading } = useAdmin();
    const router = useRouter();
    const stats = useQuery(api.emails.getEmailStats);
    const [triggerLoading, setTriggerLoading] = useState(false);
    const [triggerResult, setTriggerResult] = useState<any>(null);

    useEffect(() => {
        if (!adminLoading && !isAdmin) {
            router.push("/app");
        }
    }, [isAdmin, adminLoading, router]);

    if (adminLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    const openRate =
        stats && stats.sent > 0
            ? ((stats.opened / stats.sent) * 100).toFixed(1)
            : "0";
    const clickRate =
        stats && stats.opened > 0
            ? ((stats.clicked / stats.opened) * 100).toFixed(1)
            : "0";

    const triggerEmails = async () => {
        setTriggerLoading(true);
        setTriggerResult(null);
        try {
            const response = await fetch("/api/cron/email-triggers", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ""}`,
                },
            });
            const result = await response.json();
            setTriggerResult(result);
        } catch (error) {
            setTriggerResult({
                success: false,
                error: "Failed to trigger emails",
            });
        } finally {
            setTriggerLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Email Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Monitor email performance and engagement
                        </p>
                    </div>
                    <Button
                        onClick={triggerEmails}
                        disabled={triggerLoading}
                        variant="outline"
                    >
                        <RefreshCw
                            className={`w-4 h-4 mr-2 ${triggerLoading ? "animate-spin" : ""}`}
                        />
                        {triggerLoading ? "Processing..." : "Run Triggers"}
                    </Button>
                </div>

                {triggerResult && (
                    <Card
                        className={
                            triggerResult.success
                                ? "border-green-500"
                                : "border-red-500"
                        }
                    >
                        <CardContent className="pt-4">
                            <pre className="text-sm overflow-auto">
                                {JSON.stringify(triggerResult, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Total Emails
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">
                                {stats?.total || 0}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Send className="w-4 h-4 text-green-500" />
                                Sent
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600">
                                {stats?.sent || 0}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                Failed
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-red-600">
                                {stats?.failed || 0}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-500" />
                                Opened
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-blue-600">
                                {stats?.opened || 0}
                            </p>
                            <p className="text-sm text-gray-500">
                                {openRate}% rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <MousePointerClick className="w-4 h-4 text-purple-500" />
                                Clicked
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-purple-600">
                                {stats?.clicked || 0}
                            </p>
                            <p className="text-sm text-gray-500">
                                {clickRate}% rate
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* By Email Type */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Emails by Type
                        </CardTitle>
                        <CardDescription>
                            Breakdown of emails sent by template
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(stats?.byType || {}).map(
                                ([type, count]) => {
                                    const total = stats?.total || 1;
                                    const percentage = (
                                        ((count as number) / total) *
                                        100
                                    ).toFixed(1);
                                    return (
                                        <div key={type} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium">
                                                    {EMAIL_TYPE_LABELS[type] ||
                                                        type}
                                                </span>
                                                <span className="text-gray-500">
                                                    {count as number} (
                                                    {percentage}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-600 h-2 rounded-full transition-all"
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                },
                            )}

                            {Object.keys(stats?.byType || {}).length === 0 && (
                                <p className="text-center text-gray-500 py-8">
                                    No emails sent yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Open Rate</CardTitle>
                            <CardDescription>
                                Percentage of sent emails that were opened
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center">
                                <div className="relative w-32 h-32">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="none"
                                            className="text-gray-200 dark:text-gray-700"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="none"
                                            strokeLinecap="round"
                                            className="text-blue-600"
                                            strokeDasharray={`${(parseFloat(openRate) / 100) * 352} 352`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold">
                                            {openRate}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Click Rate</CardTitle>
                            <CardDescription>
                                Percentage of opened emails with clicks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center">
                                <div className="relative w-32 h-32">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="none"
                                            className="text-gray-200 dark:text-gray-700"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="none"
                                            strokeLinecap="round"
                                            className="text-purple-600"
                                            strokeDasharray={`${(parseFloat(clickRate) / 100) * 352} 352`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold">
                                            {clickRate}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Test Email Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Test Emails</CardTitle>
                        <CardDescription>
                            Send test emails to verify templates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {Object.entries(EMAIL_TYPE_LABELS).map(
                                ([type, label]) => (
                                    <Button
                                        key={type}
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            // This would call the test email endpoint
                                            alert(
                                                `Test ${label} email - Implement test endpoint`,
                                            );
                                        }}
                                    >
                                        {label}
                                    </Button>
                                ),
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            Test emails will be sent to:{" "}
                            {process.env.NEXT_PUBLIC_TEST_EMAIL ||
                                "Configure EMAIL_TEST_RECIPIENT"}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
