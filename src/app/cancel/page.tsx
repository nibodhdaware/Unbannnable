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
import { AlertCircle } from "lucide-react";

export default function CancelPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [paymentId, setPaymentId] = useState<string | null>(null);

    useEffect(() => {
        // Get payment ID from URL params for tracking
        const urlParams = new URLSearchParams(window.location.search);
        const id =
            urlParams.get("payment_id") ||
            urlParams.get("id") ||
            urlParams.get("payment") ||
            urlParams.get("session_id");
        if (id) {
            setPaymentId(id);
        }
    }, []);

    const handleGoToApp = () => {
        router.push("/app");
    };

    const handleRetryPayment = () => {
        router.push("/app");
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Payment Cancelled
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Your payment was cancelled. No charges have been made to
                        your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {paymentId && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">
                                <strong>Payment ID:</strong> {paymentId}
                            </p>
                        </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            What happened?
                        </h3>
                        <p className="text-sm text-blue-800">
                            You cancelled the payment process or closed the
                            payment window. Your account has not been charged
                            and no credits have been added.
                        </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-900 mb-2">
                            Ready to try again?
                        </h3>
                        <p className="text-sm text-green-800 mb-3">
                            You can purchase credits anytime from your
                            dashboard. Get 100 credits for just $9 to unlock all
                            AI-powered features.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 mt-6">
                        <Button
                            onClick={handleRetryPayment}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            Try Payment Again
                        </Button>
                        <Button
                            onClick={handleGoToApp}
                            variant="outline"
                            className="w-full"
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
