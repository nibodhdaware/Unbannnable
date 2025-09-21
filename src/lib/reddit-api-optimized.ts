import { NextRequest } from "next/server";

interface RedditTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface Subreddit {
    display_name: string;
    public_description: string;
    subscribers: number;
    id: string;
}

interface Flair {
    id: string;
    text: string;
    css_class: string;
    text_color: string;
    background_color: string;
}

interface SubredditRule {
    kind: string;
    short_name: string;
    description: string;
    description_html: string;
    created_utc: number;
    priority: number;
    violation_reason: string;
}

interface PostRequirement {
    title_required: boolean;
    title_text_max_length: number;
    title_text_min_length: number;
    body_restriction_policy: string;
    domain_blacklist: string[];
    domain_whitelist: string[];
    body_blacklisted_strings: string[];
    body_required_strings: string[];
    title_blacklisted_strings: string[];
    title_required_strings: string[];
    is_flair_required: boolean;
}

interface AlternativeSubreddit {
    display_name: string;
    public_description: string;
    subscribers: number;
    url: string;
    reason: string;
}

interface CachedData<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

interface RateLimitInfo {
    requests: number;
    windowStart: number;
    maxRequests: number;
    windowMs: number;
}

class RedditAPIOptimized {
    private static instance: RedditAPIOptimized;
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;
    private cache = new Map<string, CachedData<any>>();
    private pendingRequests = new Map<string, Promise<any>>();
    private rateLimiter: RateLimitInfo = {
        requests: 0,
        windowStart: Date.now(),
        maxRequests: 50, // Conservative limit (60 per minute with buffer)
        windowMs: 60000, // 1 minute
    };

    // Cache TTL settings (in milliseconds)
    private readonly CACHE_TTL = {
        TOKEN: 50 * 60 * 1000, // 50 minutes
        SUBREDDIT_INFO: 30 * 60 * 1000, // 30 minutes
        RULES: 60 * 60 * 1000, // 1 hour
        FLAIRS: 60 * 60 * 1000, // 1 hour
        POST_REQUIREMENTS: 60 * 60 * 1000, // 1 hour
        SUBREDDITS_LIST: 10 * 60 * 1000, // 10 minutes
    };

    private constructor() {}

    static getInstance(): RedditAPIOptimized {
        if (!RedditAPIOptimized.instance) {
            RedditAPIOptimized.instance = new RedditAPIOptimized();
        }
        return RedditAPIOptimized.instance;
    }

    private async checkRateLimit(): Promise<void> {
        const now = Date.now();

        // Reset window if it's been more than 1 minute
        if (now - this.rateLimiter.windowStart > this.rateLimiter.windowMs) {
            this.rateLimiter.requests = 0;
            this.rateLimiter.windowStart = now;
        }

        // If we're at the limit, wait until the window resets
        if (this.rateLimiter.requests >= this.rateLimiter.maxRequests) {
            const waitTime =
                this.rateLimiter.windowMs -
                (now - this.rateLimiter.windowStart);
            if (waitTime > 0) {
                console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
                await new Promise((resolve) => setTimeout(resolve, waitTime));
                this.rateLimiter.requests = 0;
                this.rateLimiter.windowStart = Date.now();
            }
        }

        this.rateLimiter.requests++;
    }

    private async getAccessToken(): Promise<string> {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        const cacheKey = "reddit_access_token";
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            this.accessToken = cached.data;
            this.tokenExpiry =
                Date.now() + (cached.ttl - (Date.now() - cached.timestamp));
            return this.accessToken;
        }

        await this.checkRateLimit();

