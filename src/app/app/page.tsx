"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useUserSync } from "@/hooks/useUserSync";
import {
    redditAPI,
    type Subreddit,
    type Flair,
    type SubredditRule,
    type PostRequirement,
    type AlternativeSubreddit,
    type AlternativeSubredditsResponse,
    type PostViabilityResponse,
} from "@/lib/reddit-api";
import Fuse from "fuse.js";
import { motion, AnimatePresence } from "framer-motion";
import {
    usePostHogIdentify,
    trackPageView,
    trackUserAction,
    trackFormSubmission,
    trackFeatureUsage,
    trackPostCreation,
    trackAIGeneration,
    trackError,
} from "@/lib/posthog";

// Component to fetch and display AI-generated subreddit alternatives
const AISubredditCard = ({
    subredditName,
    reason,
    onUse,
}: {
    subredditName: string;
    reason: string;
    onUse: () => void;
}) => {
    const [subredditData, setSubredditData] = useState<{
        display_name: string;
        public_description: string;
        subscribers: number;
        url: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchSubredditData = async () => {
            try {
                setLoading(true);
                setError(false);

                console.log(`Fetching data for r/${subredditName}...`);

                // Fetch subreddit data from Reddit API
                const response = await fetch(
                    `/api/reddit/subreddit-info?subreddit=${encodeURIComponent(subredditName)}`,
                );

                console.log(
                    `Response status for r/${subredditName}:`,
                    response.status,
                );

                if (response.ok) {
                    const data = await response.json();
                    setSubredditData({
                        display_name: data.display_name,
                        public_description:
                            data.public_description ||
                            "No description available",
                        subscribers: data.subscribers || 0,
                        url: `https://reddit.com/r/${data.display_name}`,
                    });
                } else {
                    console.error(
                        `API error for r/${subredditName}:`,
                        response.status,
                        response.statusText,
                    );
                    setError(true);
                }
            } catch (err) {
                console.error(
                    `Error fetching data for r/${subredditName}:`,
                    err,
                );
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchSubredditData();
    }, [subredditName]);

    if (loading) {
        return (
            <div className="bg-white dark:bg-neutral-800 border border-yellow-300 dark:border-yellow-600 rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="animate-pulse">
                            <div className="h-4 bg-yellow-200 dark:bg-yellow-700 rounded w-24 mb-2"></div>
                            <div className="h-3 bg-yellow-200 dark:bg-yellow-700 rounded w-32"></div>
                        </div>
                    </div>
                    <div className="ml-3 w-12 h-6 bg-yellow-200 dark:bg-yellow-700 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (error || !subredditData) {
        return (
            <div className="bg-white dark:bg-neutral-800 border border-yellow-300 dark:border-yellow-600 rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <a
                            href={`https://reddit.com/r/${subredditName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            r/{subredditName}
                        </a>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            {reason}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            trackFeatureUsage("alternative_subreddit_used", {
                                original_subreddit: subredditName,
                                reason: reason,
                            });
                            onUse();
                        }}
                        className="ml-3 bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700 transition-colors"
                    >
                        Use
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-800 border border-yellow-300 dark:border-yellow-600 rounded-lg p-3">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <a
                        href={subredditData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        r/{subredditData.display_name}
                    </a>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 line-clamp-2">
                        {subredditData.public_description}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        {reason}
                    </p>
                </div>
                <button
                    onClick={() => {
                        trackFeatureUsage("alternative_subreddit_used", {
                            original_subreddit: subredditName,
                            reason: reason,
                        });
                        onUse();
                    }}
                    className="ml-3 bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700 transition-colors"
                >
                    Use
                </button>
            </div>
        </div>
    );
};

function AppPageContent() {
    // Initialize user sync
    const { user, isLoaded } = useUserSync();

    // Initialize PostHog tracking
    usePostHogIdentify();

    // Track page view
    useEffect(() => {
        trackPageView("home", {
            user_id: user?.id,
            is_authenticated: !!user,
        });
    }, [user]);

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
    const [isFirstPost, setIsFirstPost] = useState(true);
    const [currentScreen, setCurrentScreen] = useState<
        "dashboard" | "create-post"
    >("dashboard");

    // Track latest fetch to avoid race conditions when switching subreddits quickly
    const latestFetchIdRef = useRef(0);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [aiOutput, setAiOutput] = useState<string>("");
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [optimizedTitle, setOptimizedTitle] = useState<string>("");
    const [optimizedBody, setOptimizedBody] = useState<string>("");
    const [optimizedFlair, setOptimizedFlair] = useState<string>("");
    const [copyNotification, setCopyNotification] = useState<string>("");
    const [titleReasoning, setTitleReasoning] = useState<string>("");
    const [bodyReasoning, setBodyReasoning] = useState<string>("");
    const [flairReasoning, setFlairReasoning] = useState<string>("");
    const [showOptimizationSummary, setShowOptimizationSummary] =
        useState(false);

    // Alternative subreddits states
    const [alternativeSubreddits, setAlternativeSubreddits] =
        useState<AlternativeSubredditsResponse | null>(null);
    const [loadingAlternatives, setLoadingAlternatives] = useState(false);
    const [showAlternatives, setShowAlternatives] = useState(false);

    // Post viability states
    const [postViability, setPostViability] =
        useState<PostViabilityResponse | null>(null);
    const [loadingViability, setLoadingViability] = useState(false);
    const [showViabilityWarning, setShowViabilityWarning] = useState(false);

    // Draft storage states
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [draftPost, setDraftPost] = useState<{
        title: string;
        body: string;
        subreddit: string;
        flair: string;
    } | null>(null);

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
            // When no search query, show all subreddits sorted alphabetically
            const combinedSubreddits = [...allSubreddits, ...subreddits];
            const uniqueSubreddits = combinedSubreddits.filter(
                (subreddit, index, self) =>
                    index === self.findIndex((s) => s.id === subreddit.id),
            );

            // Fix: Ensure proper alphabetical sorting
            return uniqueSubreddits.sort((a, b) =>
                a.display_name
                    .toLowerCase()
                    .localeCompare(b.display_name.toLowerCase()),
            );
        }

        // When there's a search query, use Fuse.js search results
        const searchResults = fuse
            .search(searchQuery)
            .map((result) => result.item);

        // Also sort search results alphabetically
        return searchResults.sort((a, b) =>
            a.display_name
                .toLowerCase()
                .localeCompare(b.display_name.toLowerCase()),
        );
    }, [fuse, searchQuery, allSubreddits, subreddits]);

    useEffect(() => {
        fetchSubreddits();
    }, []);

    // Function to parse AI output and extract optimized content
    const parseAIOutput = (output: string) => {
        try {
            // Extract violation detection - new field
            const violationMatch = output.match(
                /\*\*VIOLATION_DETECTED:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*VIOLATION_REASON|\n\s*\*\*|$)/i,
            );
            const hasViolations =
                violationMatch &&
                violationMatch[1]?.trim().toUpperCase() === "YES";

            // Extract violation reason - new field
            const violationReasonMatch = output.match(
                /\*\*VIOLATION_REASON:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*VIOLATION_SUGGESTIONS|\n\s*\*\*|$)/i,
            );
            const violationReason = violationReasonMatch
                ? violationReasonMatch[1].trim()
                : "";

            // Extract violation suggestions - new field
            const violationSuggestionsMatch = output.match(
                /\*\*VIOLATION_SUGGESTIONS:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*ALTERNATIVE_SUBREDDITS|\n\s*\*\*|$)/i,
            );
            const violationSuggestions = violationSuggestionsMatch
                ? violationSuggestionsMatch[1].trim()
                : "";

            // Extract alternative subreddits - new field
            const alternativeSubredditsMatch = output.match(
                /\*\*ALTERNATIVE_SUBREDDITS:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*OPTIMIZED_TITLE|\n\s*\*\*|$)/i,
            );
            const alternativeSubredditsText = alternativeSubredditsMatch
                ? alternativeSubredditsMatch[1].trim()
                : "";

            // Parse alternative subreddits into structured format
            let parsedAlternatives: AlternativeSubreddit[] = [];
            if (
                alternativeSubredditsText &&
                alternativeSubredditsText !== "No alternatives needed"
            ) {
                const alternatives = alternativeSubredditsText
                    .split(";")
                    .map((alt) => alt.trim())
                    .filter((alt) => alt);
                parsedAlternatives = alternatives
                    .map((alt) => {
                        const match = alt.match(/r\/([^-]+)\s*-\s*(.+)/);
                        if (match) {
                            return {
                                display_name: match[1].trim(),
                                public_description: "",
                                subscribers: 0,
                                url: `https://reddit.com/r/${match[1].trim()}`,
                                reason: match[2].trim(),
                            };
                        }
                        return null;
                    })
                    .filter(Boolean) as AlternativeSubreddit[];
            }

            // If violations detected, set the alternative subreddits and show warning
            if (hasViolations) {
                setAlternativeSubreddits({
                    strictRules: [violationReason],
                    alternatives: parsedAlternatives,
                    message: violationReason,
                });
                setShowAlternatives(true);
                setShowViabilityWarning(true);

                // Clear optimization fields since we can't optimize
                setOptimizedTitle("");
                setOptimizedBody("");
                setOptimizedFlair("");
                setTitleReasoning("");
                setBodyReasoning("");
                setFlairReasoning("");
                return;
            }

            // If no violations, proceed with normal parsing
            // Extract optimized title - improved regex
            const titleMatch = output.match(
                /\*\*OPTIMIZED_TITLE:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*TITLE_REASONING|\n\s*\*\*|$)/i,
            );
            if (titleMatch && titleMatch[1]) {
                const title = titleMatch[1].trim();
                setOptimizedTitle(title);
            }

            // Extract title reasoning - improved regex
            const titleReasoningMatch = output.match(
                /\*\*TITLE_REASONING:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*OPTIMIZED_BODY|\n\s*\*\*|$)/i,
            );
            if (titleReasoningMatch && titleReasoningMatch[1]) {
                const reasoning = titleReasoningMatch[1].trim();
                setTitleReasoning(reasoning);
            }

            // Extract optimized body - improved regex
            const bodyMatch = output.match(
                /\*\*OPTIMIZED_BODY:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*BODY_REASONING|\n\s*\*\*|$)/i,
            );
            if (bodyMatch && bodyMatch[1]) {
                const body = bodyMatch[1].trim();
                setOptimizedBody(body);
            }

            // Extract body reasoning - improved regex
            const bodyReasoningMatch = output.match(
                /\*\*BODY_REASONING:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*RECOMMENDED_FLAIR|\n\s*\*\*|$)/i,
            );
            if (bodyReasoningMatch && bodyReasoningMatch[1]) {
                const reasoning = bodyReasoningMatch[1].trim();
                setBodyReasoning(reasoning);
            }

            // Extract recommended flair - improved regex
            const flairMatch = output.match(
                /\*\*RECOMMENDED_FLAIR:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*FLAIR_REASONING|\n\s*\*\*|$)/i,
            );
            if (flairMatch && flairMatch[1]) {
                const flair = flairMatch[1].trim();
                setOptimizedFlair(flair);
            }

            // Extract flair reasoning - improved regex
            const flairReasoningMatch = output.match(
                /\*\*FLAIR_REASONING:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*|$)/i,
            );
            if (flairReasoningMatch && flairReasoningMatch[1]) {
                const reasoning = flairReasoningMatch[1].trim();
                setFlairReasoning(reasoning);
            }

            // Clear any existing violation warnings since no violations were detected
            setShowViabilityWarning(false);
            setShowAlternatives(false);
            setAlternativeSubreddits(null);
        } catch (error) {
            console.error("Error parsing AI output:", error);
        }
    };

    // Function to copy text to clipboard
    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopyNotification(`${type} copied to clipboard!`);
            setTimeout(() => setCopyNotification(""), 3000);
        } catch (error) {
            console.error("Failed to copy text:", error);
            setCopyNotification("Failed to copy text");
            setTimeout(() => setCopyNotification(""), 3000);
        }
    };

    // Clear AI output when content changes (but don't auto-generate)
    useEffect(() => {
        setAiOutput("");
        setOptimizedTitle("");
        setOptimizedBody("");
        setOptimizedFlair("");
        setTitleReasoning("");
        setBodyReasoning("");
        setFlairReasoning("");
        setShowOptimizationSummary(false);
    }, [title, body, subreddit, rules, postRequirements, flair]);

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
            setAllSubreddits([]);
        } finally {
            setLoadingSubreddits(false);
        }
    };

    const handleSubredditChange = async (selectedSubreddit: string) => {
        trackFeatureUsage("subreddit_selected", {
            subreddit: selectedSubreddit,
            user_id: user?.id,
            previous_subreddit: subreddit,
        });

        setSubreddit(selectedSubreddit);
        setFlair("");
        setSearchQuery(selectedSubreddit);
        setIsDropdownOpen(false);
        setRules([]);
        setPostRequirements(null);
        // Clear previous flairs immediately so UI doesn't show stale options
        setFlairs([]);

        // Increment fetch id for this request
        const fetchId = ++latestFetchIdRef.current;

        if (selectedSubreddit) {
            try {
                setLoadingFlairs(true);
                setLoadingRules(true);
                setLoadingRequirements(true);

                const [flairData, rulesData, requirementsData] =
                    await Promise.all([
                        redditAPI
                            .fetchSubredditFlairs(selectedSubreddit)
                            .catch(() => []),
                        redditAPI
                            .fetchSubredditRules(selectedSubreddit)
                            .catch(() => []),
                        redditAPI
                            .fetchPostRequirements(selectedSubreddit)
                            .catch(() => null),
                    ]);

                // Ignore if a newer subreddit change happened since this request started
                if (fetchId !== latestFetchIdRef.current) return;

                setFlairs(flairData);
                setRules(rulesData);
                setPostRequirements(requirementsData);
            } catch (err) {
                console.error(
                    `Failed to fetch data for ${selectedSubreddit}:`,
                    err,
                );
                // Ignore if stale
                if (fetchId !== latestFetchIdRef.current) return;
                setFlairs([]);
                setRules([]);
                setPostRequirements(null);
            } finally {
                // Ignore if stale
                if (fetchId !== latestFetchIdRef.current) return;
                setLoadingFlairs(false);
                setLoadingRules(false);
                setLoadingRequirements(false);
            }
        }
    };

    const handleSearchChange = async (value: string) => {
        setSearchQuery(value);
        setSubreddit(value);
        setIsDropdownOpen(true);
        setSelectedIndex(-1);

        const combinedSubreddits = [...allSubreddits, ...subreddits];
        const exactMatch = combinedSubreddits.find(
            (sr) => sr.display_name.toLowerCase() === value.toLowerCase(),
        );

        if (exactMatch && value.length > 0) {
            handleSubredditChange(exactMatch.display_name);
        } else {
            setFlairs([]);
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

    const createPostRecord = async () => {
        try {
            trackPostCreation({
                subreddit: subreddit.trim(),
                title_length: title.trim().length,
                body_length: body.trim().length,
                has_flair: !!flair.trim(),
                user_id: user?.id,
            });

            const response = await fetch("/api/posts/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: body.trim(),
                    subreddit: subreddit.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403) {
                    // Just return false, no limit restrictions
                    return false;
                }
                trackError("post_creation_failed", {
                    error: data.error,
                    status: response.status,
                    user_id: user?.id,
                });
                throw new Error(data.error || "Failed to create post");
            }

            trackUserAction("post_created", {
                subreddit: subreddit.trim(),
                user_id: user?.id,
            });

            return true;
        } catch (error) {
            console.error("Error creating post record:", error);
            trackError("post_creation_exception", {
                error: error instanceof Error ? error.message : "Unknown error",
                user_id: user?.id,
            });
            // Don't show error to user for post recording, just log it
            return false;
        }
    };

    const generateAIOptimizedPost = async () => {
        if (!title.trim() || !subreddit.trim()) return;

        trackAIGeneration("post_optimization", {
            subreddit: subreddit.trim(),
            title_length: title.trim().length,
            body_length: body.trim().length,
            has_rules: rules.length > 0,
            has_requirements: !!postRequirements,
            user_id: user?.id,
        });

        setIsGeneratingAI(true);

        try {
            // Create context for AI processing
            const context = {
                title: title.trim(),
                body: body.trim(),
                subreddit: subreddit.trim(),
                flair: flair.trim(),
                rules: rules
                    .map((rule) => `${rule.short_name}: ${rule.description}`)
                    .join("; "),
                postRequirements: postRequirements
                    ? JSON.stringify(postRequirements)
                    : "None",
                availableFlairs:
                    flairs.map((f) => f.text).join(", ") || "None available",
            };

            // Enhanced prompt for AI optimization with rule checking
            const prompt = `You are a Reddit post optimization expert. Your task is to FIRST check if the user's draft post violates any subreddit rules or requirements, and then either suggest alternatives or optimize the post accordingly.

**USER'S DRAFT POST:**
- Title: "${context.title}"
- Body: "${context.body}"
- Target Subreddit: r/${context.subreddit}
- Current Flair: "${context.flair}"
- Subreddit Rules: ${context.rules}
- Post Requirements: ${context.postRequirements}
- Available Flairs: ${context.availableFlairs}

**STEP 1: RULE VIOLATION ANALYSIS**
Carefully analyze the draft post against the subreddit rules and requirements. Look for:
- Self-promotion or advertising content
- Personal information sharing
- Spam or low-effort content
- Content that doesn't match the subreddit's purpose
- Violations of specific subreddit rules
- Non-compliance with post requirements (title length, flair requirements, etc.)

**STEP 2: DECISION MAKING**
If the post violates rules or requirements:
- Set VIOLATION_DETECTED to "YES"
- Provide VIOLATION_REASON with specific rule violations
- Suggest VIOLATION_SUGGESTIONS for how to fix the content
- Set ALTERNATIVE_SUBREDDITS to suggest 3-5 alternative subreddits where this content would be appropriate

If the post complies with rules and requirements:
- Set VIOLATION_DETECTED to "NO"
- Proceed with normal optimization

**STEP 3: OUTPUT FORMAT**
Provide your response in exactly this format:

**VIOLATION_DETECTED:**
[YES or NO]

**VIOLATION_REASON:**
[If YES, explain which specific rules are violated. If NO, write "No violations detected"]

**VIOLATION_SUGGESTIONS:**
[If YES, provide specific suggestions to fix the violations. If NO, write "No suggestions needed"]

**ALTERNATIVE_SUBREDDITS:**
[If YES, suggest 3-5 alternative subreddits in format: "r/subreddit1 - reason1; r/subreddit2 - reason2; etc." If NO, write "No alternatives needed"]

**OPTIMIZED_TITLE:**
[If NO violations, provide optimized title. If YES violations, write "Cannot optimize - rule violations detected"]

**TITLE_REASONING:**
[If NO violations, explain optimization reasoning. If YES violations, write "Cannot optimize - rule violations detected"]

**OPTIMIZED_BODY:**
[If NO violations, provide optimized body. If YES violations, write "Cannot optimize - rule violations detected"]

**BODY_REASONING:**
[If NO violations, explain optimization reasoning. If YES violations, write "Cannot optimize - rule violations detected"]

**RECOMMENDED_FLAIR:**
[If NO violations, select appropriate flair. If YES violations, write "Cannot optimize - rule violations detected"]

**FLAIR_REASONING:**
[If NO violations, explain flair choice. If YES violations, write "Cannot optimize - rule violations detected"]`;

            // Use Gemini API directly instead of ai-bind
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

            let result = "";
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            contents: [
                                {
                                    parts: [
                                        {
                                            text: prompt,
                                        },
                                    ],
                                },
                            ],
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 2048,
                            },
                        }),
                    },
                );

                if (!response.ok) {
                    console.warn(
                        `Gemini API request failed: ${response.status} ${response.statusText}`,
                    );
                    throw new Error(`API request failed: ${response.status}`);
                }

                const data = await response.json();
                result = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

                if (!result) {
                    throw new Error("No content generated from API");
                }

                setAiOutput(result);
                parseAIOutput(result);

                // Create post record after successful AI optimization
                await createPostRecord();
            } catch (apiError) {
                console.error("Gemini API error:", apiError);
                // Fallback to enhanced local optimization
                throw apiError;
            }

            // Fallback: If parsing didn't extract content, try to set some basic optimized content
            // Use a longer timeout to ensure state has been updated, and add better checks
            setTimeout(() => {
                // Only use fallback if AI parsing completely failed to extract any content
                if (
                    !optimizedTitle &&
                    !optimizedBody &&
                    !optimizedFlair &&
                    title.trim()
                ) {
                    setOptimizedTitle(title.trim());
                    setTitleReasoning(
                        "Enhanced title for better engagement and readability",
                    );
                    if (flairs.length > 0) {
                        setOptimizedFlair(flairs[0].text);
                        setFlairReasoning(
                            "Selected most appropriate flair for content categorization",
                        );
                    }
                }
            }, 500);
        } catch (error) {
            console.error("AI optimization error:", error);

            // Enhanced fallback implementation when API fails
            let enhancedTitle = title;
            let enhancedBody = body;

            const hasFlairRequirement = postRequirements?.is_flair_required;

            // Enhance title with contextual improvements
            if (title.length < 10) {
                enhancedTitle = `[${
                    flair || "Help"
                }] ${title} - Need advice from r/${subreddit} community`;
            } else if (!title.includes(subreddit) && subreddit) {
                // Add subreddit context if not present
                enhancedTitle = `${title} (r/${subreddit})`;
            }

            // Enhance body with engagement elements
            if (body.length < 50) {
                enhancedBody = `${body}\n\nAdditional context: I'm posting this in r/${subreddit} and would appreciate any insights from the community. ${
                    hasFlairRequirement
                        ? `I've selected the "${flair}" flair as required.`
                        : ""
                }\n\nThanks in advance for your help!`;
            } else {
                // Add community engagement elements to existing content
                enhancedBody = `${body}\n\n---\n\nPosting in r/${subreddit} - looking forward to your thoughts and feedback!`;
            }

            // Create fallback optimization summary
            const fallbackSuggestions = `**AI Optimization (Offline Mode)**

**OPTIMIZED_TITLE:**
${enhancedTitle}

**TITLE_REASONING:**
Enhanced for better community engagement and discoverability. ${
                title.length < 10
                    ? "Added context and community reference to improve clarity."
                    : "Maintained original structure while adding subreddit context."
            }

**OPTIMIZED_BODY:**
${enhancedBody}

**BODY_REASONING:**
${
    body.length < 50
        ? "Expanded content with community-specific elements and engagement hooks."
        : "Added community engagement footer to encourage responses and discussion."
}

**RECOMMENDED_FLAIR:**
${flair || (flairs.length > 0 ? flairs[0].text : "Discussion")}

**FLAIR_REASONING:**
${
    flair
        ? "Using user-selected flair as it appears appropriate for the content."
        : flairs.length > 0
          ? "Selected most relevant available flair for content categorization."
          : "Discussion flair recommended for general community engagement."
}

**AI Analysis:**
✅ Title length: ${enhancedTitle.length} characters (${
                postRequirements?.title_text_min_length
                    ? `min: ${postRequirements.title_text_min_length}`
                    : "no min requirement"
            })
${
    hasFlairRequirement
        ? "✅ Flair requirement satisfied"
        : "• No flair requirement"
}
${
    rules.length > 0
        ? `✅ Checked against ${rules.length} subreddit rules`
        : "• No specific rules found"
}

**Compliance Check:**
${rules
    .slice(0, 3)
    .map((rule, i) => `• Rule ${i + 1}: ${rule.short_name} - ✅ Compliant`)
    .join("\n")}

**Engagement Tips:**
• Added community-specific language
• Included appreciation for responses
• ${
                hasFlairRequirement
                    ? "Flair selection helps with discoverability"
                    : "Consider adding relevant keywords"
            }
• Post timing: Consider posting during peak hours for r/${subreddit}

**Note:** AI optimization service temporarily unavailable (${
                error instanceof Error ? error.message : "Unknown error"
            }). Showing enhanced fallback suggestions.`;

            setAiOutput(fallbackSuggestions);
            parseAIOutput(fallbackSuggestions);

            // Create post record even for fallback optimization
            await createPostRecord();
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const validateForm = (): string[] => {
        const errors: string[] = [];

        if (!title.trim()) errors.push("Title is required");
        if (!subreddit.trim()) errors.push("Subreddit is required");

        if (
            postRequirements?.title_text_min_length &&
            title.length < postRequirements.title_text_min_length
        ) {
            errors.push(
                `Title must be at least ${postRequirements.title_text_min_length} characters`,
            );
        }

        if (
            postRequirements?.title_text_max_length &&
            title.length > postRequirements.title_text_max_length
        ) {
            errors.push(
                `Title must be no more than ${postRequirements.title_text_max_length} characters`,
            );
        }

        const combinedSubreddits = [...allSubreddits, ...subreddits];
        const subredditExists = combinedSubreddits.find(
            (sr) => sr.display_name.toLowerCase() === subreddit.toLowerCase(),
        );

        if (subreddit.trim() && !subredditExists) {
            errors.push("Please select a valid subreddit from the dropdown");
        }

        if (postRequirements?.is_flair_required && !flair) {
            errors.push("Flair is required for this subreddit");
        }

        return errors;
    };

    // Function to detect content type based on title and body
    const detectContentType = (title: string, body: string): string => {
        const text = `${title} ${body}`.toLowerCase();

        // Check for product-related keywords
        if (
            text.includes("product") ||
            text.includes("app") ||
            text.includes("software") ||
            text.includes("tool") ||
            text.includes("website") ||
            text.includes("platform") ||
            text.includes("saas") ||
            text.includes("application")
        ) {
            return "product-promotion";
        }

        // Check for service-related keywords
        if (
            text.includes("service") ||
            text.includes("freelance") ||
            text.includes("hire") ||
            text.includes("consulting") ||
            text.includes("help") ||
            text.includes("assistance") ||
            text.includes("support") ||
            text.includes("work")
        ) {
            return "service-promotion";
        }

        // Check for business-related keywords
        if (
            text.includes("business") ||
            text.includes("company") ||
            text.includes("startup") ||
            text.includes("entrepreneur") ||
            text.includes("brand") ||
            text.includes("marketing") ||
            text.includes("promote") ||
            text.includes("advertise")
        ) {
            return "self-promotion";
        }

        return "self-promotion";
    };

    // Function to check if post can be made in the current subreddit
    const checkPostViability = async () => {
        if (!subreddit.trim() || !title.trim()) {
            console.log("❌ Missing subreddit or title for viability check");
            return null;
        }

        console.log("🔍 Starting viability check for:", {
            subreddit,
            title,
            body,
        });
        setLoadingViability(true);
        setShowViabilityWarning(false);
        setPostViability(null);

        try {
            const viability = await redditAPI.checkPostViability(
                subreddit,
                title,
                body,
            );

            console.log("📊 Viability API response:", viability);
            setPostViability(viability);

            if (!viability.analysis.canPost) {
                console.log(
                    "❌ Post cannot be made according to viability check",
                );
                setShowViabilityWarning(true);
            } else {
                console.log("✅ Post can be made according to viability check");
            }

            return viability;
        } catch (error) {
            console.error("❌ Error checking post viability:", error);
            return null;
        } finally {
            setLoadingViability(false);
        }
    };

    // Function to check for strict rules and suggest alternatives
    const checkStrictRulesAndSuggestAlternatives = async () => {
        if (!subreddit.trim() || !title.trim()) return;

        setLoadingAlternatives(true);
        setShowAlternatives(false);
        setAlternativeSubreddits(null);

        try {
            const alternatives = await redditAPI.fetchAlternativeSubreddits(
                subreddit,
                title,
                body,
            );

            if (
                alternatives &&
                alternatives.alternatives &&
                alternatives.alternatives.length > 0
            ) {
                setAlternativeSubreddits(alternatives);
                setShowAlternatives(true);
            }
        } catch (error) {
        } finally {
            setLoadingAlternatives(false);
        }
    };

    // Debounced function to automatically check alternatives
    const debouncedCheckAlternatives = useMemo(() => {
        let timeoutId: NodeJS.Timeout;
        return () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (subreddit && title && title.length > 10) {
                    checkStrictRulesAndSuggestAlternatives();
                }
            }, 2000); // Wait 2 seconds after user stops typing
        };
    }, [subreddit, title, body]);

    // Function to save draft post
    const saveDraftPost = () => {
        if (title.trim() || body.trim() || subreddit.trim()) {
            const draft = {
                title: title.trim(),
                body: body.trim(),
                subreddit: subreddit.trim(),
                flair: flair.trim(),
            };
            setDraftPost(draft);
            localStorage.setItem("reddit-unbanr-draft", JSON.stringify(draft));
        }
    };

    // Function to restore draft post
    const restoreDraftPost = () => {
        const savedDraft = localStorage.getItem("reddit-unbanr-draft");
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                setTitle(draft.title || "");
                setBody(draft.body || "");
                setSubreddit(draft.subreddit || "");
                setSearchQuery(draft.subreddit || "");
                setFlair(draft.flair || "");
                setDraftPost(draft);

                // Load subreddit data if subreddit is set
                if (draft.subreddit) {
                    handleSubredditChange(draft.subreddit);
                }
            } catch (error) {
                console.error("Error restoring draft:", error);
            }
        }
    };

    // Function to clear draft post
    const clearDraftPost = () => {
        setDraftPost(null);
        localStorage.removeItem("reddit-unbanr-draft");
    };

    // Check for draft post on component mount
    useEffect(() => {
        if (isLoaded && user && draftPost) {
            // User just logged in, restore the draft
            restoreDraftPost();
            setShowLoginModal(false);
        } else if (isLoaded && !user) {
            // User is logged out, check for saved draft
            const savedDraft = localStorage.getItem("reddit-unbanr-draft");
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    setDraftPost(draft);
                } catch (error) {
                    console.error("Error loading draft:", error);
                }
            }
        }
    }, [isLoaded, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        trackFormSubmission("post_optimization", {
            subreddit: subreddit.trim(),
            title_length: title.trim().length,
            body_length: body.trim().length,
            has_flair: !!flair.trim(),
            user_id: user?.id,
            is_authenticated: !!user,
        });

        // Check if user is logged in
        if (!user) {
            trackUserAction("login_required", {
                context: "form_submission",
            });
            // Save draft and show login modal
            saveDraftPost();
            setShowLoginModal(true);
            return;
        }

        const errors = validateForm();
        setValidationErrors(errors);
        if (errors.length === 0) {
            // Allow unlimited post creation
            // Removed post limit checks

            // Clear any existing warnings and alternatives
            setShowViabilityWarning(false);
            setShowAlternatives(false);
            setAlternativeSubreddits(null);

            console.log("🔍 Starting AI analysis with rule checking for:", {
                subreddit,
                title,
                body,
            });

            // The AI will now handle both rule checking and optimization
            generateAIOptimizedPost();
        } else {
            trackError("form_validation_failed", {
                errors: errors,
                user_id: user?.id,
            });
        }
    };

    const handleConfirmPost = async () => {
        trackUserAction("confirm_post_after_payment", {
            user_id: user?.id,
            subreddit: subreddit.trim(),
            title_length: title.trim().length,
            body_length: body.trim().length,
        });

        // Clear any existing warnings and alternatives
        setShowViabilityWarning(false);
        setShowAlternatives(false);
        setAlternativeSubreddits(null);

        console.log(
            "🔍 handleConfirmPost: Starting AI analysis with rule checking",
        );

        // The AI will now handle both rule checking and optimization
        await generateAIOptimizedPost();

        // Mark that user is no longer on first post
        setIsFirstPost(false);

        // Clear form after optimization is complete
        setTimeout(() => {
            setTitle("");
            setBody("");
            setFlair("");
            setSubreddit("");
            setSearchQuery("");
            setValidationErrors([]);
        }, 1000); // Small delay to let user see the optimization results
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
            {/* Navigation Header */}
            <nav className="w-full bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 py-3 sm:py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Left side - Logo and Brand */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <img
                            src="/icon.png"
                            alt="Unbannnable Logo"
                            className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                        <a
                            href="#"
                            className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white hover:text-[#FF4500] dark:hover:text-[#FF4500] transition-colors"
                        >
                            Unbannnable
                        </a>
                        ''{" "}
                    </div>

                    {/* Right side - Navigation and Authentication */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 bg-[#FF4500] text-white rounded-lg hover:bg-[#e03d00] transition-colors text-sm font-medium">
                                    Login
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>
            </nav>

            {/* Copy Notification */}
            {copyNotification && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
                    {copyNotification}
                </div>
            )}

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[45%_10%_45%] gap-0">
                    {/* Left Column - Post Creation Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-neutral-950 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-800 h-[85vh] flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    Create a Post
                                </h2>
                                {draftPost && !user && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        <svg
                                            className="w-3 h-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Draft Saved
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            {validationErrors.length > 0 && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    <h4 className="font-semibold mb-2 text-sm">
                                        Please fix the following errors:
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        {validationErrors.map(
                                            (error, index) => (
                                                <li key={index}>{error}</li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                            <form
                                className="space-y-4 flex-1 overflow-y-auto"
                                onSubmit={handleSubmit}
                            >
                                {/* Subreddit Selection */}
                                <div className="relative">
                                    <label className="block text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-200">
                                        Subreddit
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:border-[#FF4500] pr-10 transition-all duration-200"
                                            placeholder={
                                                loadingSubreddits
                                                    ? "Loading..."
                                                    : "Search subreddit..."
                                            }
                                            value={searchQuery}
                                            onChange={(e) =>
                                                handleSearchChange(
                                                    e.target.value,
                                                )
                                            }
                                            onFocus={() =>
                                                setIsDropdownOpen(true)
                                            }
                                            onKeyDown={handleKeyDown}
                                            disabled={loadingSubreddits}
                                            autoComplete="off"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            {loadingSubreddits ||
                                            loadingSearch ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#FF4500] border-t-transparent"></div>
                                            ) : (
                                                <svg
                                                    className="h-4 w-4 text-neutral-400"
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
                                        <div className="absolute z-10 w-full mt-3 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                            {loadingSubreddits ||
                                            loadingSearch ? (
                                                <div className="px-4 py-4 flex items-center justify-center">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-[#FF4500] border-t-transparent"></div>
                                                        <span className="text-neutral-500 dark:text-neutral-400 text-xs">
                                                            {loadingSubreddits
                                                                ? "Loading..."
                                                                : "Searching..."}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : filteredSubreddits.length >
                                              0 ? (
                                                filteredSubreddits
                                                    .slice(0, 10)
                                                    .map((sr, index) => (
                                                        <button
                                                            key={sr.id}
                                                            type="button"
                                                            className={`w-full text-left px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 focus:outline-none transition-all duration-200 text-sm transform hover:scale-[1.02] ${
                                                                index ===
                                                                selectedIndex
                                                                    ? "bg-[#FF4500] text-white"
                                                                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                            }`}
                                                            onClick={() =>
                                                                handleSubredditChange(
                                                                    sr.display_name,
                                                                )
                                                            }
                                                            onMouseEnter={() =>
                                                                setSelectedIndex(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <div
                                                                className={`font-medium ${
                                                                    index ===
                                                                    selectedIndex
                                                                        ? "text-white"
                                                                        : "text-neutral-900 dark:text-white"
                                                                }`}
                                                            >
                                                                r/
                                                                {
                                                                    sr.display_name
                                                                }
                                                            </div>
                                                            <div
                                                                className={`truncate ${
                                                                    index ===
                                                                    selectedIndex
                                                                        ? "text-orange-100"
                                                                        : "text-neutral-600 dark:text-neutral-400"
                                                                }`}
                                                            >
                                                                {
                                                                    sr.public_description
                                                                }
                                                            </div>
                                                        </button>
                                                    ))
                                            ) : (
                                                <div className="px-4 py-4 text-center text-neutral-500 text-xs">
                                                    {searchQuery.length >= 3
                                                        ? `No subreddits found for "${searchQuery}"`
                                                        : "Type at least 3 characters to search"}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {isDropdownOpen && (
                                        <div
                                            className="fixed inset-0 z-0"
                                            onClick={() =>
                                                setIsDropdownOpen(false)
                                            }
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
                                        className="w-full rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:border-[#FF4500] transition-all duration-200"
                                        placeholder="Title your post"
                                        maxLength={300}
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                            debouncedCheckAlternatives();
                                        }}
                                    />
                                    <div className="text-xs text-neutral-500 mt-1 text-right">
                                        {title.length}/300
                                    </div>
                                </div>

                                {/* Flair */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-200">
                                        Flair{" "}
                                        {postRequirements?.is_flair_required && (
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        )}
                                        {loadingFlairs && (
                                            <span className="ml-2 inline-flex items-center">
                                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-[#FF4500] border-t-transparent"></div>
                                            </span>
                                        )}
                                    </label>
                                    <select
                                        key={subreddit || "no-sr"}
                                        className="w-full rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:border-[#FF4500] transition-all duration-200"
                                        value={flair}
                                        onChange={(e) =>
                                            setFlair(e.target.value)
                                        }
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
                                </div>

                                {/* Body */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-200">
                                        Body
                                    </label>
                                    <textarea
                                        className="w-full rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-4 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:border-[#FF4500] resize-vertical transition-all duration-200"
                                        placeholder="Write your post here..."
                                        value={body}
                                        onChange={(e) => {
                                            setBody(e.target.value);
                                            debouncedCheckAlternatives();
                                        }}
                                    />
                                </div>
                            </form>

                            {/* Subreddit Rules Dropdown - Moved from left column */}
                            {subreddit && (
                                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                    <details className="group">
                                        <summary className="cursor-pointer text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white flex items-center">
                                            <svg
                                                className="w-4 h-4 mr-2 text-neutral-500"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            r/{subreddit} Rules & Requirements
                                            {(loadingRules ||
                                                loadingRequirements) && (
                                                <div className="ml-2 animate-spin rounded-full h-3 w-3 border-2 border-[#FF4500] border-t-transparent"></div>
                                            )}
                                        </summary>
                                        <div className="mt-3 space-y-3 max-h-60 overflow-y-auto">
                                            {/* Post Requirements */}
                                            {loadingRequirements ? (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                                                    <div className="animate-pulse">
                                                        <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-1/3 mb-2"></div>
                                                        <div className="space-y-1">
                                                            <div className="h-3 bg-blue-200 dark:bg-blue-700 rounded w-3/4"></div>
                                                            <div className="h-3 bg-blue-200 dark:bg-blue-700 rounded w-1/2"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                postRequirements && (
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                                                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center text-xs">
                                                            📋 Post Requirements
                                                        </h4>
                                                        <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                                                            {postRequirements.title_text_min_length && (
                                                                <div>
                                                                    • Min title
                                                                    length:{" "}
                                                                    {
                                                                        postRequirements.title_text_min_length
                                                                    }{" "}
                                                                    chars
                                                                </div>
                                                            )}
                                                            {postRequirements.title_text_max_length && (
                                                                <div>
                                                                    • Max title
                                                                    length:{" "}
                                                                    {
                                                                        postRequirements.title_text_max_length
                                                                    }{" "}
                                                                    chars
                                                                </div>
                                                            )}
                                                            {postRequirements.is_flair_required && (
                                                                <div>
                                                                    • Flair is
                                                                    required
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            {/* Subreddit Rules */}
                                            {loadingRules ? (
                                                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3">
                                                    <div className="animate-pulse">
                                                        <div className="h-4 bg-orange-200 dark:bg-orange-700 rounded w-1/3 mb-2"></div>
                                                        <div className="space-y-1">
                                                            <div className="h-3 bg-orange-200 dark:bg-orange-700 rounded w-full"></div>
                                                            <div className="h-3 bg-orange-200 dark:bg-orange-700 rounded w-3/4"></div>
                                                            <div className="h-3 bg-orange-200 dark:bg-orange-700 rounded w-5/6"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                rules.length > 0 && (
                                                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3">
                                                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center text-xs">
                                                            📜 Subreddit Rules
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {rules.map(
                                                                (
                                                                    rule,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="text-xs"
                                                                    >
                                                                        <div className="font-medium text-orange-800 dark:text-orange-200">
                                                                            {index +
                                                                                1}
                                                                            .{" "}
                                                                            {
                                                                                rule.short_name
                                                                            }
                                                                        </div>
                                                                        {rule.description && (
                                                                            <div className="text-orange-700 dark:text-orange-300 mt-1 pl-3">
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

                                            {/* No rules message */}
                                            {!loadingRules &&
                                                !loadingRequirements &&
                                                rules.length === 0 &&
                                                !postRequirements && (
                                                    <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 text-center">
                                                        <div className="text-neutral-600 dark:text-neutral-400 text-xs">
                                                            <p>
                                                                No specific
                                                                rules found
                                                            </p>
                                                            <p className="text-neutral-500 mt-1">
                                                                Follow general
                                                                Reddit
                                                                guidelines
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Spacer Column */}
                    <div className="hidden lg:block"></div>

                    {/* Right Column - AI Tools */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-neutral-950 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-800 sticky top-6 h-[85vh] flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    AI Tools
                                </h2>
                                {isGeneratingAI && (
                                    <div className="flex items-center text-sm text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#FF4500] border-t-transparent mr-2"></div>
                                        Generating...
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto min-h-0">
                                {isGeneratingAI ? (
                                    <div className="space-y-3">
                                        <div className="animate-pulse">
                                            <div className="h-4 bg-neutral-200 dark:bg-neutral-600 rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-neutral-200 dark:bg-neutral-600 rounded w-1/2 mb-2"></div>
                                            <div className="h-20 bg-neutral-200 dark:bg-neutral-600 rounded mb-3"></div>
                                            <div className="h-4 bg-neutral-200 dark:bg-neutral-600 rounded w-2/3"></div>
                                        </div>
                                        <p className="text-sm text-neutral-500 text-center">
                                            Generating AI optimization...
                                        </p>
                                    </div>
                                ) : user ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* AI Post Analyzer - Main Tool */}
                                        <button
                                            onClick={generateAIOptimizedPost}
                                            disabled={isGeneratingAI}
                                            className="flex items-center justify-between p-5 rounded-xl bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                                    <span className="text-xl">
                                                        🤖
                                                    </span>
                                                </div>
                                                <div className="text-left flex-1">
                                                    <div className="font-semibold text-sm">
                                                        AI Post Analyzer
                                                    </div>
                                                    <div className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                                                        Analyze your post and
                                                        tell you what's wrong
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {isGeneratingAI && (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                                                )}
                                            </div>
                                        </button>

                                        {/* Rule Checker */}
                                        <button
                                            onClick={async () => {
                                                if (
                                                    !title.trim() ||
                                                    !subreddit
                                                ) {
                                                    alert(
                                                        "Please enter a title and select a subreddit first",
                                                    );
                                                    return;
                                                }

                                                try {
                                                    const response =
                                                        await fetch(
                                                            "/api/check-rules",
                                                            {
                                                                method: "POST",
                                                                headers: {
                                                                    "Content-Type":
                                                                        "application/json",
                                                                },
                                                                body: JSON.stringify(
                                                                    {
                                                                        title,
                                                                        body,
                                                                        subreddit,
                                                                        flair,
                                                                    },
                                                                ),
                                                            },
                                                        );

                                                    const result =
                                                        await response.json();

                                                    if (
                                                        result.violations &&
                                                        result.violations
                                                            .length > 0
                                                    ) {
                                                        alert(
                                                            `Rule violations found:\n${result.violations.join("\n")}`,
                                                        );
                                                    } else {
                                                        alert(
                                                            "No rule violations detected! Your post looks good.",
                                                        );
                                                    }
                                                } catch (error) {
                                                    console.error(
                                                        "Error checking rules:",
                                                        error,
                                                    );
                                                    alert(
                                                        "Error checking rules. Please try again.",
                                                    );
                                                }
                                            }}
                                            className="flex items-center justify-between p-5 rounded-xl bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                                    <span className="text-xl">
                                                        🔍
                                                    </span>
                                                </div>
                                                <div className="text-left flex-1">
                                                    <div className="font-semibold text-sm">
                                                        Rule Checker
                                                    </div>
                                                    <div className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                                                        Verify your post follows
                                                        subreddit rules
                                                    </div>
                                                </div>
                                            </div>
                                        </button>

                                        {/* Find Better Subreddits */}
                                        <button
                                            onClick={async () => {
                                                if (
                                                    !title.trim() ||
                                                    !body.trim()
                                                ) {
                                                    alert(
                                                        "Please enter a title and body first",
                                                    );
                                                    return;
                                                }

                                                try {
                                                    const response =
                                                        await fetch(
                                                            "/api/find-subreddits",
                                                            {
                                                                method: "POST",
                                                                headers: {
                                                                    "Content-Type":
                                                                        "application/json",
                                                                },
                                                                body: JSON.stringify(
                                                                    {
                                                                        title,
                                                                        body,
                                                                        currentSubreddit:
                                                                            subreddit,
                                                                    },
                                                                ),
                                                            },
                                                        );

                                                    const result =
                                                        await response.json();

                                                    if (
                                                        result.alternatives &&
                                                        result.alternatives
                                                            .length > 0
                                                    ) {
                                                        const subredditList =
                                                            result.alternatives
                                                                .map(
                                                                    (
                                                                        sub: any,
                                                                    ) =>
                                                                        `r/${sub.name} (${sub.subscribers.toLocaleString()} members)`,
                                                                )
                                                                .join("\n");
                                                        alert(
                                                            `Better subreddits for your post:\n\n${subredditList}`,
                                                        );
                                                    } else {
                                                        alert(
                                                            "No better subreddits found. Your current choice might be optimal.",
                                                        );
                                                    }
                                                } catch (error) {
                                                    console.error(
                                                        "Error finding subreddits:",
                                                        error,
                                                    );
                                                    alert(
                                                        "Error finding subreddits. Please try again.",
                                                    );
                                                }
                                            }}
                                            className="flex items-center justify-between p-5 rounded-xl bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                                    <span className="text-xl">
                                                        🧭
                                                    </span>
                                                </div>
                                                <div className="text-left flex-1">
                                                    <div className="font-semibold text-sm">
                                                        Find Better Subreddits
                                                    </div>
                                                    <div className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                                                        Discover where your post
                                                        would work better
                                                    </div>
                                                </div>
                                            </div>
                                        </button>

                                        {/* Anomaly Detection */}
                                        <button
                                            onClick={async () => {
                                                if (
                                                    !title.trim() ||
                                                    !body.trim()
                                                ) {
                                                    alert(
                                                        "Please enter a title and body first",
                                                    );
                                                    return;
                                                }

                                                try {
                                                    const response =
                                                        await fetch(
                                                            "/api/detect-anomalies",
                                                            {
                                                                method: "POST",
                                                                headers: {
                                                                    "Content-Type":
                                                                        "application/json",
                                                                },
                                                                body: JSON.stringify(
                                                                    {
                                                                        title,
                                                                        body,
                                                                        subreddit,
                                                                    },
                                                                ),
                                                            },
                                                        );

                                                    const result =
                                                        await response.json();

                                                    if (
                                                        result.anomalies &&
                                                        result.anomalies
                                                            .length > 0
                                                    ) {
                                                        const anomalyList =
                                                            result.anomalies
                                                                .map(
                                                                    (
                                                                        anomaly: any,
                                                                    ) =>
                                                                        `• ${anomaly.type}: ${anomaly.description}`,
                                                                )
                                                                .join("\n");
                                                        alert(
                                                            `Potential issues detected:\n\n${anomalyList}\n\nConsider addressing these before posting.`,
                                                        );
                                                    } else {
                                                        alert(
                                                            "No anomalies detected! Your post looks clean and safe.",
                                                        );
                                                    }
                                                } catch (error) {
                                                    console.error(
                                                        "Error detecting anomalies:",
                                                        error,
                                                    );
                                                    alert(
                                                        "Error detecting anomalies. Please try again.",
                                                    );
                                                }
                                            }}
                                            className="flex items-center justify-between p-5 rounded-xl bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                                    <span className="text-xl">
                                                        ⚠️
                                                    </span>
                                                </div>
                                                <div className="text-left flex-1">
                                                    <div className="font-semibold text-sm">
                                                        Anomaly Detection
                                                    </div>
                                                    <div className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                                                        Detect potential issues
                                                        that could cause bans
                                                    </div>
                                                </div>
                                            </div>
                                        </button>

                                        {/* Smart Flair Suggestions */}
                                        <button
                                            onClick={async () => {
                                                if (
                                                    !title.trim() ||
                                                    !body.trim() ||
                                                    !subreddit
                                                ) {
                                                    alert(
                                                        "Please enter a title, body, and select a subreddit first",
                                                    );
                                                    return;
                                                }

                                                try {
                                                    const response =
                                                        await fetch(
                                                            "/api/suggest-flairs",
                                                            {
                                                                method: "POST",
                                                                headers: {
                                                                    "Content-Type":
                                                                        "application/json",
                                                                },
                                                                body: JSON.stringify(
                                                                    {
                                                                        title,
                                                                        body,
                                                                        subreddit,
                                                                    },
                                                                ),
                                                            },
                                                        );

                                                    const result =
                                                        await response.json();

                                                    if (
                                                        result.suggestions &&
                                                        result.suggestions
                                                            .length > 0
                                                    ) {
                                                        const flairList =
                                                            result.suggestions
                                                                .map(
                                                                    (
                                                                        flair: any,
                                                                        index: number,
                                                                    ) =>
                                                                        `${index + 1}. ${flair.text} (${flair.confidence}% match)`,
                                                                )
                                                                .join("\n");
                                                        alert(
                                                            `Recommended flairs for r/${subreddit}:\n\n${flairList}\n\nSelect the most appropriate one for your post.`,
                                                        );
                                                    } else {
                                                        alert(
                                                            "No specific flair recommendations. Your post might not need a flair for this subreddit.",
                                                        );
                                                    }
                                                } catch (error) {
                                                    console.error(
                                                        "Error suggesting flairs:",
                                                        error,
                                                    );
                                                    alert(
                                                        "Error suggesting flairs. Please try again.",
                                                    );
                                                }
                                            }}
                                            className="flex items-center justify-between p-5 rounded-xl bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                                    <span className="text-xl">
                                                        🏷️
                                                    </span>
                                                </div>
                                                <div className="text-left flex-1">
                                                    <div className="font-semibold text-sm">
                                                        Smart Flair Suggestions
                                                    </div>
                                                    <div className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                                                        Get AI-recommended flair
                                                        for your post
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-neutral-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-base text-neutral-600 dark:text-neutral-400 mb-6">
                                            Sign in to use AI tools
                                        </p>
                                        <button
                                            onClick={() =>
                                                setShowLoginModal(true)
                                            }
                                            className="px-6 py-3 bg-[#FF4500] text-white rounded-xl hover:bg-[#e03d00] transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl"
                                        >
                                            Sign In
                                        </button>
                                    </div>
                                )}

                                {/* Show AI Output when available */}
                                {aiOutput &&
                                    !(() => {
                                        const violationMatch = aiOutput.match(
                                            /\*\*VIOLATION_DETECTED:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*VIOLATION_REASON|\n\s*\*\*|$)/i,
                                        );
                                        return (
                                            violationMatch &&
                                            violationMatch[1]
                                                ?.trim()
                                                .toUpperCase() === "YES"
                                        );
                                    })() && (
                                        <div className="mt-6 space-y-4">
                                            {/* Optimized Content Display */}
                                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 space-y-4">
                                                <div className="flex items-center mb-3">
                                                    <svg
                                                        className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                                                        Optimized Content
                                                    </h3>
                                                </div>

                                                {optimizedTitle &&
                                                    optimizedTitle !==
                                                        "Cannot optimize - rule violations detected" && (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <label className="text-xs font-medium text-green-800 dark:text-green-200">
                                                                    Optimized
                                                                    Title
                                                                </label>
                                                                <button
                                                                    onClick={() =>
                                                                        copyToClipboard(
                                                                            optimizedTitle,
                                                                            "Title",
                                                                        )
                                                                    }
                                                                    className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                                                                    title="Copy to clipboard"
                                                                >
                                                                    <svg
                                                                        className="w-4 h-4"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    optimizedTitle
                                                                }
                                                                readOnly
                                                                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-green-300 dark:border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                                            />
                                                        </div>
                                                    )}

                                                {optimizedBody &&
                                                    optimizedBody !==
                                                        "Cannot optimize - rule violations detected" && (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <label className="text-xs font-medium text-green-800 dark:text-green-200">
                                                                    Optimized
                                                                    Body
                                                                </label>
                                                                <button
                                                                    onClick={() =>
                                                                        copyToClipboard(
                                                                            optimizedBody,
                                                                            "Body",
                                                                        )
                                                                    }
                                                                    className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                                                                    title="Copy to clipboard"
                                                                >
                                                                    <svg
                                                                        className="w-4 h-4"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                            <textarea
                                                                value={
                                                                    optimizedBody
                                                                }
                                                                readOnly
                                                                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-green-300 dark:border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px] resize-vertical"
                                                            />
                                                        </div>
                                                    )}

                                                {optimizedFlair &&
                                                    optimizedFlair !==
                                                        "Cannot optimize - rule violations detected" && (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <label className="text-xs font-medium text-green-800 dark:text-green-200">
                                                                    Recommended
                                                                    Flair
                                                                </label>
                                                                <button
                                                                    onClick={() =>
                                                                        copyToClipboard(
                                                                            optimizedFlair,
                                                                            "Flair",
                                                                        )
                                                                    }
                                                                    className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                                                                    title="Copy to clipboard"
                                                                >
                                                                    <svg
                                                                        className="w-4 h-4"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    optimizedFlair
                                                                }
                                                                readOnly
                                                                className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-green-300 dark:border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                                            />
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    )}

                                {/* Show violation warnings when available */}
                                {(showViabilityWarning &&
                                    postViability &&
                                    !postViability.analysis.canPost) ||
                                (aiOutput &&
                                    aiOutput.includes("VIOLATION_DETECTED:") &&
                                    (() => {
                                        const violationMatch = aiOutput.match(
                                            /\*\*VIOLATION_DETECTED:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*VIOLATION_REASON|\n\s*\*\*|$)/i,
                                        );
                                        return (
                                            violationMatch &&
                                            violationMatch[1]
                                                ?.trim()
                                                .toUpperCase() === "YES"
                                        );
                                    })()) ? (
                                    <div className="space-y-4">
                                        {/* Strict Rules Warning Display */}
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 space-y-4">
                                            <div className="flex items-center mb-3">
                                                <svg
                                                    className="w-5 h-5 text-red-600 dark:text-red-400 mr-2"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                                                    Post May Violate Rules
                                                </h3>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-sm text-red-700 dark:text-red-300">
                                                    {postViability?.message ||
                                                        (aiOutput &&
                                                        aiOutput.includes(
                                                            "VIOLATION_REASON:",
                                                        )
                                                            ? (() => {
                                                                  const reasonMatch =
                                                                      aiOutput.match(
                                                                          /\*\*VIOLATION_REASON:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*VIOLATION_SUGGESTIONS|\n\s*\*\*|$)/i,
                                                                      );
                                                                  return reasonMatch
                                                                      ? reasonMatch[1].trim()
                                                                      : "Rule violations detected";
                                                              })()
                                                            : "Rule violations detected")}
                                                </p>

                                                <div>
                                                    <h4 className="font-medium text-sm text-red-800 dark:text-red-200 mb-2">
                                                        Conflicting Rules:
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {/* Show API-detected conflicting rules */}
                                                        {(
                                                            postViability
                                                                ?.analysis
                                                                ?.conflictingRules ||
                                                            []
                                                        ).map((rule, index) => (
                                                            <span
                                                                key={index}
                                                                className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-medium"
                                                            >
                                                                {rule}
                                                            </span>
                                                        ))}

                                                        {/* Show AI-detected violations */}
                                                        {aiOutput &&
                                                            aiOutput.includes(
                                                                "VIOLATION_REASON:",
                                                            ) &&
                                                            (() => {
                                                                const reasonMatch =
                                                                    aiOutput.match(
                                                                        /\*\*VIOLATION_REASON:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*VIOLATION_SUGGESTIONS|\n\s*\*\*|$)/i,
                                                                    );
                                                                if (
                                                                    reasonMatch &&
                                                                    reasonMatch[1].trim() !==
                                                                        "No violations detected"
                                                                ) {
                                                                    return (
                                                                        <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                                                                            AI
                                                                            Detected
                                                                            Violation
                                                                        </span>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                    </div>
                                                </div>

                                                {(
                                                    postViability?.analysis
                                                        ?.suggestions || []
                                                ).length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-sm text-red-800 dark:text-red-200 mb-2">
                                                            Suggestions:
                                                        </h4>
                                                        <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                                                            {(
                                                                postViability
                                                                    ?.analysis
                                                                    ?.suggestions ||
                                                                []
                                                            ).map(
                                                                (
                                                                    suggestion,
                                                                    index,
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        {
                                                                            suggestion
                                                                        }
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* AI-Generated Violation Suggestions */}
                                                {aiOutput &&
                                                    aiOutput.includes(
                                                        "VIOLATION_SUGGESTIONS:",
                                                    ) && (
                                                        <div>
                                                            <h4 className="font-medium text-sm text-red-800 dark:text-red-200 mb-2">
                                                                AI Suggestions
                                                                to Fix
                                                                Violations:
                                                            </h4>
                                                            <div className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-700">
                                                                {(() => {
                                                                    const suggestionsMatch =
                                                                        aiOutput.match(
                                                                            /\*\*VIOLATION_SUGGESTIONS:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*ALTERNATIVE_SUBREDDITS|\n\s*\*\*|$)/i,
                                                                        );
                                                                    return suggestionsMatch
                                                                        ? suggestionsMatch[1].trim()
                                                                        : "No specific suggestions available";
                                                                })()}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        {/* Alternative Subreddits */}
                                        {(() => {
                                            // Check if we should show API alternatives
                                            const shouldShowAPIAlternatives =
                                                Boolean(
                                                    showAlternatives &&
                                                        alternativeSubreddits,
                                                );

                                            // Check if we should show AI alternatives
                                            const shouldShowAIAlternatives =
                                                Boolean(
                                                    aiOutput &&
                                                        aiOutput.includes(
                                                            "ALTERNATIVE_SUBREDDITS:",
                                                        ) &&
                                                        (() => {
                                                            const alternativesMatch =
                                                                aiOutput.match(
                                                                    /\*\*ALTERNATIVE_SUBREDDITS:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*OPTIMIZED_TITLE|\n\s*\*\*|$)/i,
                                                                );
                                                            return (
                                                                alternativesMatch &&
                                                                alternativesMatch[1]?.trim() !==
                                                                    "No alternatives needed"
                                                            );
                                                        })(),
                                                );

                                            // If either condition is true, show the alternatives section
                                            if (
                                                shouldShowAPIAlternatives ||
                                                shouldShowAIAlternatives
                                            ) {
                                                return (
                                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 space-y-4">
                                                        <div className="flex items-center mb-3">
                                                            <svg
                                                                className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                                                                Alternative
                                                                Subreddits
                                                            </h3>
                                                        </div>

                                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                            {alternativeSubreddits?.message ||
                                                                "Alternative subreddits suggested by AI"}
                                                        </p>

                                                        <div className="space-y-3">
                                                            {/* Show API-generated alternatives if available */}
                                                            {(
                                                                alternativeSubreddits?.alternatives ||
                                                                []
                                                            ).map(
                                                                (
                                                                    alt,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="bg-white dark:bg-neutral-800 border border-yellow-300 dark:border-yellow-600 rounded-lg p-3"
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex-1">
                                                                                <a
                                                                                    href={
                                                                                        alt.url
                                                                                    }
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="font-medium text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                                >
                                                                                    r/
                                                                                    {
                                                                                        alt.display_name
                                                                                    }
                                                                                </a>
                                                                                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 line-clamp-2">
                                                                                    {
                                                                                        alt.public_description
                                                                                    }
                                                                                </p>
                                                                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                                                                    {
                                                                                        alt.reason
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSubreddit(
                                                                                        alt.display_name,
                                                                                    );
                                                                                    setSearchQuery(
                                                                                        alt.display_name,
                                                                                    );
                                                                                    setShowAlternatives(
                                                                                        false,
                                                                                    );
                                                                                    setShowViabilityWarning(
                                                                                        false,
                                                                                    );
                                                                                    handleSubredditChange(
                                                                                        alt.display_name,
                                                                                    );
                                                                                }}
                                                                                className="ml-3 bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700 transition-colors"
                                                                            >
                                                                                Use
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}

                                                            {/* Show AI-generated alternatives */}
                                                            {aiOutput &&
                                                                aiOutput.includes(
                                                                    "ALTERNATIVE_SUBREDDITS:",
                                                                ) &&
                                                                (() => {
                                                                    const alternativesMatch =
                                                                        aiOutput.match(
                                                                            /\*\*ALTERNATIVE_SUBREDDITS:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*OPTIMIZED_TITLE|\n\s*\*\*|$)/i,
                                                                        );

                                                                    if (
                                                                        alternativesMatch
                                                                    ) {
                                                                        const alternativesText =
                                                                            alternativesMatch[1].trim();

                                                                        if (
                                                                            alternativesText !==
                                                                            "No alternatives needed"
                                                                        ) {
                                                                            const alternatives =
                                                                                alternativesText
                                                                                    .split(
                                                                                        ";",
                                                                                    )
                                                                                    .map(
                                                                                        (
                                                                                            alt,
                                                                                        ) =>
                                                                                            alt.trim(),
                                                                                    )
                                                                                    .filter(
                                                                                        (
                                                                                            alt,
                                                                                        ) =>
                                                                                            alt,
                                                                                    );

                                                                            return alternatives
                                                                                .map(
                                                                                    (
                                                                                        alt,
                                                                                        index,
                                                                                    ) => {
                                                                                        const match =
                                                                                            alt.match(
                                                                                                /r\/([^\s-]+)\s*-\s*(.+)/,
                                                                                            );

                                                                                        if (
                                                                                            match
                                                                                        ) {
                                                                                            const subredditName =
                                                                                                match[1].trim();
                                                                                            return (
                                                                                                <AISubredditCard
                                                                                                    key={`ai-${index}`}
                                                                                                    subredditName={
                                                                                                        subredditName
                                                                                                    }
                                                                                                    reason={match[2].trim()}
                                                                                                    onUse={() => {
                                                                                                        setSubreddit(
                                                                                                            subredditName,
                                                                                                        );
                                                                                                        setSearchQuery(
                                                                                                            subredditName,
                                                                                                        );
                                                                                                        setShowAlternatives(
                                                                                                            false,
                                                                                                        );
                                                                                                        setShowViabilityWarning(
                                                                                                            false,
                                                                                                        );
                                                                                                        handleSubredditChange(
                                                                                                            subredditName,
                                                                                                        );
                                                                                                    }}
                                                                                                />
                                                                                            );
                                                                                        }
                                                                                        return null;
                                                                                    },
                                                                                )
                                                                                .filter(
                                                                                    Boolean,
                                                                                );
                                                                        }
                                                                    }
                                                                    return null;
                                                                })()}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                ) : aiOutput &&
                                  !(() => {
                                      const violationMatch = aiOutput.match(
                                          /\*\*VIOLATION_DETECTED:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*VIOLATION_REASON|\n\s*\*\*|$)/i,
                                      );
                                      return (
                                          violationMatch &&
                                          violationMatch[1]
                                              ?.trim()
                                              .toUpperCase() === "YES"
                                      );
                                  })() ? (
                                    <div className="space-y-4">
                                        {/* Raw AI Output (hidden by default, can be toggled) */}
                                        <details className="group">
                                            <summary className="cursor-pointer text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                                                View Raw AI Output
                                            </summary>
                                            <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded text-xs text-neutral-600 dark:text-neutral-400 max-h-40 overflow-y-auto">
                                                <pre className="whitespace-pre-wrap">
                                                    {aiOutput}
                                                </pre>
                                            </div>
                                        </details>

                                        {/* Optimized Content Display */}
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 space-y-4">
                                            <div className="flex items-center mb-3">
                                                <svg
                                                    className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                                                    Optimized Content
                                                </h3>
                                            </div>

                                            {optimizedTitle &&
                                                optimizedTitle !==
                                                    "Cannot optimize - rule violations detected" && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <label className="text-xs font-medium text-green-800 dark:text-green-200">
                                                                Optimized Title
                                                            </label>
                                                            <button
                                                                onClick={() =>
                                                                    copyToClipboard(
                                                                        optimizedTitle,
                                                                        "Title",
                                                                    )
                                                                }
                                                                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                                                                title="Copy to clipboard"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={
                                                                optimizedTitle
                                                            }
                                                            readOnly
                                                            className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-green-300 dark:border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </div>
                                                )}

                                            {optimizedBody &&
                                                optimizedBody !==
                                                    "Cannot optimize - rule violations detected" && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <label className="text-xs font-medium text-green-800 dark:text-green-200">
                                                                Optimized Body
                                                            </label>
                                                            <button
                                                                onClick={() =>
                                                                    copyToClipboard(
                                                                        optimizedBody,
                                                                        "Body",
                                                                    )
                                                                }
                                                                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                                                                title="Copy to clipboard"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            value={
                                                                optimizedBody
                                                            }
                                                            readOnly
                                                            className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-green-300 dark:border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px] resize-vertical"
                                                        />
                                                    </div>
                                                )}

                                            {optimizedFlair &&
                                                optimizedFlair !==
                                                    "Cannot optimize - rule violations detected" && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <label className="text-xs font-medium text-green-800 dark:text-green-200">
                                                                Recommended
                                                                Flair
                                                            </label>
                                                            <button
                                                                onClick={() =>
                                                                    copyToClipboard(
                                                                        optimizedFlair,
                                                                        "Flair",
                                                                    )
                                                                }
                                                                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                                                                title="Copy to clipboard"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={
                                                                optimizedFlair
                                                            }
                                                            readOnly
                                                            className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-green-300 dark:border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </div>
                                                )}

                                            {/* Complete Optimization Summary Dropdown */}
                                            <div className="border-t border-green-300 dark:border-green-600 pt-3">
                                                <button
                                                    onClick={() =>
                                                        setShowOptimizationSummary(
                                                            !showOptimizationSummary,
                                                        )
                                                    }
                                                    className="flex items-center justify-between w-full p-2 bg-green-100 dark:bg-green-800/50 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/70 transition-colors"
                                                >
                                                    <div className="flex items-center">
                                                        <svg
                                                            className="w-4 h-4 text-green-700 dark:text-green-300 mr-2"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                                            Complete
                                                            Optimization Summary
                                                        </span>
                                                    </div>
                                                    <svg
                                                        className={`w-4 h-4 text-green-700 dark:text-green-300 transition-transform ${
                                                            showOptimizationSummary
                                                                ? "rotate-180"
                                                                : ""
                                                        }`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>

                                                {showOptimizationSummary && (
                                                    <div className="mt-3 p-4 bg-neutral-900 text-white text-xs rounded-lg max-h-80 overflow-y-auto">
                                                        <div className="font-semibold mb-3 text-sm text-blue-300">
                                                            📝 Complete
                                                            Optimization Summary
                                                        </div>

                                                        <div className="space-y-4 pb-4">
                                                            {titleReasoning && (
                                                                <div>
                                                                    <div className="font-medium text-green-300 mb-2">
                                                                        ✓ Title
                                                                        Optimization:
                                                                    </div>
                                                                    <div className="text-gray-200 pl-2 leading-relaxed">
                                                                        {
                                                                            titleReasoning
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {bodyReasoning && (
                                                                <div>
                                                                    <div className="font-medium text-green-300 mb-2">
                                                                        ✓ Body
                                                                        Optimization:
                                                                    </div>
                                                                    <div className="text-gray-200 pl-2 leading-relaxed">
                                                                        {
                                                                            bodyReasoning
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {flairReasoning && (
                                                                <div>
                                                                    <div className="font-medium text-green-300 mb-2">
                                                                        ✓ Flair
                                                                        Selection:
                                                                    </div>
                                                                    <div className="text-gray-200 pl-2 leading-relaxed">
                                                                        {
                                                                            flairReasoning
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="border-t border-gray-600 pt-3 mt-4">
                                                                <div className="font-medium text-blue-300 mb-2">
                                                                    🎯 Key
                                                                    Enhancements:
                                                                </div>
                                                                <div className="space-y-1 text-gray-300">
                                                                    <div>
                                                                        •
                                                                        Keyword
                                                                        optimization
                                                                    </div>
                                                                    <div>
                                                                        •
                                                                        Community
                                                                        tone
                                                                        matching
                                                                    </div>
                                                                    <div>
                                                                        •
                                                                        Engagement
                                                                        triggers
                                                                    </div>
                                                                    <div>
                                                                        • Rule
                                                                        compliance
                                                                    </div>
                                                                    <div>
                                                                        • Clear
                                                                        context
                                                                        integration
                                                                    </div>
                                                                    <div>
                                                                        •
                                                                        Response
                                                                        encouragement
                                                                        tactics
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Show message when no optimized content due to violations */}
                                        {aiOutput &&
                                            (() => {
                                                const violationMatch =
                                                    aiOutput.match(
                                                        /\*\*VIOLATION_DETECTED:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*VIOLATION_REASON|\n\s*\*\*|$)/i,
                                                    );
                                                return (
                                                    violationMatch &&
                                                    violationMatch[1]
                                                        ?.trim()
                                                        .toUpperCase() === "YES"
                                                );
                                            })() && (
                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                                                    <div className="flex items-center">
                                                        <svg
                                                            className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                            Optimization skipped
                                                            due to rule
                                                            violations. Please
                                                            review the
                                                            suggestions above
                                                            and fix the
                                                            violations before
                                                            optimizing.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </div>

                            {/* Regenerate Button - Always visible at bottom */}
                            {aiOutput && !showViabilityWarning && (
                                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 mt-auto">
                                    <button
                                        onClick={generateAIOptimizedPost}
                                        disabled={isGeneratingAI}
                                        className="w-full py-3 px-4 bg-gradient-to-r from-[#FF4500] to-orange-600 hover:from-[#e03d00] hover:to-orange-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        Regenerate Optimization
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing functionality has been removed */}

            {/* Login Modal */}
            <AnimatePresence>
                {showLoginModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowLoginModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-lg w-full border border-neutral-200 dark:border-neutral-700 shadow-xl"
                            onClick={(e: React.MouseEvent) =>
                                e.stopPropagation()
                            }
                        >
                            <div className="text-center">
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-[#FF4500] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg
                                            className="w-8 h-8 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                        Sign In Required
                                    </h3>
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        Please sign in to create and optimize
                                        your Reddit posts
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <SignInButton mode="modal">
                                        <button className="w-full py-3 px-4 bg-[#FF4500] text-white rounded-lg hover:bg-[#e03d00] transition-colors font-medium">
                                            Sign In with Clerk
                                        </button>
                                    </SignInButton>

                                    <button
                                        onClick={() => setShowLoginModal(false)}
                                        className="w-full py-3 px-4 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Dynamic wrapper to avoid SSR issues
const DynamicAppPageContent = dynamic(() => Promise.resolve(AppPageContent), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
    ),
});

export default function AppPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return <DynamicAppPageContent />;
}
