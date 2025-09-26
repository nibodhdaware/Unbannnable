import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

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
        const { billing, customer } = body;

        if (!billing || !customer) {
            return NextResponse.json(
                {
                    error: "Billing address and customer information are required",
                },
                { status: 400 },
            );
        }

        // Validate required billing fields
        const requiredBillingFields = [
            "street",
            "city",
            "state",
            "zipcode",
            "country",
        ];
        for (const field of requiredBillingFields) {
            if (!billing[field]) {
                return NextResponse.json(
                    { error: `Missing required billing field: ${field}` },
                    { status: 400 },
                );
            }
        }

        // Validate required customer fields
        if (!customer.name || !customer.email) {
            return NextResponse.json(
                { error: "Customer name and email are required" },
                { status: 400 },
            );
        }

        // Get the product ID from environment variable
        const productId = process.env.DODO_PRODUCT_ID;

        if (!productId) {
            console.error("DODO_PRODUCT_ID not configured");
            return NextResponse.json(
                { error: "Payment configuration error" },
                { status: 500 },
            );
        }

        console.log("Using product ID:", productId);

        // Create one-time payment using Dodo Payments API
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_DODO_TEST_API}/payments`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
                },
                body: JSON.stringify({
                    payment_link: true,
                    customer: {
                        name: customer.name,
                        email: customer.email,
                    },
                    billing: {
                        street: billing.street,
                        city: billing.city,
                        state: billing.state,
                        zipcode: billing.zipcode,
                        country: billing.country,
                    },
                    product_cart: [
                        {
                            product_id: productId,
                            quantity: 1,
                        },
                    ],
                    return_url: `${process.env.NEXT_PUBLIC_RETURN_URL || "http://localhost:3002/success"}`,
                    metadata: {
                        userId: userId,
                        credits: "100",
                        amount: "9.00",
                    },
                }),
            },
        ).catch((fetchError) => {
            console.error(
                "Network error calling Dodo Payments API:",
                fetchError,
            );
            throw new Error(`Network error: ${fetchError.message}`);
        });

        console.log("Creating payment with product ID:", productId);
        console.log(
            "API endpoint:",
            `${process.env.NEXT_PUBLIC_DODO_TEST_API}/payments`,
        );
        console.log(
            "Request payload:",
            JSON.stringify(
                {
                    payment_link: true,
                    customer: {
                        name: customer.name,
                        email: customer.email,
                    },
                    billing: {
                        street: billing.street,
                        city: billing.city,
                        state: billing.state,
                        zipcode: billing.zipcode,
                        country: billing.country,
                    },
                    product_cart: [
                        {
                            product_id: productId,
                            quantity: 1,
                        },
                    ],
                    return_url: `${process.env.NEXT_PUBLIC_RETURN_URL || "http://localhost:3002/success"}`,
                    metadata: {
                        userId: userId,
                        credits: "100",
                        amount: "9.00",
                    },
                },
                null,
                2,
            ),
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error("Dodo Payments API Error:");
            console.error("Status:", response.status);
            console.error("Status Text:", response.statusText);
            console.error("Error Data:", errorData);
            return NextResponse.json(
                { error: "Payment creation failed", details: errorData },
                { status: response.status },
            );
        }

        const data = await response.json();
        console.log("Dodo Payments API Response:", data);

        return NextResponse.json({
            paymentLink: data.payment_link || data.checkout_url,
            paymentId: data.payment_id || data.id,
            totalAmount: data.total_amount || data.amount,
        });
    } catch (error) {
        console.error("Payment creation error:", error);

        // For development, if Dodo Payments API is not available, return a mock response
        if (
            process.env.NODE_ENV === "development" &&
            error instanceof Error &&
            error.message.includes("Network error")
        ) {
            console.log("Using mock payment response for development");
            return NextResponse.json({
                paymentLink:
                    "https://checkout.dodopayments.com/mock-payment-link",
                paymentId: "mock_payment_id_" + Date.now(),
                totalAmount: 900, // $9.00 in cents
            });
        }

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
