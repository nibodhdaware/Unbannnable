import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";

export function useUserPosts() {
    const { user: clerkUser } = useUser();
    const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

    const userRecord = useQuery(
        api.users.getUserByClerkId,
        clerkUser?.id ? { clerkId: clerkUser.id } : "skip",
    );

    const postStats = useQuery(
        api.posts.getUserPostStats,
        userRecord?._id ? { userId: userRecord._id } : "skip",
    );

    const canCreatePost = useQuery(
        api.posts.canUserCreatePost,
        userRecord?._id ? { userId: userRecord._id } : "skip",
    );

    const userPosts = useQuery(
        api.posts.getUserPosts,
        userRecord?._id ? { userId: userRecord._id } : "skip",
    );

    // Check if user is admin by email
    const isAdminByEmail = clerkUser?.emailAddresses[0]?.emailAddress === "nibod1248@gmail.com";

    // Ensure user is created with admin status
    useEffect(() => {
        if (clerkUser && !userRecord) {
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            
            console.log("Creating/updating user with admin status:", {
                email,
                isAdminEmail: isAdminByEmail,
                clerkId: clerkUser.id,
            });

            createOrUpdateUser({
                clerkId: clerkUser.id,
                email: email || "",
                fullName: clerkUser.fullName || undefined,
                isAdmin: isAdminByEmail,
                role: isAdminByEmail ? "admin" : "user",
            });
        }
    }, [clerkUser, userRecord, createOrUpdateUser, isAdminByEmail]);

    // If user is admin by email, return admin stats immediately
    if (isAdminByEmail) {
        return {
            userRecord,
            postStats: {
                freePostsUsed: 0,
                freePostsRemaining: 0,
                purchasedPostsRemaining: 0,
                totalPostsUsed: 0,
                hasUnlimitedAccess: true,
                unlimitedExpiry: null,
                isAdmin: true,
            },
            canCreatePost: {
                canCreate: true,
                reason: "admin_unlimited",
                postsRemaining: "unlimited",
            },
            userPosts: userPosts || [],
            isLoading: false,
        };
    }

    return {
        userRecord,
        postStats: postStats || {
            freePostsUsed: 0,
            freePostsRemaining: 1,
            purchasedPostsRemaining: 0,
            totalPostsUsed: 0,
            hasUnlimitedAccess: false,
            unlimitedExpiry: null,
            isAdmin: false,
        },
        canCreatePost: canCreatePost || {
            canCreate: false,
            reason: "loading",
            postsRemaining: 0,
        },
        userPosts: userPosts || [],
        isLoading: !userRecord || !postStats || !canCreatePost,
    };
}
