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
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allocationStatus, setAllocationStatus] = useState<{
        status: "pending" | "success" | "error";
        message?: string;
        postsAllocated?: number;
    } | null>(null);

    // Helper function to get currency symbol
    const getCurrencySymbol = (currency: string) => {
        switch (currency.toUpperCase()) {
            case "USD":
                return "$";
            case "INR":
                return "₹";
            case "EUR":
                return "€";
            case "GBP":
                return "£";
            case "CAD":
                return "C$";
            case "AUD":
                return "A$";
            case "JPY":
                return "¥";
            case "CNY":
                return "¥";
            case "KRW":
                return "₩";
            case "RUB":
                return "₽";
            case "BRL":
                return "R$";
            case "MXN":
                return "$";
            case "SGD":
                return "S$";
            case "HKD":
                return "HK$";
            case "NZD":
                return "NZ$";
            case "CHF":
                return "CHF";
            case "SEK":
                return "kr";
            case "NOK":
                return "kr";
            case "DKK":
                return "kr";
            case "PLN":
                return "zł";
            case "CZK":
                return "Kč";
            case "HUF":
                return "Ft";
            case "RON":
                return "lei";
            case "BGN":
                return "лв";
            case "HRK":
                return "kn";
            case "RSD":
                return "дин";
            case "UAH":
                return "₴";
            case "TRY":
                return "₺";
            case "ILS":
                return "₪";
            case "AED":
                return "د.إ";
            case "SAR":
                return "ر.س";
            case "QAR":
                return "ر.ق";
            case "KWD":
                return "د.ك";
            case "BHD":
                return ".د.ب";
            case "OMR":
                return "ر.ع.";
            case "JOD":
                return "د.أ";
            case "LBP":
                return "ل.ل";
            case "EGP":
                return "ج.م";
            case "ZAR":
                return "R";
            case "NGN":
                return "₦";
            case "KES":
                return "KSh";
            case "GHS":
                return "GH₵";
            case "UGX":
                return "USh";
            case "TZS":
                return "TSh";
            case "MAD":
                return "د.م.";
            case "TND":
                return "د.ت";
            case "DZD":
                return "د.ج";
            case "LYD":
                return "ل.د";
            case "SDG":
                return "ج.س.";
            case "ETB":
                return "Br";
            case "SOS":
                return "S";
            case "DJF":
                return "Fdj";
            case "KMF":
                return "CF";
            case "MUR":
                return "₨";
            case "SCR":
                return "₨";
            case "CDF":
                return "FC";
            case "RWF":
                return "FRw";
            case "BIF":
                return "FBu";
            case "MWK":
                return "MK";
            case "ZMW":
                return "ZK";
            case "ZWL":
                return "Z$";
            case "BWP":
                return "P";
            case "NAD":
                return "N$";
            case "LSL":
                return "L";
            case "SZL":
                return "E";
            case "MOP":
                return "MOP$";
            case "THB":
                return "฿";
            case "VND":
                return "₫";
            case "IDR":
                return "Rp";
            case "MYR":
                return "RM";
            case "PHP":
                return "₱";
            case "BDT":
                return "৳";
            case "PKR":
                return "₨";
            case "LKR":
                return "Rs";
            case "NPR":
                return "₨";
            case "MMK":
                return "K";
            case "KHR":
                return "៛";
            case "LAK":
                return "₭";
            case "MNT":
                return "₮";
            case "KZT":
                return "₸";
            case "UZS":
                return "so'm";
            case "TJS":
                return "ЅM";
            case "TMT":
                return "T";
            case "AZN":
                return "₼";
            case "GEL":
                return "₾";
            case "AMD":
                return "֏";
            case "BYN":
                return "Br";
            case "MDL":
                return "L";
            case "ALL":
                return "L";
            case "MKD":
                return "ден";
            case "BAM":
                return "KM";
            case "XOF":
                return "CFA";
            case "XAF":
                return "FCFA";
            case "XPF":
                return "CFP";
            case "CLP":
                return "$";
            case "COP":
                return "$";
            case "PEN":
                return "S/";
            case "UYU":
                return "$U";
            case "PYG":
                return "₲";
            case "BOB":
                return "Bs";
            case "ARS":
                return "$";
            case "VES":
                return "Bs";
            case "GTQ":
                return "Q";
            case "HNL":
                return "L";
            case "NIO":
                return "C$";
            case "CRC":
                return "₡";
            case "PAB":
                return "B/.";
            case "DOP":
                return "RD$";
            case "JMD":
                return "J$";
            case "TTD":
                return "TT$";
            case "BBD":
                return "$";
            case "XCD":
                return "$";
            case "AWG":
                return "ƒ";
            case "ANG":
                return "ƒ";
            case "SRD":
                return "$";
            case "GYD":
                return "$";
            case "BZD":
                return "BZ$";
            case "BMD":
                return "$";
            case "KYD":
                return "$";
            case "FJD":
                return "$";
            case "WST":
                return "T";
            case "TOP":
                return "T$";
            case "SBD":
                return "$";
            case "VUV":
                return "Vt";
            case "PGK":
                return "K";
            case "KID":
                return "$";
            case "TVD":
                return "$";
            case "CKD":
                return "$";
            default:
                return currency.toUpperCase();
        }
    };

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            try {
                // Get payment ID from URL params
                const urlParams = new URLSearchParams(window.location.search);

                const paymentId =
                    urlParams.get("payment_id") ||
                    urlParams.get("id") ||
                    urlParams.get("payment") ||
                    urlParams.get("session_id");

                if (!paymentId) {
                    // Try to allocate posts based on amount from URL params
                    const amount = urlParams.get("amount");
                    if (amount) {
                        setAllocationStatus({
                            status: "pending",
                            message: "Allocating posts to your account...",
                        });

                        try {
                            const manualResponse = await fetch(
                                "/api/payments/manual-record",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        amount: parseInt(amount),
                                    }),
                                },
                            );

                            if (manualResponse.ok) {
                                const manualResult =
                                    await manualResponse.json();

                                if (manualResult.allocation) {
                                    setAllocationStatus({
                                        status: "success",
                                        message: `Successfully allocated ${manualResult.allocation.postsAdded} posts to your account!`,
                                        postsAllocated:
                                            manualResult.allocation.postsAdded,
                                    });
                                } else {
                                    setAllocationStatus({
                                        status: "success",
                                        message:
                                            "Payment completed successfully! Your posts have been added to your account.",
                                    });
                                }
                            } else {
                                setAllocationStatus({
                                    status: "success",
                                    message:
                                        "Payment completed successfully! Your posts have been added to your account.",
                                });
                            }
                        } catch (error) {
                            setAllocationStatus({
                                status: "success",
                                message:
                                    "Payment completed successfully! Your posts have been added to your account.",
                            });
                        }
                    } else {
                        setAllocationStatus({
                            status: "success",
                            message:
                                "Payment completed successfully! Your posts have been added to your account.",
                        });
                    }
                    setLoading(false);
                    return;
                }

                // Fetch payment details from our API (which will call Dodo API)
                const response = await fetch(
                    `/api/payments/details?payment_id=${paymentId}`,
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));

                    // Show more helpful error message for 403 errors
                    if (response.status === 403) {
                        const message = `Payment access denied. This payment may belong to a different user.`;
                        throw new Error(message);
                    }

                    throw new Error(
                        `Failed to fetch payment details: ${response.status} - ${errorData.error || response.statusText}`,
                    );
                }

                const details: PaymentDetails = await response.json();

                // Debug: Log the payment details to see what we're getting
                console.log("Payment details received:", details);

                setPaymentDetails(details);

                // Save payment to our database if user is available and payment was successful
                if (user && details.status === "succeeded") {
                    setAllocationStatus({
                        status: "pending",
                        message: "Allocating posts to your account...",
                    });

                    try {
                        const result = await savePaymentToDatabase(details);

                        if (result.error) {
                            setAllocationStatus({
                                status: "error",
                                message:
                                    "Payment recorded but post allocation failed. Please contact support.",
                            });
                        } else if (result.allocation) {
                            setAllocationStatus({
                                status: "success",
                                message: `Successfully allocated ${result.allocation.postsAdded} posts to your account!`,
                                postsAllocated: result.allocation.postsAdded,
                            });
                        } else {
                            setAllocationStatus({
                                status: "success",
                                message: "Payment processed successfully!",
                            });
                        }
                    } catch (error) {
                        setAllocationStatus({
                            status: "error",
                            message:
                                "Error processing payment. Please contact support.",
                        });
                    }
                }
            } catch (error) {
                setError(
                    error instanceof Error ? error.message : "Unknown error",
                );
            } finally {
                setLoading(false);
            }
        };

        // Only fetch payment details if user is loaded and authenticated
        if (user && isLoaded) {
            fetchPaymentDetails();
        } else if (isLoaded && !user) {
            setError("Please sign in to view payment details");
            setLoading(false);
        }
    }, [user, isLoaded]); // Add isLoaded to dependencies

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
                return { error: errorData };
            } else {
                const result = await response.json();
                return result;
            }
        } catch (error) {
            // Error saving payment
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
                    Thank you for your purchase! Your posts have been added to
                    your account.
                </p>

                {/* Allocation Status */}
                {allocationStatus && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${
                            allocationStatus.status === "pending"
                                ? "bg-blue-50 border border-blue-200 text-blue-800"
                                : allocationStatus.status === "success"
                                  ? "bg-green-50 border border-green-200 text-green-800"
                                  : "bg-red-50 border border-red-200 text-red-800"
                        }`}
                    >
                        <div className="flex items-center justify-center">
                            {allocationStatus.status === "pending" && (
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            )}
                            {allocationStatus.status === "success" && (
                                <svg
                                    className="w-5 h-5 mr-2 text-green-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                            {allocationStatus.status === "error" && (
                                <svg
                                    className="w-5 h-5 mr-2 text-red-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                            <span className="text-sm font-medium">
                                {allocationStatus.message}
                            </span>
                        </div>
                        {allocationStatus.postsAllocated && (
                            <div className="mt-2 text-center">
                                <span className="text-lg font-bold text-green-700">
                                    +{allocationStatus.postsAllocated} posts
                                    added
                                </span>
                            </div>
                        )}
                    </div>
                )}

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
                            <span className="font-medium">Amount:</span>{" "}
                            {getCurrencySymbol(paymentDetails.currency)}
                            {typeof paymentDetails.amount === "number" &&
                            !isNaN(paymentDetails.amount)
                                ? (paymentDetails.amount / 100).toFixed(2)
                                : "0.00"}{" "}
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
                        What You've Unlocked
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
                            Additional Reddit posts (never expire)
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
                            AI-optimized content suggestions
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
                            Reddit safety checks
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
                        Questions? Contact us at nibodhdaware@gmail.com
                    </p>
                </div>
            </div>
        </div>
    );
}
