"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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
                <Card>
                    <CardContent className="pt-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-muted rounded w-1/4"></div>
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Create New Post</CardTitle>
                    <CardDescription>
                        Fill out the form below to create a new Reddit post
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="subreddit">Subreddit</Label>
                            <Input
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
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Post Title</Label>
                            <Input
                                type="text"
                                id="title"
                                required
                                placeholder="Enter your post title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Post Content</Label>
                            <Textarea
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
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={
                                loading ||
                                (!isAdmin &&
                                    postLimits &&
                                    !postLimits.hasSubscription &&
                                    postLimits.postsRemaining <= 0)
                            }
                            className="w-full"
                        >
                            {loading ? "Creating Post..." : "Create Post"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {!isAdmin &&
                !postLimits?.hasSubscription &&
                (postLimits?.postsRemaining || 0) <= 3 && (
                    <Card className="mt-6 border-yellow-200 bg-yellow-50">
                        <CardHeader>
                            <CardTitle className="text-yellow-800">
                                Running Low on Posts?
                            </CardTitle>
                            <CardDescription className="text-yellow-700">
                                You're running low on free posts. Subscribe now
                                to get unlimited posting!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                asChild
                                className="bg-yellow-600 hover:bg-yellow-700"
                            >
                                <a href="/pricing">View Pricing Plans</a>
                            </Button>
                        </CardContent>
                    </Card>
                )}
        </div>
    );
}
