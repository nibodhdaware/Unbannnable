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
            // Check if Convex is configured
            if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
                console.log("Convex not configured, skipping user sync");
                return;
            }

            const response = await fetch("/api/users/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 503) {
                    console.log("Database not configured, skipping user sync");
                    return;
                }
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
