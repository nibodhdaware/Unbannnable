"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
    redditAPI,
    type Subreddit,
    type Flair,
    type SubredditRule,
    type PostRequirement,
} from "@/lib/reddit-api";
import Fuse from "fuse.js";

export default function CreatePostPage() {
    const [subreddit, setSubreddit] = useState("");
    const [title, setTitle] = useState("");
    const [flair, setFlair] = useState("");
    const [body, setBody] = useState("");
    const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
    const [allSubreddits, setAllSubreddits] = useState<Subreddit[]>([]);
    const [flairs, setFlairs] = useState<Flair[]>([]);
    const [rules, setRules] = useState<SubredditRule[]>([]);
    const [postRequirements, setPostRequirements] =
        useState<PostRequirement | null>(null);
    const [loadingSubreddits, setLoadingSubreddits] = useState(true);
    const [loadingFlairs, setLoadingFlairs] = useState(false);
    const [loadingRules, setLoadingRules] = useState(false);
    const [loadingRequirements, setLoadingRequirements] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [error, setError] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showRules, setShowRules] = useState(false);

    // Fuzzy search configuration
    const fuse = useMemo(() => {
        const combinedSubreddits = [...allSubreddits, ...subreddits];
        const uniqueSubreddits = combinedSubreddits.filter(
            (subreddit, index, self) =>
                index === self.findIndex((s) => s.id === subreddit.id),
        );

        const sortedSubreddits = uniqueSubreddits.sort((a, b) =>
            a.display_name
                .toLowerCase()
                .localeCompare(b.display_name.toLowerCase()),
        );

        return new Fuse(sortedSubreddits, {
            keys: ["display_name", "public_description"],
            threshold: 0.4,
            includeScore: true,
        });
    }, [allSubreddits, subreddits]);

    const filteredSubreddits = useMemo(() => {
        if (!searchQuery.trim()) {
            const combinedSubreddits = [...allSubreddits, ...subreddits];
            const uniqueSubreddits = combinedSubreddits.filter(
                (subreddit, index, self) =>
                    index === self.findIndex((s) => s.id === subreddit.id),
            );

            return uniqueSubreddits.sort((a, b) =>
                a.display_name
                    .toLowerCase()
                    .localeCompare(b.display_name.toLowerCase()),
            );
        }

        return fuse.search(searchQuery).map((result) => result.item);
    }, [fuse, searchQuery, allSubreddits, subreddits]);

    useEffect(() => {
        fetchSubreddits();
    }, []);

    // Debug: Monitor flairs state changes
    useEffect(() => {
        const timestamp = new Date().toISOString();
        console.log(`🔍 [${timestamp}] Flairs state changed for "${subreddit}":`, {
            count: flairs.length,
            flairNames: flairs.map(f => f.text),
            subreddit: subreddit,
            allFlairData: flairs
        });
        
        if (flairs.length === 0 && subreddit) {
            console.warn(`⚠️ [${timestamp}] No flairs found for r/${subreddit} - this might be expected if the subreddit doesn't use flairs`);
        } else if (flairs.length > 0) {
            console.log(`✅ [${timestamp}] Successfully loaded ${flairs.length} flairs for r/${subreddit}`);
        }
    }, [flairs, subreddit]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest(".relative")) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isDropdownOpen]);

    const fetchSubreddits = async () => {
        try {
            setLoadingSubreddits(true);
            setError("");
            const data = await redditAPI.fetchSubreddits(100);
            setAllSubreddits(data);
        } catch (err) {
            console.error("Error fetching subreddits:", err);
            setError(
                `Failed to fetch subreddits: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`,
            );

            // Fallback to some popular subreddits if API fails
            const fallbackSubreddits: Subreddit[] = [
                {
                    id: "1",
                    display_name: "AskReddit",
                    public_description:
                        "Ask and answer thought-provoking questions",
                    subscribers: 40000000,
                },
                {
                    id: "2",
                    display_name: "funny",
                    public_description: "Welcome to r/Funny",
                    subscribers: 50000000,
                },
                {
                    id: "3",
                    display_name: "science",
                    public_description:
                        "This community is a place to share and discuss new scientific research",
                    subscribers: 28000000,
                },
                {
                    id: "4",
                    display_name: "technology",
                    public_description:
                        "Subreddit dedicated to the news and discussions about the creation and use of technology",
                    subscribers: 14000000,
                },
                {
                    id: "5",
                    display_name: "gaming",
                    public_description:
                        "A subreddit for (almost) anything related to games",
                    subscribers: 37000000,
                },
                {
                    id: "6",
                    display_name: "news",
                    public_description:
                        "The place for news articles about current events in the United States and the rest of the world",
                    subscribers: 25000000,
                },
                {
                    id: "7",
                    display_name: "SideProject",
                    public_description:
                        "A community for sharing and receiving feedback on side projects",
                    subscribers: 100000,
                },
            ];
            setAllSubreddits(fallbackSubreddits);
        } finally {
            setLoadingSubreddits(false);
        }
    };

    const handleSubredditChange = async (selectedSubreddit: string) => {
        setSubreddit(selectedSubreddit);
        setFlair(""); // Reset flair when subreddit changes
        setSearchQuery(selectedSubreddit); // Update search query
        setIsDropdownOpen(false); // Close dropdown
        setRules([]); // Clear previous rules
        setPostRequirements(null); // Clear previous requirements

        if (selectedSubreddit) {
            try {
                setLoadingFlairs(true);
                setLoadingRules(true);
                setLoadingRequirements(true);

                console.log(`Fetching data for r/${selectedSubreddit}`);

                // Fetch flairs, rules, and post requirements in parallel
                const [flairData, rulesData, requirementsData] =
                    await Promise.all([
                        redditAPI
                            .fetchSubredditFlairs(selectedSubreddit)
                            .then(data => {
                                console.log(`✅ Flair API response for r/${selectedSubreddit}:`, data);
                                console.log(`📊 Number of flairs received: ${data.length}`);
                                if (data.length > 0) {
                                    console.log(`🎯 First 3 flairs:`, data.slice(0, 3));
                                }
                                return data;
                            })
                            .catch((err) => {
                                console.error(
                                    `❌ Flair fetch failed for r/${selectedSubreddit}:`,
                                    err,
                                );
                                return [];
                            }),
                        redditAPI
                            .fetchSubredditRules(selectedSubreddit)
                            .catch((err) => {
                                console.error(
                                    `Rules fetch failed for r/${selectedSubreddit}:`,
                                    err,
                                );
                                return [];
                            }),
                        redditAPI
                            .fetchPostRequirements(selectedSubreddit)
                            .catch((err) => {
                                console.error(
                                    `Requirements fetch failed for r/${selectedSubreddit}:`,
                                    err,
                                );
                                return null;
                            }),
                    ]);

                console.log(`📋 Final data summary for r/${selectedSubreddit}:`, {
                    flairs: flairData.length,
                    flairTexts: flairData.map(f => f.text),
                    rules: rulesData.length,
                    requirements: !!requirementsData,
                });

                console.log(`🎨 Setting flairs state:`, flairData);
                setFlairs(flairData);
                setRules(rulesData);
                setPostRequirements(requirementsData);
            } catch (err) {
                console.error(
                    `Failed to fetch data for ${selectedSubreddit}:`,
                    err,
                );
                console.log(`❌ Clearing flairs due to fetch error for r/${selectedSubreddit}`);
                setFlairs([]); // Clear flairs if fetch fails
                setRules([]);
                setPostRequirements(null);
            } finally {
                setLoadingFlairs(false);
                setLoadingRules(false);
                setLoadingRequirements(false);
            }
        } else {
            console.log(`🧹 Clearing flairs because no subreddit selected`);
            setFlairs([]);
            setRules([]);
            setPostRequirements(null);
        }
    };

    const handleSearchChange = async (value: string) => {
        setSearchQuery(value);
        setSubreddit(value);
        setIsDropdownOpen(true);
        setSelectedIndex(-1);

        // If the value exactly matches a subreddit, select it
        const combinedSubreddits = [...allSubreddits, ...subreddits];
        const exactMatch = combinedSubreddits.find(
            (sr) => sr.display_name.toLowerCase() === value.toLowerCase(),
        );

        if (exactMatch && value.length > 0) {
            handleSubredditChange(exactMatch.display_name);
        } else {
            console.log(`🧹 Clearing flairs in search change (no exact match for "${value}")`);
            setFlairs([]);

            // If search query is meaningful, search for more subreddits
            if (value.length >= 3 && !loadingSearch) {
                try {
                    setLoadingSearch(true);
                    const searchResults = await redditAPI.searchSubreddits(
                        value,
                        20,
                    );
                    setSubreddits(searchResults);
                } catch (err) {
                    console.error("Error searching subreddits:", err);
                } finally {
                    setLoadingSearch(false);
                }
            } else if (value.length < 3) {
                setSubreddits([]);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isDropdownOpen) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < filteredSubreddits.length - 1 ? prev + 1 : prev,
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && filteredSubreddits[selectedIndex]) {
                    handleSubredditChange(
                        filteredSubreddits[selectedIndex].display_name,
                    );
                }
                break;
            case "Escape":
                setIsDropdownOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 py-12 px-4">
            <div className="w-full max-w-xl bg-white dark:bg-neutral-950 rounded-2xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-800">
                <h1 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white text-center">
                    Create a Post
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form className="space-y-6">
                    {/* Subreddit Selection with Search */}
                    <div className="relative">
                        <label className="block text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-200">
                            Subreddit
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-[#FF4500] pr-10"
                                placeholder={
                                    loadingSubreddits
                                        ? "Loading subreddits..."
                                        : "Search for a subreddit..."
                                }
                                value={searchQuery}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                onFocus={() => setIsDropdownOpen(true)}
                                onKeyDown={handleKeyDown}
                                disabled={loadingSubreddits}
                                autoComplete="off"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                {loadingSubreddits || loadingSearch ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#FF4500] border-t-transparent"></div>
                                ) : (
                                    <svg
                                        className="h-5 w-5 text-neutral-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                )}
                            </div>
                        </div>

                        {/* Dropdown */}
                        {isDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {loadingSubreddits || loadingSearch ? (
                                    <div className="px-4 py-6 flex items-center justify-center">
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#FF4500] border-t-transparent"></div>
                                            <span className="text-neutral-500 dark:text-neutral-400 text-sm">
                                                {loadingSubreddits
                                                    ? "Loading subreddits..."
                                                    : "Searching..."}
                                            </span>
                                        </div>
                                    </div>
                                ) : filteredSubreddits.length > 0 ? (
                                    filteredSubreddits.map((sr, index) => (
                                        <button
                                            key={sr.id}
                                            type="button"
                                            className={`w-full text-left px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 last:border-b-0 focus:outline-none transition-colors ${
                                                index === selectedIndex
                                                    ? "bg-[#FF4500] text-white"
                                                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-neutral-100 dark:focus:bg-neutral-800"
                                            }`}
                                            onClick={() =>
                                                handleSubredditChange(
                                                    sr.display_name,
                                                )
                                            }
                                            onMouseEnter={() =>
                                                setSelectedIndex(index)
                                            }
                                        >
                                            <div
                                                className={`font-medium ${
                                                    index === selectedIndex
                                                        ? "text-white"
                                                        : "text-neutral-900 dark:text-white"
                                                }`}
                                            >
                                                r/{sr.display_name}
                                            </div>
                                            <div
                                                className={`text-sm truncate ${
                                                    index === selectedIndex
                                                        ? "text-orange-100"
                                                        : "text-neutral-600 dark:text-neutral-400"
                                                }`}
                                            >
                                                {sr.public_description}
                                            </div>
                                            <div
                                                className={`text-xs ${
                                                    index === selectedIndex
                                                        ? "text-orange-200"
                                                        : "text-neutral-500 dark:text-neutral-500"
                                                }`}
                                            >
                                                {sr.subscribers?.toLocaleString()}{" "}
                                                members
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-6 text-center">
                                        <div className="text-neutral-500 dark:text-neutral-400 text-sm">
                                            {searchQuery.length >= 3
                                                ? `No subreddits found for "${searchQuery}"`
                                                : searchQuery.length > 0
                                                ? "Type at least 3 characters to search"
                                                : "No subreddits found"}
                                        </div>
                                        {searchQuery.length >= 3 && (
                                            <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                                Try a different search term
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Click outside to close dropdown */}
                        {isDropdownOpen && (
                            <div
                                className="fixed inset-0 z-0"
                                onClick={() => setIsDropdownOpen(false)}
                            />
                        )}
                    </div>
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-200">
                            Title
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
                            placeholder="Title your post"
                            maxLength={300}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <div className="text-xs text-neutral-500 mt-1 text-right">
                            {title.length}/300
                        </div>
                    </div>
                    {/* Flair */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-200">
                            Flair (optional)
                            {loadingFlairs && (
                                <span className="ml-2 inline-flex items-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-[#FF4500] border-t-transparent"></div>
                                </span>
                            )}
                        </label>
                        <select
                            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
                            value={flair}
                            onChange={(e) => setFlair(e.target.value)}
                            disabled={loadingFlairs || !subreddit}
                        >
                            <option value="">
                                {loadingFlairs
                                    ? "Loading flairs..."
                                    : subreddit
                                    ? "No flair"
                                    : "Select a subreddit first"}
                            </option>
                            {flairs.map((f) => (
                                <option key={f.id} value={f.text}>
                                    {f.text}
                                </option>
                            ))}
                        </select>
                        {subreddit && flairs.length === 0 && !loadingFlairs && (
                            <div className="text-xs text-neutral-500 mt-1 flex items-center">
                                <svg
                                    className="w-3 h-3 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                No flairs available for r/{subreddit}
                            </div>
                        )}
                    </div>
                    {/* Body */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-200">
                            Body
                        </label>
                        <textarea
                            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#FF4500] resize-vertical"
                            placeholder="Write your post here..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                    </div>
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg font-semibold bg-[#FF4500] text-white text-lg shadow-lg hover:bg-[#e03d00] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                            !subreddit ||
                            !title ||
                            ![...allSubreddits, ...subreddits].find(
                                (sr) =>
                                    sr.display_name.toLowerCase() ===
                                    subreddit.toLowerCase(),
                            )
                        }
                    >
                        Submit
                    </button>
                </form>

                {/* Rules and Requirements Section */}
                {subreddit &&
                    (loadingRules ||
                        loadingRequirements ||
                        rules.length > 0 ||
                        postRequirements) && (
                        <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center">
                                    r/{subreddit} Guidelines
                                    {(loadingRules || loadingRequirements) && (
                                        <div className="ml-2 animate-spin rounded-full h-4 w-4 border-2 border-[#FF4500] border-t-transparent"></div>
                                    )}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowRules(!showRules)}
                                    className="text-[#FF4500] hover:text-[#e03d00] font-medium text-sm transition-colors"
                                    disabled={
                                        loadingRules && loadingRequirements
                                    }
                                >
                                    {showRules ? "Hide" : "Show"} Details
                                </button>
                            </div>

                            {showRules && (
                                <div className="space-y-6">
                                    {/* Post Requirements */}
                                    {loadingRequirements ? (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                            <div className="animate-pulse">
                                                <div className="h-5 bg-blue-200 dark:bg-blue-700 rounded w-1/3 mb-3"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-3/4"></div>
                                                    <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-2/3"></div>
                                                    <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        postRequirements && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                                                    <svg
                                                        className="w-5 h-5 mr-2"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Post Requirements
                                                </h3>
                                                <div className="space-y-2 text-sm">
                                                    {postRequirements.is_flair_required && (
                                                        <div className="flex items-center text-blue-800 dark:text-blue-200">
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                            Flair is required
                                                            for posts
                                                        </div>
                                                    )}
                                                    {postRequirements.title_text_min_length >
                                                        1 && (
                                                        <div className="flex items-center text-blue-800 dark:text-blue-200">
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                            Title must be at
                                                            least{" "}
                                                            {
                                                                postRequirements.title_text_min_length
                                                            }{" "}
                                                            characters
                                                        </div>
                                                    )}
                                                    {postRequirements.title_text_max_length <
                                                        300 && (
                                                        <div className="flex items-center text-blue-800 dark:text-blue-200">
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                            Title must be no
                                                            more than{" "}
                                                            {
                                                                postRequirements.title_text_max_length
                                                            }{" "}
                                                            characters
                                                        </div>
                                                    )}
                                                    {postRequirements.body_restriction_policy !==
                                                        "none" && (
                                                        <div className="flex items-center text-blue-800 dark:text-blue-200">
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                            Body content policy:{" "}
                                                            {
                                                                postRequirements.body_restriction_policy
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {/* Subreddit Rules */}
                                    {loadingRules ? (
                                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                                            <div className="animate-pulse">
                                                <div className="h-5 bg-orange-200 dark:bg-orange-700 rounded w-1/3 mb-3"></div>
                                                <div className="space-y-3">
                                                    {[1, 2, 3].map((i) => (
                                                        <div
                                                            key={i}
                                                            className="border-l-4 border-orange-400 pl-3"
                                                        >
                                                            <div className="h-4 bg-orange-200 dark:bg-orange-700 rounded w-2/3 mb-1"></div>
                                                            <div className="h-3 bg-orange-200 dark:bg-orange-700 rounded w-full"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        rules.length > 0 && (
                                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                                                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center">
                                                    <svg
                                                        className="w-5 h-5 mr-2"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Subreddit Rules
                                                </h3>
                                                <div className="space-y-3">
                                                    {rules.map(
                                                        (rule, index) => (
                                                            <div
                                                                key={index}
                                                                className="border-l-4 border-orange-400 pl-3"
                                                            >
                                                                <div className="font-medium text-orange-900 dark:text-orange-100">
                                                                    {index + 1}.{" "}
                                                                    {
                                                                        rule.short_name
                                                                    }
                                                                </div>
                                                                {rule.description && (
                                                                    <div className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                                                                        {
                                                                            rule.description
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {/* Show message if no rules or requirements found */}
                                    {!loadingRules &&
                                        !loadingRequirements &&
                                        rules.length === 0 &&
                                        !postRequirements && (
                                            <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-center">
                                                <div className="text-neutral-600 dark:text-neutral-400">
                                                    <svg
                                                        className="w-8 h-8 mx-auto mb-2 text-neutral-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                    <p className="text-sm">
                                                        No specific rules or
                                                        posting requirements
                                                        found for r/{subreddit}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 mt-1">
                                                        Please follow general
                                                        Reddit guidelines
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            )}

                            {/* Quick Summary */}
                            {!showRules && (
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {loadingRequirements || loadingRules ? (
                                        <div className="flex items-center">
                                            <div className="animate-pulse">
                                                <div className="h-4 bg-neutral-200 dark:bg-neutral-600 rounded w-32"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {postRequirements?.is_flair_required && (
                                                <span className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs mr-2 mb-2">
                                                    Flair Required
                                                </span>
                                            )}
                                            {rules.length > 0 && (
                                                <span className="inline-flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs mr-2 mb-2">
                                                    {rules.length} Rules
                                                </span>
                                            )}
                                            {postRequirements && (
                                                <span className="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs mr-2 mb-2">
                                                    Posting Guidelines Available
                                                </span>
                                            )}
                                            {!postRequirements &&
                                                rules.length === 0 && (
                                                    <span className="inline-flex items-center bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-full text-xs mr-2 mb-2">
                                                        No specific requirements
                                                    </span>
                                                )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
            </div>
        </div>
    );
}
