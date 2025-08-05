import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ensureAdminStatus, getUserRole } from "@/lib/admin";

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { clerkId } = await request.json();

        // Ensure the user is checking their own role (basic security)
        if (clerkId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Ensure admin status is up to date (only if we have email)
        const email = user.emailAddresses[0]?.emailAddress;
        if (email) {
            await ensureAdminStatus(user.id, email, user.fullName || undefined);
        }

        // Get current role
        const role = await getUserRole(clerkId);
        const isAdmin = role?.isAdmin || false;

        return NextResponse.json({
            isAdmin,
            role: role?.role,
        });
    } catch (error) {
        console.error("Error checking user role:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
