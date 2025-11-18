"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertTriangle,
    CheckCircle,
    XCircle,
    Share2,
    ArrowRight,
    Search,
    ChevronDown,
} from "lucide-react";
import Fuse from "fuse.js";

interface AnalysisResult {
    banRisk: number;
    risk_level: "low" | "medium" | "high" | "critical";
    issues: string[];
    suggestions: string[];
    reasoning: string;
}

interface Subreddit {
    display_name: string;
    public_description: string;
    subscribers: number;
    id: string;
}

export default function BanChecker() {
    const [postText, setPostText] = useState("");
    const [subreddit, setSubreddit] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState("");

    // Subreddit dropdown states
    const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
    const [allSubreddits, setAllSubreddits] = useState<Subreddit[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [loadingSubreddits, setLoadingSubreddits] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fuzzy search configuration
    const fuse = useMemo(() => {
        const combinedSubreddits = [...allSubreddits, ...subreddits];
        const uniqueSubreddits = combinedSubreddits.filter(
            (subreddit, index, self) =>
                index === self.findIndex((s) => s.id === subreddit.id),
        );
        return new Fuse(uniqueSubreddits, {
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

    // Load popular subreddits on mount
    useEffect(() => {
        fetchPopularSubreddits();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchPopularSubreddits = async () => {
        try {
            setLoadingSubreddits(true);
            const response = await fetch(
                "https://www.reddit.com/subreddits/popular.json?limit=100",
            );
            if (!response.ok) throw new Error("Failed to fetch subreddits");
            const data = await response.json();
            const subs: Subreddit[] = data.data.children.map((child: any) => ({
                display_name: child.data.display_name,
                public_description: child.data.public_description || "",
                subscribers: child.data.subscribers || 0,
                id: child.data.id,
            }));
            setAllSubreddits(subs);
        } catch (err) {
            console.error("Error fetching subreddits:", err);
        } finally {
            setLoadingSubreddits(false);
        }
    };

    const searchSubreddits = async (query: string) => {
        if (query.length < 3) {
            setSubreddits([]);
            return;
        }
        try {
            setLoadingSearch(true);
            const response = await fetch(
                `https://www.reddit.com/subreddits/search.json?q=${encodeURIComponent(query)}&limit=25`,
            );
            if (!response.ok) throw new Error("Failed to search");
            const data = await response.json();
            const subs: Subreddit[] = data.data.children.map((child: any) => ({
                display_name: child.data.display_name,
                public_description: child.data.public_description || "",
                subscribers: child.data.subscribers || 0,
                id: child.data.id,
            }));
            setSubreddits(subs);
        } catch (err) {
            console.error("Error searching subreddits:", err);
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setSubreddit(value);
        setIsDropdownOpen(true);
        setSelectedIndex(-1);
        const exactMatch = [...allSubreddits, ...subreddits].find(
            (sr) => sr.display_name.toLowerCase() === value.toLowerCase(),
        );
        if (exactMatch && value.length > 0) {
            setSubreddit(exactMatch.display_name);
            setIsDropdownOpen(false);
        } else if (value.length >= 3) {
            searchSubreddits(value);
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
                    setSubreddit(
                        filteredSubreddits[selectedIndex].display_name,
                    );
                    setSearchQuery(
                        filteredSubreddits[selectedIndex].display_name,
                    );
                    setIsDropdownOpen(false);
                }
                break;
            case "Escape":
                setIsDropdownOpen(false);
                break;
        }
    };

    const analyzePost = async () => {
        if (!postText.trim()) {
            setError("Please enter your post content");
            return;
        }

        if (!subreddit.trim()) {
            setError("Please select a subreddit");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postText,
                    subreddit: subreddit || "general",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Show helpful error message
                let errorMsg = data.error || "Analysis failed";
                if (data.details) {
                    errorMsg += `: ${data.details}`;
                }
                if (data.hint) {
                    errorMsg += ` (${data.hint})`;
                }
                throw new Error(errorMsg);
            }

            setResult(data);
        } catch (err) {
            let errorMessage = "Failed to analyze post. Please try again.";

            if (err instanceof Error) {
                errorMessage = err.message;

                // Add helpful context for common errors
                if (errorMessage.includes("API key not configured")) {
                    errorMessage +=
                        " ⚠️ This is a server configuration issue. The site admin needs to add the GOOGLE_GEMINI_API_KEY in Vercel settings.";
                } else if (errorMessage.includes("fetch")) {
                    errorMessage =
                        "Network error. Please check your internet connection and try again.";
                }
            }

            setError(errorMessage);
            console.error("Analysis error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case "low":
                return "text-green-600 bg-green-50";
            case "medium":
                return "text-yellow-600 bg-yellow-50";
            case "high":
                return "text-orange-600 bg-orange-50";
            case "critical":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case "low":
                return <CheckCircle className="w-16 h-16 text-green-600" />;
            case "medium":
                return <AlertTriangle className="w-16 h-16 text-yellow-600" />;
            case "high":
                return <AlertTriangle className="w-16 h-16 text-orange-600" />;
            case "critical":
                return <XCircle className="w-16 h-16 text-red-600" />;
            default:
                return null;
        }
    };

    const shareOnTwitter = () => {
        const text = `My Reddit post has a ${result?.banRisk}% ban risk 😱 Check yours at`;
        const url = window.location.href;
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            "_blank",
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-reddit rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                ?
                            </span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Will I Get Banned?
                        </h1>
                    </div>
                    <a
                        href={
                            process.env.NEXT_PUBLIC_MAIN_APP_URL ||
                            "https://unbannnable.com"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-reddit hover:underline"
                    >
                        by Unbannnable
                    </a>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Will Your Reddit Post Get{" "}
                        <span className="text-reddit">Banned</span>?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Free instant AI analysis. Check if your post violates
                        Reddit rules before you hit submit.
                    </p>
                </motion.div>

                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-8"
                >
                    <div className="space-y-4 sm:space-y-6">
                        <div className="relative" ref={dropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subreddit{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search for a subreddit (e.g., AskReddit)"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    onFocus={() => setIsDropdownOpen(true)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reddit focus:border-transparent outline-none"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Dropdown */}
                            {isDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {loadingSearch ? (
                                        <div className="px-4 py-8 text-center text-gray-500">
                                            <div className="animate-spin h-6 w-6 border-2 border-reddit border-t-transparent rounded-full mx-auto"></div>
                                            <p className="mt-2 text-sm">
                                                Searching...
                                            </p>
                                        </div>
                                    ) : filteredSubreddits.length > 0 ? (
                                        filteredSubreddits.map((sr, index) => (
                                            <div
                                                key={sr.id}
                                                onClick={() => {
                                                    setSubreddit(
                                                        sr.display_name,
                                                    );
                                                    setSearchQuery(
                                                        sr.display_name,
                                                    );
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                                                    index === selectedIndex
                                                        ? "bg-gray-100"
                                                        : ""
                                                }`}
                                            >
                                                <div className="font-medium text-gray-900">
                                                    r/{sr.display_name}
                                                </div>
                                                {sr.public_description && (
                                                    <div className="text-sm text-gray-500 truncate">
                                                        {sr.public_description.substring(
                                                            0,
                                                            80,
                                                        )}
                                                        {sr.public_description
                                                            .length > 80
                                                            ? "..."
                                                            : ""}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {sr.subscribers.toLocaleString()}{" "}
                                                    members
                                                </div>
                                            </div>
                                        ))
                                    ) : searchQuery.length >= 3 ? (
                                        <div className="px-4 py-8 text-center text-gray-500">
                                            No subreddits found
                                        </div>
                                    ) : (
                                        <div className="px-4 py-8 text-center text-gray-500">
                                            <p className="text-sm">
                                                Type at least 3 characters to
                                                search
                                            </p>
                                            {allSubreddits.length > 0 && (
                                                <p className="text-xs mt-2">
                                                    Or select from popular
                                                    subreddits below
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Post Content{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                placeholder="Paste your Reddit post here..."
                                value={postText}
                                onChange={(e) => setPostText(e.target.value)}
                                rows={8}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reddit focus:border-transparent outline-none resize-none"
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={analyzePost}
                            disabled={loading}
                            className="w-full bg-reddit hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Analyzing...
                                </span>
                            ) : (
                                "Check Ban Risk"
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Results Section */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            {/* Risk Score Card */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    {getRiskIcon(result.risk_level)}
                                </div>
                                <div
                                    className={`inline-block px-6 py-2 rounded-full text-sm font-bold mb-4 ${getRiskColor(result.risk_level)}`}
                                >
                                    {result.risk_level.toUpperCase()} RISK
                                </div>
                                <div className="text-6xl font-bold text-gray-900 mb-2">
                                    {result.banRisk}%
                                </div>
                                <p className="text-xl text-gray-600 mb-6">
                                    Chance of Getting Banned
                                </p>

                                {/* Share Button */}
                                <button
                                    onClick={shareOnTwitter}
                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                    <Share2 className="w-5 h-5" />
                                    <span>Share on Twitter</span>
                                </button>
                            </div>

                            {/* Issues Found */}
                            {result.issues.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                        Issues Found
                                    </h3>
                                    <ul className="space-y-3">
                                        {result.issues.map((issue, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start space-x-3 text-gray-700"
                                            >
                                                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                <span>{issue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Suggestions */}
                            {result.suggestions.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                        How to Fix It
                                    </h3>
                                    <ul className="space-y-3">
                                        {result.suggestions.map(
                                            (suggestion, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start space-x-3 text-gray-700"
                                                >
                                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span>{suggestion}</span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Upsell Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-r from-reddit to-orange-600 rounded-2xl shadow-xl p-8 text-white"
                            >
                                <h3 className="text-2xl font-bold mb-3">
                                    Want to Fix This Post Automatically?
                                </h3>
                                <p className="text-white/90 mb-6">
                                    Unbannnable uses AI to rewrite your post,
                                    check all subreddit rules, and ensure you
                                    never get banned again.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_MAIN_APP_URL || "https://unbannnable.com"}/app`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white text-reddit font-bold rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <span>Try Unbannnable Free</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </a>
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_MAIN_APP_URL || "https://unbannnable.com"}#pricing`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border-2 border-white/50 transition-colors"
                                    >
                                        View Pricing
                                    </a>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-20">
                <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-600 text-sm">
                    <p>
                        Free tool by{" "}
                        <a
                            href={
                                process.env.NEXT_PUBLIC_MAIN_APP_URL ||
                                "https://unbannnable.com"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-reddit hover:underline font-semibold"
                        >
                            Unbannnable
                        </a>{" "}
                        - Never get banned on Reddit again
                    </p>
                </div>
            </footer>
        </div>
    );
}
