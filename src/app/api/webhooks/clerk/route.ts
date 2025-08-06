import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occured -- no svix headers", {
            status: 400,
        });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

    let evt: any;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error occured", {
            status: 400,
        });
    }

    // Handle the webhook
    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
    console.log("Webhook body:", body);

    if (eventType === "user.created" || eventType === "user.updated") {
        const {
            id: clerkId,
            email_addresses,
            first_name,
            last_name,
            username,
        } = evt.data;

        const primaryEmail = email_addresses.find(
            (email: any) => email.id === evt.data.primary_email_address_id,
        );

        const userData = {
            clerkId,
            email: primaryEmail?.email_address || "",
            fullName:
                `${first_name || ""} ${last_name || ""}`.trim() || undefined,
            isAdmin: primaryEmail?.email_address === "nibod1248@gmail.com",
        };

        try {
            // Use Convex createOrUpdateUser for both create and update
            await convex.mutation(api.users.createOrUpdateUser, userData);
            console.log(
                `User ${eventType === "user.created" ? "created" : "updated"} in Convex:`,
                clerkId,
            );
        } catch (error) {
            console.error("Convex error:", error);
            return new Response("Database error", { status: 500 });
        }
    }

    if (eventType === "user.deleted") {
        const { id: clerkId } = evt.data;

        try {
            // Find the user first
            const user = await convex.query(api.users.getUserByClerkId, {
                clerkId,
            });

            if (user) {
                // Note: Convex doesn't have a built-in delete, we'd need to create a delete mutation
                // For now, we'll just log this - you may want to create a deleteUser mutation
                console.log("User deletion requested for:", clerkId);
                console.log(
                    "Note: User deletion not implemented in Convex schema",
                );
            }
        } catch (error) {
            console.error("Convex error:", error);
            return new Response("Database error", { status: 500 });
        }
    }

    return new Response("", { status: 200 });
}
