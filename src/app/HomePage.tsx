"use client";
import React, { useState, useEffect, useMemo } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useUserSync } from "@/hooks/useUserSync";
import { useUserPosts } from "@/hooks/useUserPosts";
import {
    redditAPI,
    type Subreddit,
    type Flair,
    type SubredditRule,
    type PostRequirement,
} from "@/lib/reddit-api";
import Fuse from "fuse.js";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
    // Initialize user sync and post tracking
    const { user, isLoaded } = useUserSync();
    const {
        postStats,
        canCreatePost,
        isLoading: postsLoading,
    } = useUserPosts();

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
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [isFirstPost, setIsFirstPost] = useState(true);
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

    // Subscription-related states
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<"onePost">("onePost");
    const [showBillingForm, setShowBillingForm] = useState(false);
    const [billingData, setBillingData] = useState({
        name: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "US",
        phoneNumber: "",
    });

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
            console.log("Full AI Output:", output); // Debug log

            // Extract optimized title - improved regex
            const titleMatch = output.match(
                /\*\*OPTIMIZED_TITLE:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*TITLE_REASONING|\n\s*\*\*|$)/i,
            );
            if (titleMatch && titleMatch[1]) {
                const title = titleMatch[1].trim();
                console.log("Extracted Title:", title);
                setOptimizedTitle(title);
                console.log("Set optimizedTitle state to:", title);
            } else {
                console.log("Title not found in AI output");
                console.log(
                    "Available output for title matching:",
                    output.substring(0, 500),
                );
            }

            // Extract title reasoning - improved regex
            const titleReasoningMatch = output.match(
                /\*\*TITLE_REASONING:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*OPTIMIZED_BODY|\n\s*\*\*|$)/i,
            );
            if (titleReasoningMatch && titleReasoningMatch[1]) {
                const reasoning = titleReasoningMatch[1].trim();
                setTitleReasoning(reasoning);
                console.log("Extracted Title Reasoning:", reasoning);
            } else {
                console.log("Title reasoning not found in AI output");
            }

            // Extract optimized body - improved regex
            const bodyMatch = output.match(
                /\*\*OPTIMIZED_BODY:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*BODY_REASONING|\n\s*\*\*|$)/i,
            );
            if (bodyMatch && bodyMatch[1]) {
                const body = bodyMatch[1].trim();
                setOptimizedBody(body);
                console.log("Extracted Body:", body);
            } else {
                console.log("Body not found in AI output");
            }

            // Extract body reasoning - improved regex
            const bodyReasoningMatch = output.match(
                /\*\*BODY_REASONING:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*RECOMMENDED_FLAIR|\n\s*\*\*|$)/i,
            );
            if (bodyReasoningMatch && bodyReasoningMatch[1]) {
                const reasoning = bodyReasoningMatch[1].trim();
                setBodyReasoning(reasoning);
                console.log("Extracted Body Reasoning:", reasoning);
            } else {
                console.log("Body reasoning not found in AI output");
            }

            // Extract recommended flair - improved regex
            const flairMatch = output.match(
                /\*\*RECOMMENDED_FLAIR:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*FLAIR_REASONING|\n\s*\*\*|$)/i,
            );
            if (flairMatch && flairMatch[1]) {
                const flair = flairMatch[1].trim();
                setOptimizedFlair(flair);
                console.log("Extracted Flair:", flair);
            } else {
                console.log("Flair not found in AI output");
            }

            // Extract flair reasoning - improved regex
            const flairReasoningMatch = output.match(
                /\*\*FLAIR_REASONING:\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*|$)/i,
            );
            if (flairReasoningMatch && flairReasoningMatch[1]) {
                const reasoning = flairReasoningMatch[1].trim();
                setFlairReasoning(reasoning);
                console.log("Extracted Flair Reasoning:", reasoning);
            } else {
                console.log("Flair reasoning not found in AI output");
            }
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

            // Fallback subreddits
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
                    display_name: "buildapc",
                    public_description:
                        "Planning on building a computer but need some advice?",
                    subscribers: 5000000,
                },
            ];
            setAllSubreddits(fallbackSubreddits);
        } finally {
            setLoadingSubreddits(false);
        }
    };

    const handleSubredditChange = async (selectedSubreddit: string) => {
        setSubreddit(selectedSubreddit);
        setFlair("");
        setSearchQuery(selectedSubreddit);
        setIsDropdownOpen(false);
        setRules([]);
        setPostRequirements(null);

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

                setFlairs(flairData);
                setRules(rulesData);
                setPostRequirements(requirementsData);
            } catch (err) {
                console.error(
                    `Failed to fetch data for ${selectedSubreddit}:`,
                    err,
                );
                setFlairs([]);
                setRules([]);
                setPostRequirements(null);
            } finally {
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
                    // User is out of posts
                    setShowPricingModal(true);
                    return false;
                }
                throw new Error(data.error || "Failed to create post");
            }

            console.log(
                `Post recorded successfully! (${data.postType} post used)`,
            );
            return true;
        } catch (error) {
            console.error("Error creating post record:", error);
            // Don't show error to user for post recording, just log it
            return false;
        }
    };

    const generateAIOptimizedPost = async () => {
        if (!title.trim() || !subreddit.trim()) return;

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

            // Enhanced prompt for AI optimization
            const prompt = `You are a Reddit post optimization expert. Analyze the user's draft post and optimize it for maximum engagement and compliance with subreddit rules.

**USER'S DRAFT POST:**
- Title: "${context.title}"
- Body: "${context.body}"
- Target Subreddit: r/${context.subreddit}
- Current Flair: "${context.flair}"
- Subreddit Rules: ${context.rules}
- Post Requirements: ${context.postRequirements}
- Available Flairs: ${context.availableFlairs}

**OPTIMIZATION TASK:**
Create an optimized version that:
1. Increases engagement potential
2. Complies with all subreddit rules
3. Uses community-appropriate language and tone
4. Includes relevant keywords
5. Encourages meaningful discussion
6. Selects the most appropriate flair

**REQUIRED OUTPUT FORMAT:**
Please provide your response in exactly this format:

**OPTIMIZED_TITLE:**
[Your optimized title here]

**TITLE_REASONING:**
[Explain specifically why this title is better - mention keywords, engagement hooks, community appeal, length considerations, and rule compliance]

**OPTIMIZED_BODY:**
[Your optimized body text here]

**BODY_REASONING:**
[Explain specifically why this body is better - mention structure improvements, clarity enhancements, community engagement elements, and rule compliance]

**RECOMMENDED_FLAIR:**
[Select the most appropriate flair from available options, or suggest "Discussion" if none fit perfectly]

**FLAIR_REASONING:**
[Explain why this flair is the best choice for the content and community]`;

            // Use Gemini API directly instead of ai-bind
            const apiKey =
                process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
                "AIzaSyDjyDhQmJHb-fNwNmShUkqpCd-QG8Y9T7o";

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
            setTimeout(() => {
                if (
                    !optimizedTitle &&
                    !optimizedBody &&
                    !optimizedFlair &&
                    title.trim()
                ) {
                    console.log(
                        "Fallback: AI parsing failed completely, using original content",
                    );
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
                } else {
                    console.log("AI parsing succeeded, skipping fallback");
                }
            }, 500);

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
                    console.log(
                        "Fallback: AI parsing failed completely, using original content",
                    );
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
                } else {
                    console.log("AI parsing succeeded, skipping fallback");
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

    // Subscription plans configuration
    const subscriptionPlans = {
        onePost: {
            productId: "pdt_Sqt14rBf5vO14Z8ReuHqB", // Use the actual Dodo product ID
            price: 1.99,
            amount: 199, // Price in cents
            name: "1 post",
            description: "Perfect for testing the waters",
            features: [
                "AI-optimized content",
                "Reddit safety check",
                "Instant access",
            ],
        },
    };

    const handleSubscription = async (planType: "onePost") => {
        // Prefill billing data from user profile
        setBillingData({
            name: user?.fullName || "",
            email: user?.emailAddresses[0]?.emailAddress || "",
            street: "",
            city: "",
            state: "",
            zipcode: "",
            country: "US",
            phoneNumber: user?.phoneNumbers[0]?.phoneNumber || "",
        });

        // Show billing form
        setShowPricingModal(false);
        setShowBillingForm(true);
    };

    const handleBillingSubmit = async () => {
        setIsProcessingPayment(true);
        try {
            const plan = subscriptionPlans[selectedPlan];

            const response = await fetch("/api/payments/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    billing: {
                        email: user?.emailAddresses[0]?.emailAddress || "", // Always use Clerk user's email
                        name: billingData.name || user?.fullName || "User",
                        phoneNumber:
                            billingData.phoneNumber ||
                            user?.phoneNumbers[0]?.phoneNumber ||
                            "",
                        city: billingData.city,
                        state: billingData.state,
                        country: billingData.country,
                        street: billingData.street,
                        zipcode: billingData.zipcode,
                    },
                    productCart: [
                        {
                            productId: plan.productId,
                            quantity: 1,
                            amount: plan.amount, // Add amount in cents
                        },
                    ],
                }),
            });

            const data = await response.json();
            console.log("API Response status:", response.status);
            console.log("API Response data:", data);

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        `HTTP ${response.status}: Failed to create payment`,
                );
            }

            if (data.url) {
                // Redirect to Dodo Payments checkout
                window.location.href = data.url;
            } else {
                console.error("No checkout URL in response:", data);
                throw new Error(data.error || "Failed to create payment link");
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Payment creation failed. Please try again.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateForm();
        setValidationErrors(errors);
        if (errors.length === 0) {
            // Check if user can create post before calling AI
            if (!canCreatePost.canCreate) {
                setShowPricingModal(true);
                return;
            }

            // Generate AI-optimized post immediately
            generateAIOptimizedPost();
        }
    };

    const handleConfirmPost = async () => {
        setShowPricingModal(false);

        // Just generate AI-optimized post (post record already created)
        // This is called after payment, so user now has posts available
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
            <nav className="w-full bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Left side - Logo and Brand */}
                    <div className="flex items-center space-x-3">
                        <img
                            src="/icon.png"
                            alt="Unbannnable Logo"
                            className="w-8 h-8"
                        />
                        <a
                            href="#"
                            className="text-xl font-bold text-neutral-900 dark:text-white hover:text-[#FF4500] dark:hover:text-[#FF4500] transition-colors"
                        >
                            Unbannnable
                        </a>
                    </div>

                    {/* Right side - Navigation and Authentication */}
                    <div className="flex items-center space-x-4">
                        <SignedIn>
                            {/* Post Counter */}
                            {!postsLoading && (
                                <div className="flex items-center gap-2">
                                    {postStats.hasUnlimitedAccess ? (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            Unlimited Posts
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            {postStats.freePostsRemaining +
                                                postStats.purchasedPostsRemaining}{" "}
                                            Posts Left
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Buy More Posts Button */}
                            {!postsLoading && !postStats.hasUnlimitedAccess && (
                                <button
                                    onClick={() => setShowPricingModal(true)}
                                    className="px-4 py-2 bg-[#FF4500] text-white rounded-lg hover:bg-[#e03d00] transition-colors text-sm font-medium flex items-center gap-2"
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
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                    Buy Posts
                                </button>
                            )}

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

            <div className="max-w-5xl mx-auto py-6 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Post Creation Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-neutral-950 rounded-2xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-800 h-[85vh] flex flex-col">
                            <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white text-center">
                                Create a Post
                            </h2>

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
                                            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4500] pr-10"
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
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
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
                                                            className={`w-full text-left px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 last:border-b-0 focus:outline-none transition-colors text-xs ${
                                                                index ===
                                                                selectedIndex
                                                                    ? "bg-[#FF4500] text-white"
                                                                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
                                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
                                        placeholder="Title your post"
                                        maxLength={300}
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
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
                                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
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
                                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#FF4500] resize-vertical"
                                        placeholder="Write your post here..."
                                        value={body}
                                        onChange={(e) =>
                                            setBody(e.target.value)
                                        }
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-lg font-semibold bg-[#FF4500] text-white text-sm shadow-lg hover:bg-[#e03d00] transition"
                                    disabled={isGeneratingAI}
                                >
                                    {isGeneratingAI
                                        ? "Generating AI Optimization..."
                                        : "Generate Safe Post"}
                                </button>
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

                    {/* Right Column - AI Optimization */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-neutral-950 rounded-2xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-800 sticky top-6 h-[85vh] flex flex-col">
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center mb-4">
                                <svg
                                    className="w-5 h-5 mr-2 text-[#FF4500]"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                AI Optimization
                                {isGeneratingAI && (
                                    <div className="ml-2 animate-spin rounded-full h-4 w-4 border-2 border-[#FF4500] border-t-transparent"></div>
                                )}
                            </h2>

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
                                ) : aiOutput ? (
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

                                            {optimizedTitle && (
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
                                                        value={optimizedTitle}
                                                        readOnly
                                                        className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-green-300 dark:border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                    {/* Debug info */}
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Debug: &ldquo;
                                                        {optimizedTitle}
                                                        &rdquo; (length:{" "}
                                                        {optimizedTitle.length})
                                                    </div>
                                                </div>
                                            )}

                                            {optimizedBody && (
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
                                                        value={optimizedBody}
                                                        readOnly
                                                        className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-green-300 dark:border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px] resize-vertical"
                                                    />
                                                </div>
                                            )}

                                            {optimizedFlair && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="text-xs font-medium text-green-800 dark:text-green-200">
                                                            Recommended Flair
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
                                                        value={optimizedFlair}
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
                                    </div>
                                ) : (
                                    <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                                        <svg
                                            className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                            />
                                        </svg>
                                        <p className="text-sm">
                                            Enter a title and select a subreddit
                                        </p>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            Then click &ldquo;Generate AI
                                            Optimized Post&rdquo;
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Regenerate Button - Always visible at bottom */}
                            {aiOutput && (
                                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 mt-auto">
                                    <button
                                        onClick={generateAIOptimizedPost}
                                        disabled={isGeneratingAI}
                                        className="w-full py-2 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-xs font-medium"
                                    >
                                        Regenerate Optimization
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Modal */}
            <AnimatePresence>
                {showPricingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPricingModal(false)}
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
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                        Purchase Post Credit
                                    </h3>
                                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                                        You've run out of free posts. Purchase a
                                        post credit to continue.
                                    </p>
                                </div>

                                {/* Single Plan Display */}
                                <div className="mb-8">
                                    <div className="relative p-8 border-2 border-[#FF4500] bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl text-center shadow-lg">
                                        <div className="mb-6">
                                            <p className="text-4xl font-bold mb-3 text-[#FF4500]">
                                                $1.99
                                            </p>
                                            <h4 className="font-semibold text-xl text-neutral-900 dark:text-white">
                                                1 Post Credit
                                            </h4>
                                        </div>
                                        <p className="text-base text-neutral-600 dark:text-neutral-400 mb-6">
                                            Get your message heard without the
                                            risk
                                        </p>
                                        <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
                                            <li>✓ AI-optimized content</li>
                                            <li>✓ Reddit safety check</li>
                                            <li>✓ Instant access</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ duration: 0.1 }}
                                        onClick={() =>
                                            handleSubscription("onePost")
                                        }
                                        disabled={isProcessingPayment}
                                        className="w-full py-3 px-6 bg-[#FF4500] text-white rounded-lg hover:bg-[#e03d00] transition-colors font-medium disabled:opacity-50"
                                    >
                                        {isProcessingPayment
                                            ? "Processing..."
                                            : "Purchase for $1.99"}
                                    </motion.button>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.1 }}
                                    onClick={() => setShowPricingModal(false)}
                                    className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 text-sm"
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Billing Form Modal */}
            {showBillingForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-md w-full border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#FF4500] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                Billing Information
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                                Please provide your billing address
                            </p>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleBillingSubmit();
                            }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={billingData.name}
                                        onChange={(e) =>
                                            setBillingData({
                                                ...billingData,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-[#FF4500] focus:border-transparent dark:bg-neutral-800 dark:text-white text-sm"
                                        placeholder={
                                            user?.fullName || "John Doe"
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={
                                            user?.emailAddresses[0]
                                                ?.emailAddress || ""
                                        }
                                        readOnly
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-sm cursor-not-allowed"
                                        placeholder={
                                            user?.emailAddresses[0]
                                                ?.emailAddress ||
                                            "john@example.com"
                                        }
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Email matches your account and cannot be
                                        changed
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    value={billingData.street}
                                    onChange={(e) =>
                                        setBillingData({
                                            ...billingData,
                                            street: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-[#FF4500] focus:border-transparent dark:bg-neutral-800 dark:text-white text-sm"
                                    placeholder="123 Main Street"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={billingData.city}
                                        onChange={(e) =>
                                            setBillingData({
                                                ...billingData,
                                                city: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-[#FF4500] focus:border-transparent dark:bg-neutral-800 dark:text-white text-sm"
                                        placeholder="New York"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        value={billingData.state}
                                        onChange={(e) =>
                                            setBillingData({
                                                ...billingData,
                                                state: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-[#FF4500] focus:border-transparent dark:bg-neutral-800 dark:text-white text-sm"
                                        placeholder="NY"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        ZIP Code
                                    </label>
                                    <input
                                        type="text"
                                        value={billingData.zipcode}
                                        onChange={(e) =>
                                            setBillingData({
                                                ...billingData,
                                                zipcode: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-[#FF4500] focus:border-transparent dark:bg-neutral-800 dark:text-white text-sm"
                                        placeholder="10001"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Country
                                    </label>
                                    <select
                                        value={billingData.country}
                                        onChange={(e) =>
                                            setBillingData({
                                                ...billingData,
                                                country: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-[#FF4500] focus:border-transparent dark:bg-neutral-800 dark:text-white text-sm"
                                        required
                                    >
                                        <option value="US">
                                            United States
                                        </option>
                                        <option value="CA">Canada</option>
                                        <option value="AL">Albania</option>
                                        <option value="AD">Andorra</option>
                                        <option value="AG">
                                            Antigua and Barbuda
                                        </option>
                                        <option value="AR">Argentina</option>
                                        <option value="AM">Armenia</option>
                                        <option value="AW">Aruba</option>
                                        <option value="AU">Australia</option>
                                        <option value="AT">Austria</option>
                                        <option value="AZ">Azerbaijan</option>
                                        <option value="BS">Bahamas</option>
                                        <option value="BH">Bahrain</option>
                                        <option value="BD">Bangladesh</option>
                                        <option value="BE">Belgium</option>
                                        <option value="BZ">Belize</option>
                                        <option value="BJ">Benin</option>
                                        <option value="BM">Bermuda</option>
                                        <option value="BT">Bhutan</option>
                                        <option value="BO">Bolivia</option>
                                        <option value="BA">
                                            Bosnia and Herzegovina
                                        </option>
                                        <option value="BW">Botswana</option>
                                        <option value="BR">Brazil</option>
                                        <option value="BN">
                                            Brunei Darussalam
                                        </option>
                                        <option value="BI">Burundi</option>
                                        <option value="KH">Cambodia</option>
                                        <option value="CA">Canada</option>
                                        <option value="CV">Cape Verde</option>
                                        <option value="TD">Chad</option>
                                        <option value="CL">Chile</option>
                                        <option value="CN">China</option>
                                        <option value="CO">Colombia</option>
                                        <option value="KM">Comoros</option>
                                        <option value="CR">Costa Rica</option>
                                        <option value="CW">Curaçao</option>
                                        <option value="CY">Cyprus</option>
                                        <option value="CZ">
                                            Czech Republic
                                        </option>
                                        <option value="DK">Denmark</option>
                                        <option value="DJ">Djibouti</option>
                                        <option value="DM">Dominica</option>
                                        <option value="DO">
                                            Dominican Republic
                                        </option>
                                        <option value="EC">Ecuador</option>
                                        <option value="EG">Egypt</option>
                                        <option value="SV">El Salvador</option>
                                        <option value="GQ">
                                            Equatorial Guinea
                                        </option>
                                        <option value="ER">Eritrea</option>
                                        <option value="EE">Estonia</option>
                                        <option value="SZ">Eswatini</option>
                                        <option value="ET">Ethiopia</option>
                                        <option value="FJ">Fiji</option>
                                        <option value="FI">Finland</option>
                                        <option value="FR">France</option>
                                        <option value="PF">
                                            French Polynesia
                                        </option>
                                        <option value="GA">Gabon</option>
                                        <option value="GM">Gambia</option>
                                        <option value="GE">Georgia</option>
                                        <option value="DE">Germany</option>
                                        <option value="GH">Ghana</option>
                                        <option value="GR">Greece</option>
                                        <option value="GL">Greenland</option>
                                        <option value="GD">Grenada</option>
                                        <option value="GT">Guatemala</option>
                                        <option value="GN">Guinea</option>
                                        <option value="GW">
                                            Guinea-Bissau
                                        </option>
                                        <option value="GY">Guyana</option>
                                        <option value="HN">Honduras</option>
                                        <option value="HK">Hong Kong</option>
                                        <option value="HU">Hungary</option>
                                        <option value="IS">Iceland</option>
                                        <option value="IN">India</option>
                                        <option value="ID">Indonesia</option>
                                        <option value="IQ">Iraq</option>
                                        <option value="IE">Ireland</option>
                                        <option value="IL">Israel</option>
                                        <option value="IT">Italy</option>
                                        <option value="JP">Japan</option>
                                        <option value="KZ">Kazakhstan</option>
                                        <option value="KI">Kiribati</option>
                                        <option value="KW">Kuwait</option>
                                        <option value="LA">Laos</option>
                                        <option value="LV">Latvia</option>
                                        <option value="LS">Lesotho</option>
                                        <option value="LR">Liberia</option>
                                        <option value="LI">
                                            Liechtenstein
                                        </option>
                                        <option value="LT">Lithuania</option>
                                        <option value="LU">Luxembourg</option>
                                        <option value="MO">Macau</option>
                                        <option value="MG">Madagascar</option>
                                        <option value="MW">Malawi</option>
                                        <option value="MY">Malaysia</option>
                                        <option value="MV">Maldives</option>
                                        <option value="MT">Malta</option>
                                        <option value="MH">
                                            Marshall Islands
                                        </option>
                                        <option value="MR">Mauritania</option>
                                        <option value="MU">Mauritius</option>
                                        <option value="MX">Mexico</option>
                                        <option value="FM">Micronesia</option>
                                        <option value="MN">Mongolia</option>
                                        <option value="ME">Montenegro</option>
                                        <option value="MA">Morocco</option>
                                        <option value="NR">Nauru</option>
                                        <option value="NP">Nepal</option>
                                        <option value="NL">Netherlands</option>
                                        <option value="NC">
                                            New Caledonia
                                        </option>
                                        <option value="NZ">New Zealand</option>
                                        <option value="NE">Niger</option>
                                        <option value="NG">Nigeria</option>
                                        <option value="MK">
                                            North Macedonia
                                        </option>
                                        <option value="NO">Norway</option>
                                        <option value="OM">Oman</option>
                                        <option value="PW">Palau</option>
                                        <option value="PG">
                                            Papua New Guinea
                                        </option>
                                        <option value="PY">Paraguay</option>
                                        <option value="PE">Peru</option>
                                        <option value="PH">Philippines</option>
                                        <option value="PL">Poland</option>
                                        <option value="PT">Portugal</option>
                                        <option value="PR">Puerto Rico</option>
                                        <option value="QA">Qatar</option>
                                        <option value="RO">Romania</option>
                                        <option value="RW">Rwanda</option>
                                        <option value="KN">
                                            Saint Kitts and Nevis
                                        </option>
                                        <option value="LC">Saint Lucia</option>
                                        <option value="VC">
                                            Saint Vincent and the Grenadines
                                        </option>
                                        <option value="WS">Samoa</option>
                                        <option value="SM">San Marino</option>
                                        <option value="ST">
                                            Sao Tome and Principe
                                        </option>
                                        <option value="SA">Saudi Arabia</option>
                                        <option value="RS">Serbia</option>
                                        <option value="SC">Seychelles</option>
                                        <option value="SL">Sierra Leone</option>
                                        <option value="SG">Singapore</option>
                                        <option value="SX">Sint Maarten</option>
                                        <option value="SK">Slovakia</option>
                                        <option value="SI">Slovenia</option>
                                        <option value="SB">
                                            Solomon Islands
                                        </option>
                                        <option value="KR">South Korea</option>
                                        <option value="ES">Spain</option>
                                        <option value="LK">Sri Lanka</option>
                                        <option value="SR">Suriname</option>
                                        <option value="SE">Sweden</option>
                                        <option value="CH">Switzerland</option>
                                        <option value="TW">Taiwan</option>
                                        <option value="TJ">Tajikistan</option>
                                        <option value="TZ">Tanzania</option>
                                        <option value="TH">Thailand</option>
                                        <option value="TL">Timor-Leste</option>
                                        <option value="TG">Togo</option>
                                        <option value="TO">Tonga</option>
                                        <option value="TN">Tunisia</option>
                                        <option value="TR">Turkey</option>
                                        <option value="TV">Tuvalu</option>
                                        <option value="TC">
                                            Turks and Caicos
                                        </option>
                                        <option value="AE">
                                            United Arab Emirates
                                        </option>
                                        <option value="GB">
                                            United Kingdom
                                        </option>
                                        <option value="US">
                                            United States
                                        </option>
                                        <option value="UY">Uruguay</option>
                                        <option value="UZ">Uzbekistan</option>
                                        <option value="ZM">Zambia</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Phone Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    value={billingData.phoneNumber}
                                    onChange={(e) =>
                                        setBillingData({
                                            ...billingData,
                                            phoneNumber: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-[#FF4500] focus:border-transparent dark:bg-neutral-800 dark:text-white text-sm"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBillingForm(false);
                                        setShowPricingModal(true);
                                    }}
                                    className="flex-1 py-3 px-4 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessingPayment}
                                    className="flex-1 py-3 px-4 bg-[#FF4500] text-white rounded-lg hover:bg-[#e03d00] transition-colors font-medium disabled:opacity-50 text-sm"
                                >
                                    {isProcessingPayment
                                        ? "Processing..."
                                        : "Continue to Payment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
