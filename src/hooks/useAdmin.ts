"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useAdmin() {
    const { user, isLoaded } = useUser();

    const adminStatus = useQuery(
        api.users.isAdmin,
        user?.id ? { clerkId: user.id } : "skip",
    );

    // Check by email/name locally as fallback
    const email = user?.emailAddresses[0]?.emailAddress;
    const fullName = user?.fullName;
    const isAdminByEmail =
        email === "nibod1248@gmail.com" || fullName === "Nibodh Daware";

    const isAdmin = adminStatus || isAdminByEmail;
    const loading = !isLoaded || (user && adminStatus === undefined);

    return {
        isAdmin,
        loading,
        user,
        isLoaded,
    };
}
