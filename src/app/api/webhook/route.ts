import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface WebhookPayload {
    event_type: string;
    data: {
        payment_id: string;
        status: string;
        amount: number;
        currency: string;
        customer_email: string;
        customer_name: string;
        metadata: {
            userId: string;
            credits: string;
            amount: string;
        };
    };
}

export async function POST(request: NextRequest) {
    try {
        const webhook = new Webhook(process.env.DODO_WEBHOOK_SECRET!);
        const rawBody = await request.text();

        // Get headers for verification
        const headers = {
            "webhook-id": request.headers.get("webhook-id") || "",
            "webhook-signature": request.headers.get("webhook-signature") || "",
            "webhook-timestamp": request.headers.get("webhook-timestamp") || "",
        };

        // Verify webhook signature
        await webhook.verify(rawBody, headers);

        const payload = JSON.parse(rawBody) as WebhookPayload;

        // Only process successful payments
        if (
            payload.event_type === "payment.succeeded" &&
            payload.data.status === "succeeded"
        ) {
            const {
                payment_id,
                amount,
                currency,
                customer_email,
                customer_name,
                metadata,
            } = payload.data;
            const { userId, credits } = metadata;

            try {
                // Get the user ID from Clerk ID
                const user = await convex.query(api.users.getUserByClerkId, {
                    clerkId: userId,
                });

                if (!user) {
                    console.error(`User not found for clerkId: ${userId}`);
                    return NextResponse.json(
                        { error: "User not found" },
                        { status: 404 },
                    );
                }

                // Record payment in database
                await convex.mutation(api.payments.createPayment, {
                    paymentId: payment_id,
                    userId: user._id,
                    amount: amount,
                    currency: currency || "USD",
                    status: "succeeded",
                    customerEmail: customer_email,
                    customerName: customer_name,
                    paymentType: "one_time",
                    planType: "credits",
                    postsAllocated: parseInt(credits),
                    metadata: JSON.stringify(metadata),
                });

                // Update user credits
                await convex.mutation(api.users.addCredits, {
                    clerkId: userId,
                    credits: parseInt(credits),
                });

                console.log(
                    `Successfully processed payment ${payment_id} for user ${userId}`,
                );
            } catch (convexError) {
                console.error(
                    "Failed to record payment in database:",
                    convexError,
                );
                // Return error so webhook can retry
                return NextResponse.json(
                    { error: "Failed to process payment" },
                    { status: 500 },
                );
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 },
        );
    }
}
