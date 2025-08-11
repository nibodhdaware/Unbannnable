import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Admin email address
const ADMIN_EMAIL = "nibod1248@gmail.com";
const ADMIN_NAME = "Nibodh Daware";

export async function isAdmin(clerkId: string): Promise<boolean> {
    try {
        return await convex.query(api.users.isAdmin, { clerkId });
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

export async function ensureAdminStatus(
    clerkId: string,
    email: string,
    fullName?: string,
): Promise<void> {
    try {
        // Check if this is the admin user
        const shouldBeAdmin = email === ADMIN_EMAIL || fullName === ADMIN_NAME;

        if (shouldBeAdmin) {
            // Create or update user with admin status
            await convex.mutation(api.users.createOrUpdateUser, {
                clerkId,
                email,
                fullName,
                isAdmin: true,
                role: "admin",
            });
        }
    } catch (error) {
        console.error("Error setting admin status:", error);
    }
}

export async function getUserRole(
    clerkId: string,
): Promise<{ isAdmin: boolean; role: string }> {
    try {
        const user = await convex.query(api.users.getUserByClerkId, {
            clerkId,
        });

        if (!user) {
            return { isAdmin: false, role: "user" };
        }

        const adminStatus =
            user.isAdmin ||
            user.email === ADMIN_EMAIL ||
            user.fullName === ADMIN_NAME;

        return {
            isAdmin: adminStatus,
            role: adminStatus ? "admin" : user.role || "user",
        };
    } catch (error) {
        console.error("Error getting user role:", error);
        return { isAdmin: false, role: "user" };
    }
}
