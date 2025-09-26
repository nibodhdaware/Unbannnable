"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface PaymentDetails {
    paymentId: string;
    status: string;
    amount: number;
    currency: string;
    customer: {
        customer_id: string;
        name: string;
        email: string;
    };
    created_at: string;
    product_cart?: Array<{
        product_id: string;
        quantity: number;
        amount?: number;
    }>;
    metadata?: Record<string, string>;
}

export default function SuccessPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creditAllocationStatus, setCreditAllocationStatus] = useState<{
        status: "pending" | "success" | "error";
        message?: string;
        creditsAdded?: number;
    }>({ status: "pending" });

    // Get current user data from Convex
    const userData = useQuery(
        api.users.getUserByClerkId,
        user?.id ? { clerkId: user.id } : "skip",
    );

    useEffect(() => {
        const handlePaymentResult = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);

                // Get payment details from URL
                const urlParams = new URLSearchParams(window.location.search);
                const paymentId =
                    urlParams.get("payment_id") ||
                    urlParams.get("id") ||
                    urlParams.get("payment");
                const paymentStatus =
                    urlParams.get("status") || urlParams.get("payment_status");
                const amount = urlParams.get("amount") || "9.00";

                if (!paymentId) {
                    setError("No payment ID found in URL");
                    return;
                }

                // Check if payment was cancelled
                const cancelled =
                    urlParams.get("cancelled") === "true" ||
                    paymentStatus === "cancelled" ||
                    urlParams.get("cancel") === "true";

                if (cancelled) {
                    // Redirect to cancel page if payment was cancelled
                    router.push(`/cancel?payment_id=${paymentId || "unknown"}`);
                    return;
                }

                setCreditAllocationStatus({
                    status: "pending",
                    message: "Verifying your payment and processing credits...",
                });

                // Verify payment with our secure API
                const verificationResponse = await fetch(
                    "/api/verify-payment",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ paymentId }),
                    },
                );

                if (!verificationResponse.ok) {
                    throw new Error("Payment verification failed");
                }

                const verificationData = await verificationResponse.json();

                if (verificationData.alreadyProcessed) {
                    // Payment has already been processed
                    setCreditAllocationStatus({
                        status: "success",
                        message: verificationData.message,
                        creditsAdded: 100,
                    });
                } else if (verificationData.pending) {
                    // Payment is still being processed
                    setCreditAllocationStatus({
                        status: "pending",
                        message: verificationData.message,
                    });

                    // Poll for payment completion every 3 seconds
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                } else {
                    // Something went wrong
                    setCreditAllocationStatus({
                        status: "error",
                        message:
                            "Payment could not be verified. Please contact support.",
                    });
                }

                // Set basic payment details for display
                setPaymentDetails({
                    paymentId: paymentId,
                    status: verificationData.alreadyProcessed
                        ? "succeeded"
                        : "pending",
                    amount: 900, // $9.00 in cents
                    currency: "USD",
                    customer: {
                        customer_id: user.id,
                        name: user.fullName || user.firstName || "User",
                        email: user.emailAddresses[0]?.emailAddress || "",
                    },
                    created_at: new Date().toISOString(),
                    metadata: {
                        userId: user.id,
                        credits: "100",
                        amount: amount,
                    },
                });
            } catch (err) {
                console.error("Error processing payment success:", err);
                setCreditAllocationStatus({
                    status: "error",
                    message:
                        "Failed to process payment. Please contact support.",
                });
                setError(
                    "There was an error processing your payment. Please contact support if this persists.",
                );
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded && user) {
            handlePaymentResult();
        } else if (isLoaded && !user) {
            setError("Please sign in to view payment details");
            setLoading(false);
        }
    }, [user, isLoaded, router]);

    const handleGoToApp = () => {
        router.push("/app");
    };

    const formatAmount = (amount: number) => {
        return (amount / 100).toFixed(2);
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FF4500]" />
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Processing your payment...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6 text-center">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight text-red-600 dark:text-red-400">
                            Error
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {error}
                        </p>
                    </div>
                    <div className="p-6 pt-0">
                        <button
                            onClick={() => router.push("/app")}
                            className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-[#FF4500] text-white hover:bg-[#e03d00] h-10 px-4 py-2 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6 text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-neutral-900 dark:text-white">
                        Payment Successful! 🎉
                    </h3>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400">
                        Thank you for your purchase. Your credits have been
                        added to your account.
                    </p>
                </div>

                <div className="p-6 pt-0 space-y-6">
                    {/* Credit Status */}
                    <div
                        className={`p-4 rounded-lg border ${
                            creditAllocationStatus.status === "success"
                                ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                                : creditAllocationStatus.status === "error"
                                  ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                                  : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            {creditAllocationStatus.status === "pending" && (
                                <Loader2 className="h-5 w-5 animate-spin text-[#FF4500]" />
                            )}
                            {creditAllocationStatus.status === "success" && (
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            )}
                            {creditAllocationStatus.status === "error" && (
                                <div className="h-5 w-5 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">
                                        !
                                    </span>
                                </div>
                            )}
                            <span
                                className={`font-semibold ${
                                    creditAllocationStatus.status === "success"
                                        ? "text-green-700 dark:text-green-300"
                                        : creditAllocationStatus.status ===
                                            "error"
                                          ? "text-red-700 dark:text-red-300"
                                          : "text-neutral-700 dark:text-neutral-300"
                                }`}
                            >
                                Credit Update
                            </span>
                        </div>
                        <p
                            className={`text-sm ${
                                creditAllocationStatus.status === "success"
                                    ? "text-green-600 dark:text-green-400"
                                    : creditAllocationStatus.status === "error"
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-neutral-600 dark:text-neutral-400"
                            }`}
                        >
                            {creditAllocationStatus.message}
                        </p>
                    </div>

                    {/* Payment Details */}
                    {paymentDetails && (
                        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-3 border border-neutral-200 dark:border-neutral-700">
                            <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-[#FF4500]" />
                                Payment Details
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600 dark:text-neutral-400">
                                        Amount:
                                    </span>
                                    <span className="font-medium text-neutral-900 dark:text-white">
                                        ${formatAmount(paymentDetails.amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600 dark:text-neutral-400">
                                        Credits Added:
                                    </span>
                                    <span className="font-medium text-[#FF4500]">
                                        100 credits
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600 dark:text-neutral-400">
                                        Status:
                                    </span>
                                    <span className="font-medium text-green-600 dark:text-green-400 capitalize">
                                        {paymentDetails.status}
                                    </span>
                                </div>
                                {paymentDetails.paymentId && (
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Payment ID:
                                        </span>
                                        <span className="font-mono text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded text-neutral-700 dark:text-neutral-300">
                                            {paymentDetails.paymentId}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Current Credits Display */}
                    {userData && (
                        <div className="bg-[#FF4500]/10 dark:bg-[#FF4500]/5 p-4 rounded-lg border border-[#FF4500]/20 dark:border-[#FF4500]/10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 bg-[#FF4500] rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                        💎
                                    </span>
                                </div>
                                <h3 className="font-semibold text-[#FF4500] dark:text-[#FF4500]">
                                    Your Credits
                                </h3>
                            </div>
                            <p className="text-2xl font-bold text-[#FF4500] dark:text-[#FF4500] mb-1">
                                {userData.totalPurchasedPosts || 0} credits
                            </p>
                            <p className="text-sm text-[#FF4500]/80 dark:text-[#FF4500]/70">
                                Ready to use with AI-powered features
                            </p>
                        </div>
                    )}

                    {/* AI Tools Summary */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 bg-gradient-to-r from-[#FF4500] to-[#e03d00] rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">🚀</span>
                            </div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                                What you can do with your credits:
                            </h3>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300 py-1">
                                <span className="flex items-center gap-2">
                                    <span>🎯</span>
                                    <span>AI Post Analyzer</span>
                                </span>
                                <span className="font-medium text-[#FF4500] bg-[#FF4500]/10 px-2 py-1 rounded-full text-xs">
                                    10 credits
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300 py-1">
                                <span className="flex items-center gap-2">
                                    <span>🛡️</span>
                                    <span>Rule Checker</span>
                                </span>
                                <span className="font-medium text-[#FF4500] bg-[#FF4500]/10 px-2 py-1 rounded-full text-xs">
                                    5 credits
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300 py-1">
                                <span className="flex items-center gap-2">
                                    <span>🎯</span>
                                    <span>Find Better Subreddits</span>
                                </span>
                                <span className="font-medium text-[#FF4500] bg-[#FF4500]/10 px-2 py-1 rounded-full text-xs">
                                    5 credits
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300 py-1">
                                <span className="flex items-center gap-2">
                                    <span>🔍</span>
                                    <span>Anomaly Detection</span>
                                </span>
                                <span className="font-medium text-[#FF4500] bg-[#FF4500]/10 px-2 py-1 rounded-full text-xs">
                                    3 credits
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300 py-1">
                                <span className="flex items-center gap-2">
                                    <span>🏷️</span>
                                    <span>Smart Flair Suggestions</span>
                                </span>
                                <span className="font-medium text-[#FF4500] bg-[#FF4500]/10 px-2 py-1 rounded-full text-xs">
                                    2 credits
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleGoToApp}
                        className="w-full bg-[#FF4500] hover:bg-[#e03d00] text-white font-semibold py-3 px-8 text-lg rounded-md transition-colors"
                    >
                        Go to Dashboard & Start Using Credits 🚀
                    </button>

                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                        Your credits never expire and can be used anytime!
                    </p>
                </div>
            </div>
        </div>
    );
}
