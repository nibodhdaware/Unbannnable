"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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
    }>;
    metadata?: Record<string, string>;
}

export default function SuccessPage() {
    const { user } = useUser();
    const router = useRouter();
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            try {
                // Get payment ID from URL params
                const urlParams = new URLSearchParams(window.location.search);
                const paymentId = urlParams.get("payment_id");

                if (!paymentId) {
                    setError("No payment ID found in URL");
                    setLoading(false);
                    return;
                }

                console.log("Fetching payment details for:", paymentId);

                // Fetch payment details from our API (which will call Dodo API)
                const response = await fetch(
                    `/api/payments/details?payment_id=${paymentId}`,
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch payment details: ${response.status}`,
                    );
                }

                const details = await response.json();
                setPaymentDetails(details);

                // Save payment to our database if user is available and payment was successful
                if (user && details.status === "succeeded") {
                    await savePaymentToDatabase(details);
                }
            } catch (error) {
                console.error("Error fetching payment details:", error);
                setError(
                    error instanceof Error ? error.message : "Unknown error",
                );
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPaymentDetails();
        } else {
            setLoading(false);
        }
    }, [user]);

    const savePaymentToDatabase = async (details: PaymentDetails) => {
        try {
            const response = await fetch("/api/payments/record", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clerkId: user?.id,
                    email: user?.emailAddresses[0]?.emailAddress,
                    paymentId: details.paymentId,
                    amount: details.amount, // Already in cents from Dodo
                    currency: details.currency,
                    status: details.status,
                    paymentProvider: "dodo",
                    customerData: details.customer,
                    productCart: details.product_cart,
                    metadata: details.metadata,
                    createdAt: details.created_at,
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error(
                    "Failed to save payment to database:",
                    response.status,
                    errorData,
                );
            } else {
                console.log("Payment successfully recorded in database");
            }
        } catch (error) {
            console.error("Error saving payment:", error);
        }
    };

    const handleContinue = () => {
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Success Icon */}
                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                {/* Success Message */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Payment Successful! 🎉
                </h1>

                <p className="text-gray-600 mb-6">
                    Thank you for your subscription! You now have access to
                    premium features.
                </p>

                {/* User Info */}
                {user && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600">
                            Welcome,{" "}
                            <span className="font-medium">
                                {user.fullName ||
                                    user.firstName ||
                                    "Premium User"}
                            </span>
                            !
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {user.emailAddresses[0]?.emailAddress}
                        </p>
                    </div>
                )}

                {/* Payment Details */}
                {paymentDetails && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-medium text-blue-900 mb-2">
                            Payment Details
                        </h3>
                        {paymentDetails.paymentId && (
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">Payment ID:</span>{" "}
                                {paymentDetails.paymentId}
                            </p>
                        )}
                        <p className="text-sm text-blue-700">
                            <span className="font-medium">Status:</span>{" "}
                            {paymentDetails.status}
                        </p>
                        <p className="text-sm text-blue-700">
                            <span className="font-medium">Amount:</span> $
                            {(paymentDetails.amount / 100).toFixed(2)}{" "}
                            {paymentDetails.currency}
                        </p>
                        <p className="text-sm text-blue-700">
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(
                                paymentDetails.created_at,
                            ).toLocaleDateString()}
                        </p>
                    </div>
                )}

                {/* Features List */}
                <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-medium text-green-900 mb-3">
                        Your Premium Features
                    </h3>
                    <ul className="space-y-2">
                        <li className="flex items-center text-sm text-green-700">
                            <svg
                                className="w-4 h-4 mr-2 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Unlimited AI optimizations
                        </li>
                        <li className="flex items-center text-sm text-green-700">
                            <svg
                                className="w-4 h-4 mr-2 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Priority support
                        </li>
                        <li className="flex items-center text-sm text-green-700">
                            <svg
                                className="w-4 h-4 mr-2 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Advanced analytics
                        </li>
                        <li className="flex items-center text-sm text-green-700">
                            <svg
                                className="w-4 h-4 mr-2 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Reddit posting assistance
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleContinue}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Continue to Dashboard
                    </button>

                    <p className="text-xs text-gray-500">
                        Questions? Contact us at support@unbannnable.com
                    </p>
                </div>
            </div>
        </div>
    );
}
