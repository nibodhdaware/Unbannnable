import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useUserSync() {
    const [mounted, setMounted] = useState(false);
    const { user, isLoaded } = useUser();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && isLoaded && user) {
            // Sync user data to our database
            syncUserToDatabase(user);
        }
    }, [mounted, isLoaded, user]);

    const syncUserToDatabase = async (user: any) => {
        try {
            const response = await fetch("/api/users/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clerkId: user.id,
                    email:
                        user.primaryEmailAddress?.emailAddress ||
                        user.emailAddresses?.[0]?.emailAddress,
                    fullName:
                        user.fullName ||
                        `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                    username: user.username,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(
                    "Failed to sync user to database:",
                    response.status,
                    errorText,
                );
                return;
            }

            await response.json();
        } catch (error) {
            console.error("Error syncing user:", error);
        }
    };

    return { user, isLoaded };
}
