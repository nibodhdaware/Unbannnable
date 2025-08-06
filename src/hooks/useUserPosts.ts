import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";

export function useUserPosts() {
    const { user: clerkUser } = useUser();

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

    return {
        userRecord,
        postStats: postStats || {
            freePostsUsed: 0,
            freePostsRemaining: 1,
            purchasedPostsRemaining: 0,
            totalPostsUsed: 0,
            hasUnlimitedAccess: false,
            unlimitedExpiry: null,
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
