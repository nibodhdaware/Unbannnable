import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        const { paymentId, customerEmail, customerName, amount, status = "succeeded" } = await req.json();

        if (!paymentId) {
            return NextResponse.json(
                { error: "Payment ID is required" },
                { status: 400 }
            );
        }

        console.log("Manual payment recording request:", {
            paymentId,
            customerEmail,
            customerName,
            amount,
            status,
        });

        // Check if payment already exists
        const existingPayment = await convex.query(api.payments.getPaymentByPaymentId, {
            paymentId,
        });

        if (existingPayment) {
            return NextResponse.json({
                success: true,
                message: "Payment already exists",
                payment: existingPayment,
            });
        }

        // Find user by email if provided
        let userId = null;
        if (customerEmail) {
            const user = await convex.query(api.users.getUserByEmail, {
                email: customerEmail,
            });
            
            if (user) {
                userId = user._id;
                console.log("Found existing user:", userId);
            } else {
                // Create user record
                console.log("Creating new user for email:", customerEmail);
                userId = await convex.mutation(api.users.createOrUpdateUser, {
                    clerkId: `manual_${Date.now()}`,
                    email: customerEmail,
                    fullName: customerName || "Unknown User",
                    isAdmin: customerEmail === "nibod1248@gmail.com",
                });
                console.log("Created new user:", userId);
            }
        }

        // Create payment record
        const paymentRecord = await convex.mutation(api.payments.createPayment, {
            paymentId,
            userId,
            amount: amount || 0,
            currency: "USD",
            status,
            customerEmail,
            customerName,
            paymentType: "one_time",
            paymentMethod: "dodo",
            metadata: JSON.stringify({ manual_entry: true, recorded_at: new Date().toISOString() }),
        });

        console.log("Payment recorded successfully:", paymentRecord);

        return NextResponse.json({
            success: true,
            payment: paymentRecord,
            userId,
            message: "Payment recorded successfully",
        });

    } catch (error) {
        console.error("Error recording manual payment:", error);
        return NextResponse.json(
            { 
                error: "Failed to record payment",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

// Handle other HTTP methods
export async function GET() {
    return NextResponse.json({ 
        message: "Use POST to record a payment",
        requiredFields: ["paymentId", "customerEmail", "amount"],
        optionalFields: ["customerName", "status"]
    });
}
