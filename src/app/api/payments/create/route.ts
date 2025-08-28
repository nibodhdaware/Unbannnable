import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { createOneTimePaymentLink } from "@/lib/dodo";
import { NextRequest } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { billing, productCart } = await req.json();

        if (!billing || !productCart) {
            return NextResponse.json(
                { error: "Missing billing or product cart information" },
                { status: 400 },
            );
        }

        // Ensure user has required fields
        if (!user.id) {
            return NextResponse.json(
                { error: "User ID not found" },
                { status: 400 },
            );
        }

        const userEmail = user.emailAddresses?.[0]?.emailAddress;
        if (!userEmail) {
            return NextResponse.json(
                { error: "User email not found" },
                { status: 400 },
            );
        }

        let convexUser = await convex.query(api.users.getUserByClerkId, {
            clerkId: user.id,
        });

        if (!convexUser) {
            const newUserId = await convex.mutation(
                api.users.createOrUpdateUser,
                {
                    clerkId: user.id,
                    email: userEmail,
                    fullName:
                        user.fullName ||
                        `${user.firstName} ${user.lastName}` ||
                        "",
                },
            );
            convexUser = await convex.query(api.users.getUser, {
                id: newUserId,
            });
        }

        if (!convexUser) {
            return new NextResponse("User not found or created in Convex", {
                status: 500,
            });
        }

        const payment = await createOneTimePaymentLink({
            name: billing.name || user.fullName || "User",
            email: user.emailAddresses[0]?.emailAddress || billing.email, // Always use Clerk user's email
            phoneNumber: billing.phoneNumber,
            city: billing.city,
            state: billing.state,
            country: billing.country,
            street: billing.street,
            zipcode: billing.zipcode,
            productCart,
            userId: convexUser._id,
            clerkId: user.id,
        });

        if (payment.payment_link) {
            return NextResponse.json({ url: payment.payment_link });
        } else {
            console.error("Failed to create payment link. Response:", payment);
            return new NextResponse("Failed to create payment link", {
                status: 500,
            });
        }
    } catch (error: any) {
        console.error("Error creating one-time payment:", error);
        const errorMessage = error.message || "An unknown error occurred";
        return new NextResponse(
            JSON.stringify({
                message: "Error creating one-time payment",
                error: errorMessage,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
