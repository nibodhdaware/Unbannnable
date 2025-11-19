"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSearchParams } from "next/navigation";

/**
 * This component handles referral codes from URL parameters
 * and ensures users are created with proper referral tracking
 */
export default function ReferralHandler() {
    const { user, isLoaded } = useUser();
    const searchParams = useSearchParams();
    const referralCode = searchParams?.get("ref");
    const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

    useEffect(() => {
        const handleUserSync = async () => {
            if (!isLoaded || !user) return;

            try {
                await createOrUpdateUser({
                    clerkId: user.id,
                    fullName: user.fullName || undefined,
                    email: user.emailAddresses[0]?.emailAddress || "",
                    role: "user",
                    referralCode: referralCode || undefined,
                });
            } catch (error) {
                console.error("Error syncing user with referral:", error);
            }
        };

        handleUserSync();
    }, [user, isLoaded, referralCode, createOrUpdateUser]);

    return null; // This component doesn't render anything
}
