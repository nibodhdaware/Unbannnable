import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function useUserSync() {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (isLoaded && user) {
            // Sync user data to our database
            syncUserToDatabase(user);
        }
    }, [isLoaded, user]);

    const syncUserToDatabase = async (user: any) => {
        try {
            const response = await fetch("/api/users/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clerkId: user.id,
                    email: user.primaryEmailAddress?.emailAddress,
                    fullName: user.fullName,
                    username: user.username,
                }),
            });

            if (!response.ok) {
                console.error("Failed to sync user to database");
            }
        } catch (error) {
            console.error("Error syncing user:", error);
        }
    };

    return { user, isLoaded };
}
