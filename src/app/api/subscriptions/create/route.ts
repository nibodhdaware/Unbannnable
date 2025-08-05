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
        const { productId } = body;

        console.log("Request body:", { productId });

        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 },
            );
        }

        // Map product IDs to Dodo product IDs
        const productConfig: Record<string, { dodoProductId: string }> = {
            monthly: {
                dodoProductId: "pdt_Sqt14rBf5vO14Z8ReuHqB", // Monthly premium
            },
            yearly: {
                dodoProductId: "pdt_Sqt14rBf5vO14Z8ReuHqB", // Yearly premium - could be different product
            },
        };

        const config = productConfig[productId as string];

        if (!config) {
            return NextResponse.json(
                { error: "Invalid product ID" },
                { status: 400 },
            );
        }

        // Get user email and name for prefilling
        const email = user.emailAddresses[0]?.emailAddress;
        const name = user.fullName || user.firstName || "Unknown User";

        if (!email) {
            return NextResponse.json(
                { error: "User email is required" },
                { status: 400 },
            );
        }

        // Use the exact static payment link
        const staticPaymentLink =
            "https://test.checkout.dodopayments.com/buy/pdt_Sqt14rBf5vO14Z8ReuHqB?quantity=1&redirect_url=https://reddit-unbanr.vercel.app%2F";

        console.log("Returning static payment link:", staticPaymentLink);

        return NextResponse.json({
            success: true,
            checkoutUrl: staticPaymentLink,
            paymentId: `static_${Date.now()}`, // Temporary ID, real one will come from redirect
            isStaticLink: true,
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
