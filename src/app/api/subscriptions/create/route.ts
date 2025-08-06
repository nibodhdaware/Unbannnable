import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        console.log("Subscription create POST request received");

        // Get the current user from Clerk
        const user = await currentUser();

        if (!user) {
            console.log("No authenticated user found");
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 },
            );
        }

        console.log("User authenticated:", user.id);

        // Parse the request body
        const body = await req.json();
        const { productId, formData } = body;

        console.log("Request body:", { productId, formData });

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 },
            );
        }

        if (!formData) {
            return NextResponse.json(
                { error: "Billing information is required" },
                { status: 400 },
            );
        }

        // Build DodoPay checkout URL with billing information
        const baseUrl =
            "https://test.checkout.dodopayments.com/buy/pdt_Sqt14rBf5vO14Z8ReuHqB";
        const params = new URLSearchParams({
            quantity: "1",
            redirect_url: "https://reddit-unbanr.vercel.app/",
            // Add billing information as prefill parameters
            customer_name: formData.name || user.fullName || "",
            customer_email:
                formData.email || user.emailAddresses[0]?.emailAddress || "",
            billing_address_line1: formData.street || "",
            billing_address_city: formData.city || "",
            billing_address_state: formData.state || "",
            billing_address_postal_code: formData.zipcode || "",
            billing_address_country: formData.country || "US",
            customer_phone: formData.phoneNumber || "",
            // Add metadata to track the user
            "metadata[clerk_user_id]": user.id,
            "metadata[user_email]": user.emailAddresses[0]?.emailAddress || "",
        });

        const checkoutUrl = `${baseUrl}?${params.toString()}`;

        console.log("Generated checkout URL with billing info:", checkoutUrl);

        return NextResponse.json({
            success: true,
            checkoutUrl: checkoutUrl,
            paymentId: `prefilled_${Date.now()}`,
            isDirectLink: true,
        });
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
