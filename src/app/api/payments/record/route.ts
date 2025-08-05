import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        const {
            clerkId,
            email,
            paymentId,
            amount,
            currency,
            status,
            paymentProvider,
            customerData,
            productCart,
            metadata,
            createdAt,
        } = await req.json();

        if (!clerkId || !email || !paymentId) {
            return NextResponse.json(
                { error: "Missing required payment information" },
                { status: 400 },
            );
        }

        // Check if Convex is configured
        if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
            console.log(
                "Development mode: No Convex configured, simulating payment record",
            );

            return NextResponse.json({
                success: true,
                message: "Payment simulated successfully (no database)",
                paymentId,
                development: true,
            });
        }

        // Get or create user
        await convex.mutation(api.users.createOrUpdateUser, {
            clerkId,
            email,
            fullName: customerData?.name || undefined,
            isAdmin: email === "nibod1248@gmail.com",
        });

        const user = await convex.query(api.users.getUserByClerkId, {
            clerkId,
        });

        if (!user) {
            return NextResponse.json(
                { error: "Failed to create/find user" },
                { status: 500 },
            );
        }

        // Check if payment already exists to avoid duplicates
        const existingPayment = await convex.query(
            api.payments.getPaymentById,
            { paymentId },
        );

        if (existingPayment) {
            console.log("Payment already exists:", paymentId);
            return NextResponse.json({
                success: true,
                message: "Payment already recorded",
            });
        }

        // Record the payment
        const paymentData = {
            paymentId,
            userId: user._id,
            amount: amount || 0,
            currency: currency || "USD",
            status: status || "succeeded",
            paymentMethod: paymentProvider || "dodo",
        };

        const newPaymentId = await convex.mutation(
            api.payments.createPayment,
            paymentData,
        );

        console.log("Payment recorded successfully:", paymentId);

        return NextResponse.json({
            success: true,
            message: "Payment recorded successfully",
            paymentId,
            convexPaymentId: newPaymentId,
        });
    } catch (error) {
        console.error("Payment recording error:", error);
        return NextResponse.json(
            {
                error: "Failed to record payment",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
