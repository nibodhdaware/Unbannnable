"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";

export function useCredits() {
    const { user, isLoaded: isUserLoaded } = useUser();
    const clerkId = user?.id;

    // Get user credits
    const creditsQuery = useQuery(
        api.users.getUserCredits,
        clerkId ? { clerkId } : "skip",
    );

    // Deduct credits mutation
    const deductCreditsMutation = useMutation(api.users.deductCredits);

    // Deduct credits function
    const deductCredits = async (amount: number) => {
        if (!clerkId) {
            throw new Error("User not authenticated");
        }

        if (creditsQuery === undefined || creditsQuery < amount) {
            throw new Error("Insufficient credits");
        }

        return await deductCreditsMutation({
            clerkId,
            credits: amount,
        });
    };

    // Check if user has enough credits
    const hasCredits = (amount: number) => {
        return creditsQuery !== undefined && creditsQuery >= amount;
    };

    // Determine loading state properly
    const isLoading =
        !isUserLoaded || (clerkId !== undefined && creditsQuery === undefined);

    return {
        credits: creditsQuery ?? 0,
        isLoading,
        deductCredits,
        hasCredits,
    };
}
