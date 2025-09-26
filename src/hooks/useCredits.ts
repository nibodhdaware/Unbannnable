"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";

export function useCredits() {
    const { user } = useUser();
    const clerkId = user?.id;

    // Get user credits
    const credits = useQuery(
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

        if (!credits || credits < amount) {
            throw new Error("Insufficient credits");
        }

        return await deductCreditsMutation({
            clerkId,
            credits: amount,
        });
    };

    // Check if user has enough credits
    const hasCredits = (amount: number) => {
        return credits !== undefined && credits >= amount;
    };

    return {
        credits: credits || 0,
        isLoading: credits === undefined,
        deductCredits,
        hasCredits,
    };
}
