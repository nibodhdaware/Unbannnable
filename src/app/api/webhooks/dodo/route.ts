import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { subscriptions, payments } from "../../../../../drizzle/schema";

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

interface WebhookEvent {
    type: string;
    data: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
    try {
        const headersList = await headers();
        const signature = headersList.get("dodo-signature");

        // TODO: Verify webhook signature using DODO_WEBHOOK_SECRET

        const body: WebhookEvent = await request.json();
        const { type, data } = body;

        console.log("Dodo webhook received:", { type, data });

        switch (type) {
            case "subscription.active":
            case "subscription.created":
                await handleSubscriptionEvent(data, "active");
                break;

            case "subscription.renewed":
                await handleSubscriptionEvent(data, "active");
                break;

            case "subscription.on_hold":
                await handleSubscriptionEvent(data, "past_due");
                break;

            case "subscription.failed":
                await handleSubscriptionEvent(data, "canceled");
                break;

            case "payment.succeeded":
                await handlePaymentEvent(data, "succeeded");
                break;

            case "payment.failed":
                await handlePaymentEvent(data, "failed");
                break;

            default:
                console.log("Unhandled webhook event type:", type);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 },
        );
    }
}

async function handleSubscriptionEvent(
    data: Record<string, unknown>,
    status: string,
) {
    try {
        const subscriptionId = data.subscription_id as string;
        const clerkUserId = (data.metadata?.clerkUserId as string) || "";

        if (!subscriptionId) {
            console.error("No subscription ID in webhook data");
            return;
        }

        await db
            .insert(subscriptions)
            .values({
                subscriptionId: subscriptionId,
                userId: clerkUserId,
                email: "",
                status,
                productId: (data.product_id as string) || "",
                amount: 0,
                currency: "USD",
                lastRenewalAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: subscriptions.subscriptionId,
                set: {
                    status,
                    updatedAt: new Date(),
                },
            });
    } catch (error) {
        console.error("Error handling subscription event:", error);
    }
}

async function handlePaymentEvent(
    data: Record<string, unknown>,
    status: string,
) {
    try {
        const paymentId = data.payment_id as string;
        const subscriptionId = data.subscription_id as string;
        const amount = data.amount as number;

        if (!paymentId || !subscriptionId) {
            console.error("Missing payment or subscription ID in webhook data");
            return;
        }

        await db
            .insert(payments)
            .values({
                id: paymentId,
                subscriptionId,
                amount: amount || 0,
                currency: "USD",
                status,
                createdAt: new Date(),
            })
            .onConflictDoNothing();
    } catch (error) {
        console.error("Error handling payment event:", error);
    }
}
