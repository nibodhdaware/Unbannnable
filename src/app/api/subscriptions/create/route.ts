import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const paymentRequestSchema = {
    parse: (data: any) => {
        // Basic validation
        if (!data.formData || !data.productId) {
            throw new Error("Missing required fields");
        }
        return data;
    },
};

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
        const { formData, productId } = paymentRequestSchema.parse(body);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_DODO_TEST_API}/subscriptions`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
                },
                body: JSON.stringify({
                    billing: {
                        city: formData.city || "Default City",
                        country: formData.country || "US",
                        state: formData.state || "CA",
                        street: formData.street || "Default Street",
                        zipcode: formData.zipcode || "12345",
                    },
                    customer: {
                        email: formData.email,
                        name: formData.name,
                        phone_number: formData.phoneNumber || undefined,
                    },
                    payment_link: true,
                    product_id: productId,
                    quantity: 1,
                    return_url: process.env.NEXT_PUBLIC_RETURN_URL,
                }),
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return NextResponse.json(
                { error: "Payment link creation failed", details: errorData },
                { status: response.status },
            );
        }

        const data = await response.json();
        return NextResponse.json({
            paymentLink: data.payment_link,
            subscriptionId: data.subscription_id,
            clientSecret: data.client_secret,
        });
    } catch (error) {
        console.error("Subscription creation error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred",
            },
            { status: 500 },
        );
    }
}
