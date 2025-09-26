"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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

    // Mutation to add credits
    const addCredits = useMutation(api.users.addCredits);

    useEffect(() => {
        const handlePaymentSuccess = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                setCreditAllocationStatus({
                    status: "pending",
                    message: "Processing your payment and adding credits...",
                });

                // Get payment details from URL
                const urlParams = new URLSearchParams(window.location.search);
                const paymentId =
                    urlParams.get("payment_id") ||
                    urlParams.get("id") ||
                    urlParams.get("payment");
                const amount = urlParams.get("amount") || "9.00";

                // Add 100 credits to user account
                const newCreditTotal = await addCredits({
                    clerkId: user.id,
                    credits: 100,
                });

                // Update status
                setCreditAllocationStatus({
                    status: "success",
                    message: "Successfully added 100 credits to your account!",
                    creditsAdded: 100,
                });

                // Set basic payment details for display
                setPaymentDetails({
                    paymentId: paymentId || `payment_${Date.now()}`,
                    status: "succeeded",
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
                        "Payment successful but there was an issue adding credits. Please contact support.",
                });
                setError("Failed to process payment success");
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded && user) {
            handlePaymentSuccess();
        } else if (isLoaded && !user) {
            setError("Please sign in to view payment details");
            setLoading(false);
        }
    }, [user, isLoaded, addCredits]);

    const handleGoToApp = () => {
        router.push("/app");
    };

    const formatAmount = (amount: number) => {
        return (amount / 100).toFixed(2);
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Processing your payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-red-600">Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => router.push("/app")}
                            className="w-full"
                        >
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-900">
                        Payment Successful! 🎉
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600">
                        Thank you for your purchase. Your credits have been
                        added to your account.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Credit Status */}
                    <div
                        className={`p-4 rounded-lg border ${
                            creditAllocationStatus.status === "success"
                                ? "bg-green-50 border-green-200"
                                : creditAllocationStatus.status === "error"
                                  ? "bg-red-50 border-red-200"
                                  : "bg-blue-50 border-blue-200"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {creditAllocationStatus.status === "pending" && (
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            )}
                            {creditAllocationStatus.status === "success" && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            {creditAllocationStatus.status === "error" && (
                                <div className="h-5 w-5 bg-red-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">
                                        !
                                    </span>
                                </div>
                            )}
                            <div>
                                <h3
                                    className={`font-semibold ${
                                        creditAllocationStatus.status ===
                                        "success"
                                            ? "text-green-900"
                                            : creditAllocationStatus.status ===
                                                "error"
                                              ? "text-red-900"
                                              : "text-blue-900"
                                    }`}
                                >
                                    Credit Update
                                </h3>
                                <p
                                    className={`text-sm ${
                                        creditAllocationStatus.status ===
                                        "success"
                                            ? "text-green-800"
                                            : creditAllocationStatus.status ===
                                                "error"
                                              ? "text-red-800"
                                              : "text-blue-800"
                                    }`}
                                >
                                    {creditAllocationStatus.message}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    {paymentDetails && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Details
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Amount:
                                    </span>
                                    <span className="font-medium">
                                        ${formatAmount(paymentDetails.amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Credits Added:
                                    </span>
                                    <span className="font-medium text-green-600">
                                        100 credits
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Status:
                                    </span>
                                    <span className="font-medium text-green-600 capitalize">
                                        {paymentDetails.status}
                                    </span>
                                </div>
                                {paymentDetails.paymentId && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Payment ID:
                                        </span>
                                        <span className="font-mono text-xs bg-white px-2 py-1 rounded">
                                            {paymentDetails.paymentId}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Current Credits Display */}
                    {userData && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-900 mb-2">
                                Your Credits
                            </h3>
                            <p className="text-2xl font-bold text-blue-800">
                                {userData.totalPurchasedPosts || 0} credits
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                Ready to use with AI-powered features
                            </p>
                        </div>
                    )}

                    {/* AI Tools Summary */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                        <h3 className="font-semibold text-purple-900 mb-3">
                            What you can do with your credits:
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-purple-800">
                                <span>🎯 AI Post Analyzer</span>
                                <span className="font-medium">10 credits</span>
                            </div>
                            <div className="flex justify-between text-purple-800">
                                <span>🛡️ Rule Checker</span>
                                <span className="font-medium">5 credits</span>
                            </div>
                            <div className="flex justify-between text-purple-800">
                                <span>🎯 Find Better Subreddits</span>
                                <span className="font-medium">5 credits</span>
                            </div>
                            <div className="flex justify-between text-purple-800">
                                <span>🔍 Anomaly Detection</span>
                                <span className="font-medium">3 credits</span>
                            </div>
                            <div className="flex justify-between text-purple-800">
                                <span>🏷️ Smart Flair Suggestions</span>
                                <span className="font-medium">2 credits</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button
                        onClick={handleGoToApp}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
                        size="lg"
                    >
                        Go to Dashboard & Start Using Credits 🚀
                    </Button>

                    <p className="text-center text-sm text-gray-500">
                        Your credits never expire and can be used anytime!
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
