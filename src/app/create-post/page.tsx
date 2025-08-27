"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useUser } from "@clerk/nextjs";

interface PostLimits {
    hasSubscription: boolean;
    postsRemaining: number;
    unlimited: boolean;
    isAdmin?: boolean;
    postsUsed?: number;
    totalPurchasedPosts?: number;
    freePostsRemaining?: number;
    purchasedPostsRemaining?: number;
}

export default function CreatePostPage() {
    const { isAdmin, loading: adminLoading } = useAdmin();
    const { user, isLoaded } = useUser();
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        subreddit: "",
    });
    const [postLimits, setPostLimits] = useState<PostLimits | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Check post limits when component loads
    useState(() => {
        if (isLoaded && user && !adminLoading) {
            checkPostLimits();
        }
    });

    const checkPostLimits = async () => {
        try {
            const response = await fetch("/api/posts/limits");
            if (response.ok) {
                const limits = await response.json();
                setPostLimits(limits);
            }
        } catch (error) {
            console.error("Error checking post limits:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        // Admin users bypass all checks
        if (
            !isAdmin &&
            postLimits &&
            !postLimits.hasSubscription &&
            postLimits.postsRemaining <= 0
        ) {
            setError(
                "You have reached your post limit. Please subscribe to continue posting.",
            );
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/posts/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    isAdmin, // Pass admin status to backend
                }),
            });

            if (response.ok) {
                setSuccess("Post created successfully!");
                setFormData({ title: "", content: "", subreddit: "" });
                // Refresh post limits for all users (including admin)
                checkPostLimits();
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Failed to create post");
            }
        } catch (error) {
            console.error("Error creating post:", error);
            setError("An error occurred while creating the post");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded || adminLoading) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Create New Post
                </h1>

                {/* Admin Badge */}
                {isAdmin && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-md mb-4">
                        <span className="font-semibold">Admin Access:</span> You
                        have unlimited posting privileges
                    </div>
                )}

                {/* Post Limits Display */}
                {postLimits && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-md mb-4">
                        {postLimits.isAdmin ? (
                            <span>
                                👑 Admin Access: Unlimited Posts (Used{" "}
                                {postLimits.postsUsed || 0} this month)
                                {postLimits.totalPurchasedPosts &&
                                    postLimits.totalPurchasedPosts > 0 && (
                                        <span className="block text-sm mt-1">
                                            Purchased posts available:{" "}
                                            {postLimits.totalPurchasedPosts}
                                        </span>
                                    )}
                            </span>
                        ) : postLimits.hasSubscription ? (
                            <span>
                                ✅ Subscription Active - Unlimited Posts
                            </span>
                        ) : (
                            <span>
                                📝 Posts Remaining: {postLimits.postsRemaining}{" "}
                                total
                                {postLimits.freePostsRemaining !==
                                    undefined && (
                                    <span className="block text-sm mt-1">
                                        Free: {postLimits.freePostsRemaining} |
                                        Purchased:{" "}
                                        {postLimits.purchasedPostsRemaining ||
                                            0}
                                    </span>
                                )}
                                {postLimits.postsRemaining <= 0 && (
                                    <span className="block text-red-600 mt-1">
                                        Post limit reached.{" "}
                                        <a
                                            href="/pricing"
                                            className="underline"
                                        >
                                            Buy more posts
                                        </a>
                                    </span>
                                )}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label
                        htmlFor="subreddit"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Subreddit
                    </label>
                    <input
                        type="text"
                        id="subreddit"
                        required
                        placeholder="e.g., r/AskReddit"
                        value={formData.subreddit}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                subreddit: e.target.value,
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Post Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        required
                        placeholder="Enter your post title"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label
                        htmlFor="content"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Post Content
                    </label>
                    <textarea
                        id="content"
                        required
                        rows={8}
                        placeholder="Enter your post content"
                        value={formData.content}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                content: e.target.value,
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={
                        loading ||
                        (!isAdmin &&
                            postLimits &&
                            !postLimits.hasSubscription &&
                            postLimits.postsRemaining <= 0) ||
                        false
                    }
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? "Creating Post..." : "Create Post"}
                </button>
            </form>

            {!isAdmin &&
                !postLimits?.hasSubscription &&
                (postLimits?.postsRemaining || 0) <= 3 && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                            Running Low on Posts?
                        </h3>
                        <p className="text-yellow-700 mb-3">
                            You're running low on free posts. Subscribe now to
                            get unlimited posting!
                        </p>
                        <a
                            href="/pricing"
                            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 inline-block"
                        >
                            View Pricing Plans
                        </a>
                    </div>
                )}
        </div>
    );
}
