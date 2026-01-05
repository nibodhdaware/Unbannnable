"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Mail, AlertCircle } from "lucide-react";

interface EmailPreferences {
    allEmails: boolean;
    marketingEmails: boolean;
    criticalUpdates: boolean;
}

function EmailPreferencesContent() {
    const { isSignedIn, isLoaded } = useAuth();
    const searchParams = useSearchParams();
    const [preferences, setPreferences] = useState<EmailPreferences>({
        allEmails: true,
        marketingEmails: true,
        criticalUpdates: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const unsubscribed = searchParams.get("unsubscribed") === "true";
    const error = searchParams.get("error");

    useEffect(() => {
        if (unsubscribed) {
            setMessage({
                type: "success",
                text: "You have been unsubscribed from marketing emails.",
            });
            setPreferences({
                allEmails: false,
                marketingEmails: false,
                criticalUpdates: true,
            });
            setLoading(false);
            return;
        }

        if (error) {
            setMessage({
                type: "error",
                text: `Error: ${error.replace(/_/g, " ")}`,
            });
            setLoading(false);
            return;
        }

        if (isLoaded && isSignedIn) {
            fetchPreferences();
        } else if (isLoaded && !isSignedIn) {
            setLoading(false);
        }
    }, [isLoaded, isSignedIn, unsubscribed, error]);

    const fetchPreferences = async () => {
        try {
            const response = await fetch("/api/email-preferences");
            const data = await response.json();
            if (data.success) {
                setPreferences(data.preferences);
            }
        } catch (error) {
            console.error("Error fetching preferences:", error);
        } finally {
            setLoading(false);
        }
    };

    const savePreferences = async () => {
        if (!isSignedIn) return;

        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch("/api/email-preferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ preferences }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({
                    type: "success",
                    text: "Preferences saved successfully!",
                });
            } else {
                setMessage({
                    type: "error",
                    text: data.error || "Failed to save preferences",
                });
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: "An error occurred. Please try again.",
            });
        } finally {
            setSaving(false);
        }
    };

    const togglePreference = (key: keyof EmailPreferences) => {
        setPreferences((prev) => {
            const newPrefs = { ...prev, [key]: !prev[key] };

            // If all emails is turned off, turn off marketing too
            if (key === "allEmails" && !newPrefs.allEmails) {
                newPrefs.marketingEmails = false;
            }

            // If all emails is turned on, keep critical updates on
            if (key === "allEmails" && newPrefs.allEmails) {
                newPrefs.criticalUpdates = true;
            }

            // Critical updates can't be turned off
            if (key === "criticalUpdates") {
                newPrefs.criticalUpdates = true;
            }

            return newPrefs;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-lg mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <CardTitle className="text-2xl">
                            Email Preferences
                        </CardTitle>
                        <CardDescription>
                            Control which emails you receive from Unbannnable
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {message && (
                            <div
                                className={`flex items-center gap-2 p-4 rounded-lg ${
                                    message.type === "success"
                                        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                        : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                }`}
                            >
                                {message.type === "success" ? (
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                ) : (
                                    <XCircle className="w-5 h-5 flex-shrink-0" />
                                )}
                                <span>{message.text}</span>
                            </div>
                        )}

                        {!isSignedIn && !unsubscribed && (
                            <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>
                                    Sign in to manage your email preferences
                                </span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* All Emails Toggle */}
                            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                                <div>
                                    <Label className="font-medium">
                                        All Emails
                                    </Label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Receive all emails from Unbannnable
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        togglePreference("allEmails")
                                    }
                                    disabled={!isSignedIn}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        preferences.allEmails
                                            ? "bg-indigo-600"
                                            : "bg-gray-200 dark:bg-gray-700"
                                    } ${!isSignedIn ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            preferences.allEmails
                                                ? "translate-x-6"
                                                : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Marketing Emails Toggle */}
                            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                                <div>
                                    <Label className="font-medium">
                                        Marketing & Tips
                                    </Label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Tips, usage stats, and upgrade offers
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        togglePreference("marketingEmails")
                                    }
                                    disabled={
                                        !isSignedIn || !preferences.allEmails
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        preferences.marketingEmails
                                            ? "bg-indigo-600"
                                            : "bg-gray-200 dark:bg-gray-700"
                                    } ${!isSignedIn || !preferences.allEmails ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            preferences.marketingEmails
                                                ? "translate-x-6"
                                                : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Critical Updates Toggle */}
                            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <div>
                                    <Label className="font-medium">
                                        Critical Updates
                                    </Label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Security alerts and account
                                        notifications (always on)
                                    </p>
                                </div>
                                <button
                                    disabled
                                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 opacity-50 cursor-not-allowed"
                                >
                                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                                </button>
                            </div>
                        </div>

                        {isSignedIn && (
                            <Button
                                onClick={savePreferences}
                                disabled={saving}
                                className="w-full"
                            >
                                {saving ? "Saving..." : "Save Preferences"}
                            </Button>
                        )}

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            You can change these preferences at any time from
                            your account settings.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
    );
}

export default function EmailPreferencesPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <EmailPreferencesContent />
        </Suspense>
    );
}
