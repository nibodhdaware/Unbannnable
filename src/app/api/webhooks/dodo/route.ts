import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { subscriptions, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

export async function POST(request: NextRequest) {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("x-dodo-signature");

    try {
        const event = JSON.parse(body);

        console.log("Received Dodo webhook:", event.type);

        switch (event.type) {
            case "subscription.active":
                await handleSubscriptionActive(event.data);
                break;

            case "subscription.renewed":
                await handleSubscriptionRenewed(event.data);
                break;

            case "subscription.on_hold":
                await handleSubscriptionOnHold(event.data);
                break;

            case "subscription.failed":
                await handleSubscriptionFailed(event.data);
                break;

            case "payment.succeeded":
                await handlePaymentSucceeded(event.data);
                break;

            case "payment.failed":
                await handlePaymentFailed(event.data);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 400 },
        );
    }
}

async function handleSubscriptionActive(data: any) {
    try {
        await db.insert(subscriptions).values({
            subscriptionId: data.subscription_id,
            customerId: data.customer?.customer_id,
            email: data.customer?.email || "",
            status: "active",
            productId: data.product_id || "",
            amount: data.recurring_pre_tax_amount || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log("Subscription activated:", data.subscription_id);
    } catch (error) {
        console.error("Error handling subscription active:", error);
    }
}

async function handleSubscriptionRenewed(data: any) {
    try {
        await db
            .update(subscriptions)
            .set({
                status: "active",
                lastRenewalAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.subscriptionId, data.subscription_id));

        console.log("Subscription renewed:", data.subscription_id);
    } catch (error) {
        console.error("Error handling subscription renewal:", error);
    }
}

async function handleSubscriptionOnHold(data: any) {
    try {
        await db
            .update(subscriptions)
            .set({
                status: "on_hold",
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.subscriptionId, data.subscription_id));

        console.log("Subscription on hold:", data.subscription_id);
    } catch (error) {
        console.error("Error handling subscription on hold:", error);
    }
}

async function handleSubscriptionFailed(data: any) {
    try {
        await db
            .update(subscriptions)
            .set({
                status: "failed",
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.subscriptionId, data.subscription_id));

        console.log("Subscription failed:", data.subscription_id);
    } catch (error) {
        console.error("Error handling subscription failed:", error);
    }
}

async function handlePaymentSucceeded(data: any) {
    console.log("Payment succeeded:", data.payment_id);
}

async function handlePaymentFailed(data: any) {
    console.log("Payment failed:", data.payment_id);
}
