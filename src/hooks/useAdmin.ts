"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function useAdmin() {
    const { user, isLoaded } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !user) {
            setLoading(false);
            return;
        }

        const checkAdminStatus = async () => {
            try {
                const response = await fetch("/api/users/role", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        clerkId: user.id,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsAdmin(data.isAdmin);
                }
            } catch (error) {
                console.error("Error checking admin status:", error);
            } finally {
                setLoading(false);
            }
        };

        // Also check by email/name locally
        const email = user.emailAddresses[0]?.emailAddress;
        const fullName = user.fullName;

        if (email === "nibod1248@gmail.com" || fullName === "Nibodh Daware") {
            setIsAdmin(true);
            setLoading(false);
        } else {
            checkAdminStatus();
        }
    }, [user, isLoaded]);

    return {
        isAdmin,
        loading,
        user,
        isLoaded,
    };
}