        const clientId = process.env.REDDIT_CLIENT_ID;
        const clientSecret = process.env.REDDIT_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error("Reddit API credentials not configured");
        }

        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString(
            "base64",
        );

        const response = await fetch(
            "https://www.reddit.com/api/v1/access_token",
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${auth}`,
                    "User-Agent": "reddit-unbanr/1.0",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "grant_type=client_credentials",
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get access token: ${response.statusText} - ${errorText}`,
            );
        }

        const data: RedditTokenResponse = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Refresh 1 minute early

        // Cache the token
        this.cache.set(cacheKey, {
            data: this.accessToken,
            timestamp: Date.now(),
            ttl: this.CACHE_TTL.TOKEN,
        });

        return this.accessToken;
    }

    private async makeRequest<T>(
        url: string,
        cacheKey: string,
        ttl: number,
        options: RequestInit = {},
    ): Promise<T> {
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.data;
        }

        // Check if request is already pending
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey)!;
        }

        // Create the request promise
        const requestPromise = this.executeRequest<T>(url, options);
        this.pendingRequests.set(cacheKey, requestPromise);

        try {
            const result = await requestPromise;

            // Cache the result
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now(),
                ttl,
            });

            return result;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    private async executeRequest<T>(
        url: string,
        options: RequestInit = {},
    ): Promise<T> {
        await this.checkRateLimit();

        const token = await this.getAccessToken();

        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "reddit-unbanr/1.0",
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Reddit API error ${response.status}: ${errorText}`,
            );
        }

        return response.json();
    }

    // Batch request for multiple subreddit data
    async fetchSubredditDataBatch(subreddits: string[]): Promise<{
        [subreddit: string]: {
            info?: any;
            rules?: SubredditRule[];
            flairs?: Flair[];
            requirements?: PostRequirement | null;
        };
    }> {
        const results: any = {};
        const token = await this.getAccessToken();

        // Process in batches of 5 to avoid overwhelming the API
        const batchSize = 5;
        for (let i = 0; i < subreddits.length; i += batchSize) {
            const batch = subreddits.slice(i, i + batchSize);
            const batchPromises = batch.map(async (subreddit) => {
                try {
                    const [info, rules, flairs, requirements] =
                        await Promise.allSettled([
                            this.fetchSubredditInfo(subreddit),
                            this.fetchSubredditRules(subreddit),
                            this.fetchSubredditFlairs(subreddit),
                            this.fetchPostRequirements(subreddit),
                        ]);

                    results[subreddit] = {
                        info: info.status === "fulfilled" ? info.value : null,
                        rules: rules.status === "fulfilled" ? rules.value : [],
                        flairs:
                            flairs.status === "fulfilled" ? flairs.value : [],
                        requirements:
                            requirements.status === "fulfilled"
                                ? requirements.value
                                : null,
                    };
                } catch (error) {
                    console.error(
                        `Error fetching data for r/${subreddit}:`,
                        error,
                    );
                    results[subreddit] = {
                        info: null,
                        rules: [],
                        flairs: [],
                        requirements: null,
                    };
                }
            });

            await Promise.all(batchPromises);
        }

        return results;
    }

    async fetchSubreddits(
        limit: number = 50,
        query?: string,
    ): Promise<Subreddit[]> {
        const cacheKey = `subreddits_${limit}_${query || "popular"}`;

        return this.makeRequest<Subreddit[]>(
            query
                ? `https://oauth.reddit.com/subreddits/search?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance`
                : `https://oauth.reddit.com/subreddits/popular?limit=${limit}`,
            cacheKey,
            this.CACHE_TTL.SUBREDDITS_LIST,
        ).then((data) => {
            if (!data.data || !data.data.children) {
                throw new Error("Invalid response format from Reddit API");
            }

            return data.data.children.map((child: any) => ({
                display_name: child.data.display_name,
                public_description: child.data.public_description || "",
                subscribers: child.data.subscribers || 0,
                id: child.data.id,
            }));
        });
    }

    async fetchSubredditInfo(subreddit: string): Promise<any> {
        const cacheKey = `subreddit_info_${subreddit}`;

        return this.makeRequest(
            `https://oauth.reddit.com/r/${subreddit}/about`,
            cacheKey,
            this.CACHE_TTL.SUBREDDIT_INFO,
        ).then((data) => {
            if (!data.data) {
                throw new Error("Subreddit not found");
            }

            return {
                display_name: data.data.display_name,
                public_description: data.data.public_description || "",
                subscribers: data.data.subscribers || 0,
                url: `https://reddit.com/r/${data.data.display_name}`,
            };
        });
    }

    async fetchSubredditRules(subreddit: string): Promise<SubredditRule[]> {
        const cacheKey = `subreddit_rules_${subreddit}`;

        return this.makeRequest(
            `https://oauth.reddit.com/r/${subreddit}/about/rules`,
            cacheKey,
            this.CACHE_TTL.RULES,
        ).then((data) => {
            if (!data.rules || !Array.isArray(data.rules)) {
                return [];
            }

            return data.rules.map((rule: any) => ({
                kind: rule.kind || "all",
                short_name: rule.short_name || "Rule",
                description: rule.description || "",
                description_html: rule.description_html || "",
                created_utc: rule.created_utc || Date.now() / 1000,
                priority: rule.priority || 0,
                violation_reason: rule.violation_reason || "",
            }));
        });
    }

    async fetchSubredditFlairs(subreddit: string): Promise<Flair[]> {
        const cacheKey = `subreddit_flairs_${subreddit}`;

        return this.makeRequest(
            `https://oauth.reddit.com/r/${subreddit}/api/link_flair_v2.json?raw_json=1`,
            cacheKey,
            this.CACHE_TTL.FLAIRS,
        ).then((data) => {
            const rawFlairs: any[] = Array.isArray(data) ? data : [];

            return rawFlairs.map((flair: any) => ({
                id:
                    flair.id ||
                    flair.text?.toLowerCase().replace(/\s+/g, "-") ||
                    "",
                text: flair.text || "",
                css_class: flair.css_class || "",
                text_color: flair.text_color || "dark",
                background_color: flair.background_color || "#dadada",
            }));
        });
    }

    async fetchPostRequirements(
        subreddit: string,
    ): Promise<PostRequirement | null> {
        const cacheKey = `post_requirements_${subreddit}`;

        try {
            return await this.makeRequest(
                `https://oauth.reddit.com/r/${subreddit}/api/post_requirements`,
                cacheKey,
                this.CACHE_TTL.POST_REQUIREMENTS,
            ).then((data) => ({
                title_required: data.title_required !== false,
                title_text_max_length: data.title_text_max_length || 300,
                title_text_min_length: data.title_text_min_length || 1,
                body_restriction_policy: data.body_restriction_policy || "none",
                domain_blacklist: data.domain_blacklist || [],
                domain_whitelist: data.domain_whitelist || [],
                body_blacklisted_strings: data.body_blacklisted_strings || [],
                body_required_strings: data.body_required_strings || [],
                title_blacklisted_strings: data.title_blacklisted_strings || [],
                title_required_strings: data.title_required_strings || [],
                is_flair_required: data.is_flair_required === true,
            }));
        } catch (error) {
            // If post requirements endpoint doesn't exist or fails, return null
            if (error instanceof Error && error.message.includes("404")) {
                return null;
            }
            throw error;
        }
    }

    // Optimized alternative subreddits with reduced API calls
    async fetchAlternativeSubreddits(
        subreddit: string,
        title: string,
        body: string,
    ): Promise<{
        strictRules: string[];
        alternatives: AlternativeSubreddit[];
        message: string;
    }> {
        // First check if current subreddit has strict rules
        const rules = await this.fetchSubredditRules(subreddit);
        const strictRules = this.detectStrictRules(rules);

        if (strictRules.length === 0) {
            return {
                strictRules: [],
                alternatives: [],
                message: `r/${subreddit} doesn't have strict rules that would prevent your post.`,
            };
        }

        // Use AI to get suggestions (this doesn't use Reddit API)
        const aiSuggestions = await this.getAISuggestions(
            title,
            body,
            subreddit,
            strictRules,
        );

        // Only check the top 5 suggestions instead of 12 to reduce API calls
        const topSuggestions = aiSuggestions.slice(0, 5);

        // Batch fetch info for all suggestions
        const suggestionNames = topSuggestions.map((s) => s.name);
        const batchData = await this.fetchSubredditDataBatch(suggestionNames);

        const alternatives: AlternativeSubreddit[] = [];

        for (const suggestion of topSuggestions) {
            const subredditData = batchData[suggestion.name];
            if (subredditData?.info && subredditData.rules) {
                // Check if this alternative has conflicting rules
                const conflictingRules = this.detectStrictRules(
                    subredditData.rules,
                );

                if (conflictingRules.length === 0) {
                    alternatives.push({
                        display_name: subredditData.info.display_name,
                        public_description:
                            subredditData.info.public_description ||
                            "No description available",
                        subscribers: subredditData.info.subscribers || 0,
                        url: subredditData.info.url,
                        reason: suggestion.reason,
                    });
                }
            }
        }

        return {
            strictRules,
            alternatives: alternatives.sort(
                (a, b) => b.subscribers - a.subscribers,
            ),
            message: `r/${subreddit} has strict rules that may prevent your post. Here are some AI-suggested alternative subreddits where you might be able to share your content.`,
        };
    }

    private detectStrictRules(rules: SubredditRule[]): string[] {
        const strictRuleKeywords = [
            "no self promotion",
            "no promotion",
            "no advertising",
            "no spam",
            "no commercial",
            "no business",
            "no marketing",
            "no selling",
            "no affiliate",
            "no referral",
            "no monetization",
            "no profit",
            "no commercial content",
            "no promotional content",
            "no advertising content",
            "no business promotion",
            "no product promotion",
            "no service promotion",
            "no brand promotion",
            "no company promotion",
            "no self-promotion",
            "no promotional",
            "no advertisements",
            "no ads",
            "no sponsored",
            "no sponsorship",
            "no paid content",
            "no monetized content",
            "no business posts",
            "no company posts",
            "no brand posts",
            "no product posts",
            "no service posts",
            "no promotional posts",
            "no advertising posts",
            "no commercial posts",
            "no business content",
            "no company content",
            "no brand content",
            "no product content",
            "no service content",
        ];

        const detectedRules: string[] = [];

        rules.forEach((rule) => {
            const ruleText =
                `${rule.short_name} ${rule.description}`.toLowerCase();
            for (const keyword of strictRuleKeywords) {
                if (ruleText.includes(keyword)) {
                    detectedRules.push(rule.short_name);
                    break;
                }
            }
        });

        return detectedRules;
    }

    private async getAISuggestions(
        title: string,
        body: string,
        currentSubreddit: string,
        strictRules: string[],
    ): Promise<Array<{ name: string; reason: string }>> {
        try {
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Gemini API key not configured");
            }

            const prompt = `You are a Reddit expert. A user wants to post the following content but the subreddit r/${currentSubreddit} has strict rules that prevent it.

**User's Post:**
Title: "${title}"
Body: "${body}"

**Strict Rules Detected:**
${strictRules.map((rule) => `- ${rule}`).join("\n")}

**Task:** Suggest 5 alternative subreddits where this content would be appropriate and welcome. For each subreddit, provide:
1. The subreddit name (without r/)
2. A brief reason why it's suitable

**Requirements:**
- Focus on active, popular subreddits
- Ensure the content type matches the subreddit's purpose
- Avoid subreddits with similar strict rules
- Consider the specific content and context

**Output Format:**
Return only a JSON array with this exact structure:
[
  {
    "name": "subreddit_name",
    "reason": "Brief explanation of why this subreddit is suitable"
  }
]`;

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
                            maxOutputTokens: 1024,
                        },
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(
                    `Gemini API request failed: ${response.status}`,
                );
            }

            const data = await response.json();
            const result =
                data.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (!result) {
                throw new Error("No content generated from Gemini API");
            }

            return JSON.parse(result);
        } catch (error) {
            console.error("Error getting AI suggestions:", error);
            // Return fallback suggestions
            return [
                {
                    name: "SideProject",
                    reason: "Share your side projects and get feedback",
                },
                {
                    name: "IndieHackers",
                    reason: "Community for indie hackers and bootstrapped founders",
                },
                { name: "SaaS", reason: "Software as a Service discussions" },
                { name: "startups", reason: "Startup discussions and advice" },
                {
                    name: "productivity",
                    reason: "Productivity and efficiency tips",
                },
            ];
        }
    }

    // Clear cache for a specific subreddit
    clearSubredditCache(subreddit: string): void {
        const keys = [
            `subreddit_info_${subreddit}`,
            `subreddit_rules_${subreddit}`,
            `subreddit_flairs_${subreddit}`,
            `post_requirements_${subreddit}`,
        ];

        keys.forEach((key) => this.cache.delete(key));
    }

    // Clear all cache
    clearAllCache(): void {
        this.cache.clear();
    }

    // Get cache statistics
    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

export const redditAPIOptimized = RedditAPIOptimized.getInstance();
export default redditAPIOptimized;
