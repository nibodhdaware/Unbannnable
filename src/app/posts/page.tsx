"use client";
import React from "react";

const mockPosts = [
    {
        id: 1,
        subreddit: "r/AskReddit",
        title: "What is the best advice you've ever received?",
        flair: "Discussion",
        body: "Share the advice that changed your life!",
    },
    {
        id: 2,
        subreddit: "r/funny",
        title: "My cat thinks he's a dog",
        flair: "Meme",
        body: "He fetches, wags his tail, and even barks sometimes. Anyone else?",
    },
    {
        id: 3,
        subreddit: "r/science",
        title: "New discovery in quantum physics",
        flair: "Serious",
        body: "Researchers at MIT have found a new particle. Read more inside.",
    },
];

export default function PostsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 py-8 px-2 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                <h1 className="text-3xl font-bold mb-8 text-neutral-900 dark:text-white text-center">
                    All Posts
                </h1>
                <div className="space-y-6">
                    {mockPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white dark:bg-neutral-950 rounded-xl shadow border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition flex flex-col gap-2"
                        >
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                                <span className="font-semibold text-[#FF4500]">
                                    {post.subreddit}
                                </span>
                                {post.flair && (
                                    <span className="bg-[#FF4500]/10 text-[#FF4500] px-2 py-0.5 rounded-full font-medium ml-2">
                                        {post.flair}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                {post.title}
                            </h2>
                            <p className="text-neutral-700 dark:text-neutral-200 text-base">
                                {post.body}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
