import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { DodoClient } from "@/lib/dodo";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const paymentId = searchParams.get("paymentId");

        if (!paymentId) {
            return NextResponse.json(
                { error: "Payment ID is required" },
                { status: 400 },
            );
        }

        const dodoClient = new DodoClient({
            apiKey: process.env.DODO_API_KEY!,
        });

        const payment = await dodoClient.payments.retrieve(paymentId);

        if (!payment) {
            return NextResponse.json(
                { error: "Payment not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            paymentId: payment.id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            customer: payment.customer,
            created_at: payment.created_at,
            product_cart: payment.product_cart,
            metadata: payment.metadata,
        });
    } catch (error) {
        console.error("Error fetching payment details:", error);
        return NextResponse.json(
            { error: "Failed to fetch payment details" },
            { status: 500 },
        );
    }
}
