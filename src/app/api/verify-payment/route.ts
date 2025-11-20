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

        // Note: Payments table removed - using credit-only system
        // Webhook handles credit allocation directly via purchaseLifetimePlan
        // This endpoint now just confirms payment was received

        // Check if user has lifetime plan (indicates payment processed)
        const user = await convex.query(api.users.getUserByClerkId, {
            clerkId: userId,
        });

        if (user?.lifetimePlan) {
            return NextResponse.json({
                success: true,
                alreadyProcessed: true,
                status: "succeeded",
                message: "Payment processed - lifetime plan active",
            });
        }

        return NextResponse.json({
            success: true,
            alreadyProcessed: false,
            pending: true,
            message: "Payment verification in progress",
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json(
            { error: "Failed to verify payment" },
            { status: 500 },
        );
    }
}
