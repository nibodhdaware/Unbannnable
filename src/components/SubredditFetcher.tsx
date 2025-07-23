"use client";

import { useState, useEffect } from "react";
import { redditAPI, type Subreddit, type Flair } from "@/lib/reddit-api";

export default function SubredditFetcher() {
    const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
    const [selectedSubreddit, setSelectedSubreddit] = useState<string>("");
    const [flairs, setFlairs] = useState<Flair[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetchPopularSubreddits();
    }, []);

    const fetchPopularSubreddits = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await redditAPI.fetchSubreddits(50);
            setSubreddits(data);
        } catch (err) {
            setError(
                `Failed to fetch subreddits: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`,
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchFlairs = async (subredditName: string) => {
        if (!subredditName) return;

        setLoading(true);
        setError("");
        try {
            const data = await redditAPI.fetchSubredditFlairs(subredditName);
            setFlairs(data);
        } catch (err) {
            setError(
                `Failed to fetch flairs: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`,
            );
            setFlairs([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">
                Reddit Subreddits & Flairs
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subreddits List */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Popular Subreddits
                    </h2>
                    {loading && subreddits.length === 0 ? (
                        <p>Loading subreddits...</p>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {subreddits.map((subreddit) => (
                                <div
                                    key={subreddit.id}
                                    className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                                        selectedSubreddit ===
                                        subreddit.display_name
                                            ? "bg-blue-50 border-blue-300"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setSelectedSubreddit(
                                            subreddit.display_name,
                                        );
                                        fetchFlairs(subreddit.display_name);
                                    }}
                                >
                                    <h3 className="font-medium">
                                        r/{subreddit.display_name}
                                    </h3>
                                    <p className="text-sm text-gray-600 truncate">
                                        {subreddit.public_description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {subreddit.subscribers?.toLocaleString()}{" "}
                                        subscribers
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Flairs List */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Flairs{" "}
                        {selectedSubreddit && `for r/${selectedSubreddit}`}
                    </h2>
                    {selectedSubreddit ? (
                        loading ? (
                            <p>Loading flairs...</p>
                        ) : flairs.length > 0 ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {flairs.map((flair) => (
                                    <div
                                        key={flair.id}
                                        className="p-2 border rounded"
                                        style={{
                                            backgroundColor:
                                                flair.background_color ||
                                                "#f3f4f6",
                                            color:
                                                flair.text_color || "#000000",
                                        }}
                                    >
                                        <span className="text-sm font-medium">
                                            {flair.text}
                                        </span>
                                        {flair.css_class && (
                                            <span className="text-xs text-gray-500 ml-2">
                                                ({flair.css_class})
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">
                                No flairs available for this subreddit
                            </p>
                        )
                    ) : (
                        <p className="text-gray-500">
                            Select a subreddit to view its flairs
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
