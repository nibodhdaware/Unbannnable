import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createSubscriptionPaymentLink } from "@/lib/dodo";

export async function POST(req: NextRequest) {
    try {
        console.log("Subscription create POST request received");

        const user = await currentUser();
        if (!user) {
            console.log("No authenticated user found");
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 },
            );
        }

        const body = await req.json();
        const { productId, formData } = body;

        if (!productId || !formData) {
            return NextResponse.json(
                { error: "Product ID and billing information are required" },
                { status: 400 },
            );
        }

        // Use the API to create subscription with billing info
        const subscription = await createSubscriptionPaymentLink({
            email: formData.email || user.emailAddresses[0]?.emailAddress || "",
            name: formData.name || user.fullName || "",
            phoneNumber: formData.phoneNumber || "",
            city: formData.city,
            state: formData.state,
            country: formData.country,
            street: formData.street,
            zipcode: formData.zipcode,
            productId,
            clerkId: user.id,
        });

        if (subscription.payment_link) {
            return NextResponse.json({
                success: true,
                checkoutUrl: subscription.payment_link,
            });
        } else {
            throw new Error("Failed to create subscription payment link");
        }
    } catch (error) {
        console.error("Subscription creation error:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

// Explicitly handle other methods
export async function GET() {
    return NextResponse.json(
        { error: "Method GET not allowed" },
        { status: 405 },
    );
}

export async function PUT() {
    return NextResponse.json(
        { error: "Method PUT not allowed" },
        { status: 405 },
    );
}

export async function DELETE() {
    return NextResponse.json(
        { error: "Method DELETE not allowed" },
        { status: 405 },
    );
}

export async function PATCH() {
    return NextResponse.json(
        { error: "Method PATCH not allowed" },
        { status: 405 },
    );
}
