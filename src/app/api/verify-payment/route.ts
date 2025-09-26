import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const { paymentId } = body;

        if (!paymentId) {
            return NextResponse.json(
                { error: "Payment ID is required" },
                { status: 400 },
            );
        }

        // Check if payment record exists and has been processed
        const existingPayment = await convex.query(
            api.payments.getPaymentByPaymentId,
            {
                paymentId: paymentId,
            },
        );

        if (existingPayment) {
            // Payment has already been processed
            return NextResponse.json({
                alreadyProcessed: true,
                status: existingPayment.status,
                message:
                    "Payment has already been processed and credits have been added.",
            });
        }

        // If we reach here, the payment hasn't been processed via webhook yet
        // This could be because:
        // 1. The webhook hasn't fired yet
        // 2. The payment is invalid/fake
        // 3. The payment is pending

        // For security, we should verify with the payment provider
        // But for now, we'll return that we need to wait
        return NextResponse.json({
            alreadyProcessed: false,
            pending: true,
            message:
                "Payment is being verified. Please wait a moment and refresh if credits don't appear.",
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json(
            { error: "Failed to verify payment" },
            { status: 500 },
        );
    }
}
