import { getRedditClient } from "@/lib/reddit-client";
import Fuse from "fuse.js";

interface Subreddit {
    display_name: string;
    public_description: string;
    subscribers: number;
    id: string;
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
    ttl: number;
}

const FALLBACK_SUBREDDITS: Subreddit[] = [
    { display_name: "SaaS", public_description: "Software as a Service discussions", subscribers: 120000, id: "f_saas" },
    { display_name: "SideProject", public_description: "Build and share side projects", subscribers: 180000, id: "f_sideproject" },
    { display_name: "Entrepreneur", public_description: "Entrepreneurship and startup community", subscribers: 2200000, id: "f_entrepreneur" },
    { display_name: "startups", public_description: "Startup advice and stories", subscribers: 1700000, id: "f_startups" },
    { display_name: "smallbusiness", public_description: "Small business owners and operators", subscribers: 1100000, id: "f_smallbusiness" },
    { display_name: "webdev", public_description: "Web development discussions", subscribers: 1600000, id: "f_webdev" },
    { display_name: "programming", public_description: "Computer programming", subscribers: 6000000, id: "f_programming" },
    { display_name: "javascript", public_description: "The JavaScript Programming Language", subscribers: 2800000, id: "f_javascript" },
    { display_name: "reactjs", public_description: "React community", subscribers: 900000, id: "f_reactjs" },
    { display_name: "nextjs", public_description: "Next.js framework discussions", subscribers: 300000, id: "f_nextjs" },
    { display_name: "indiehackers", public_description: "Indie maker and bootstrap discussions", subscribers: 220000, id: "f_indiehackers" },
    { display_name: "AskReddit", public_description: "Ask and answer thought-provoking questions", subscribers: 45000000, id: "f_askreddit" },
    { display_name: "technology", public_description: "Technology news and discussion", subscribers: 14000000, id: "f_technology" },
    { display_name: "marketing", public_description: "Marketing tactics and growth", subscribers: 300000, id: "f_marketing" },
    { display_name: "EntrepreneurRideAlong", public_description: "Build in public and startup journey", subscribers: 180000, id: "f_eridealong" },
    { display_name: "nocode", public_description: "No-code products and tools", subscribers: 400000, id: "f_nocode" },
    { display_name: "ProductManagement", public_description: "Product management discussions", subscribers: 250000, id: "f_pm" },
    { display_name: "Freelance", public_description: "Freelancing tips and questions", subscribers: 500000, id: "f_freelance" },
    { display_name: "buildinpublic", public_description: "Building products in public", subscribers: 160000, id: "f_buildinpublic" },
    { display_name: "AI_Agents", public_description: "AI agents and automation", subscribers: 90000, id: "f_aiagents" },
];

const EXPECTED_BLOCK_MESSAGE =
    "Reddit API blocked this server/network (HTTP 403). Using fallback data.";


class RedditAPIOptimized {
    private static instance: RedditAPIOptimized;
    private cache = new Map<string, CachedData<unknown>>();

    private readonly CACHE_TTL = {
        SUBREDDIT_INFO: 30 * 60 * 1000,
        RULES: 60 * 60 * 1000,
        POST_REQUIREMENTS: 60 * 60 * 1000,
        SUBREDDITS_LIST: 10 * 60 * 1000,
    };

    static getInstance(): RedditAPIOptimized {
        if (!RedditAPIOptimized.instance) {
            RedditAPIOptimized.instance = new RedditAPIOptimized();
        }
        return RedditAPIOptimized.instance;
    }

    private getCached<T>(key: string): T | null {
        const cached = this.cache.get(key);
        if (!cached) return null;
        if (Date.now() - cached.timestamp < cached.ttl) {
            return cached.data as T;
        }
        return null;
    }

    private setCached<T>(key: string, data: T, ttl: number): void {
        this.cache.set(key, { data, timestamp: Date.now(), ttl });
    }


    private rankSubreddits(
        query: string,
        candidates: Subreddit[],
        limit: number,
    ): Subreddit[] {
        const normalized = query.trim().toLowerCase();
        const unique = candidates.filter(
            (subreddit, index, self) =>
                index ===
                self.findIndex(
                    (s) =>
                        s.display_name.toLowerCase() ===
                        subreddit.display_name.toLowerCase(),
                ),
        );

        const exact = unique.filter(
            (s) => s.display_name.toLowerCase() === normalized,
        );
        const startsWith = unique.filter(
            (s) =>
                s.display_name.toLowerCase().startsWith(normalized) &&
                !exact.some(
                    (e) =>
                        e.display_name.toLowerCase() ===
                        s.display_name.toLowerCase(),
                ),
        );

        const fuse = new Fuse(unique, {
            keys: ["display_name", "public_description"],
            threshold: 0.4,
            includeScore: true,
        });

        const fuzzy = fuse
            .search(query)
            .map((result) => result.item)
            .filter(
                (s) =>
                    !exact.some(
                        (e) =>
                            e.display_name.toLowerCase() ===
                            s.display_name.toLowerCase(),
                    ) &&
                    !startsWith.some(
                        (p) =>
                            p.display_name.toLowerCase() ===
                            s.display_name.toLowerCase(),
                    ),
            );

        return [...exact, ...startsWith, ...fuzzy].slice(0, limit);
    }

    async fetchSubreddits(limit = 10, query?: string): Promise<Subreddit[]> {
        const cacheKey = `subreddits_${limit}_${query || "popular"}`;
        const cached = this.getCached<Subreddit[]>(cacheKey);
        if (cached) return cached;

        const url = query
            ? `https://www.reddit.com/subreddits/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
            : `https://www.reddit.com/subreddits/popular.json?limit=${limit}`;

        try {
            const response = await fetch(url, {
                headers: {
                    "User-Agent":
                        process.env.REDDIT_USER_AGENT ||
                        "unbannnable/1.0 by u/NicDevIam",
                },
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error(`Reddit API HTTP ${response.status}`);
            }

            const data: any = await response.json();
            const children = data?.data?.children;

            if (!Array.isArray(children)) {
                throw new Error("Invalid subreddit response shape");
            }

            const results: Subreddit[] = children.map((child: any) => ({
                display_name: child?.data?.display_name || "",
                public_description: child?.data?.public_description || "",
                subscribers: child?.data?.subscribers || 0,
                id: child?.data?.id || `fallback_${Math.random().toString(36).slice(2, 10)}`,
            })).filter((s: Subreddit) => !!s.display_name);

            const rankedResults = query
                ? this.rankSubreddits(
                      query,
                      [...results, ...FALLBACK_SUBREDDITS],
                      limit,
                  )
                : results;

            this.setCached(
                cacheKey,
                rankedResults,
                this.CACHE_TTL.SUBREDDITS_LIST,
            );
            return rankedResults;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn(`Direct Reddit subreddit search failed: ${errorMessage}`);

            // Secondary fallback to snoowrap
            try {
                const reddit = await getRedditClient();
                const listing = query
                    ? await reddit.searchSubreddits({ query, limit })
                    : await reddit.getPopularSubreddits({ limit });

                const results: Subreddit[] = listing.map((subreddit: any) => ({
                    display_name: subreddit.display_name,
                    public_description: subreddit.public_description || "",
                    subscribers: subreddit.subscribers || 0,
                    id: subreddit.id || `sr_${subreddit.display_name}`,
                }));

                const rankedResults = query
                    ? this.rankSubreddits(
                          query,
                          [...results, ...FALLBACK_SUBREDDITS],
                          limit,
                      )
                    : results;

                this.setCached(
                    cacheKey,
                    rankedResults,
                    this.CACHE_TTL.SUBREDDITS_LIST,
                );
                return rankedResults;
            } catch (secondaryError) {
                const secondaryMessage =
                    secondaryError instanceof Error
                        ? secondaryError.message
                        : String(secondaryError);
                if (!secondaryMessage.includes("Reddit API blocked this server/network")) {
                    console.warn(
                        `Snoowrap subreddit search fallback failed: ${secondaryMessage}`,
                    );
                }

                if (cached) return cached;
                if (query) {
                    return this.rankSubreddits(query, FALLBACK_SUBREDDITS, limit);
                }
                return FALLBACK_SUBREDDITS.slice(0, limit);
            }
        }
    }


    async fetchSubredditInfo(subreddit: string): Promise<{
        display_name: string;
        public_description: string;
        subscribers: number;
        url: string;
    }> {
        const key = `subreddit_info_${subreddit}`;
        const cached = this.getCached<{
            display_name: string;
            public_description: string;
            subscribers: number;
            url: string;
        }>(key);
        if (cached) return cached;

        const reddit = await getRedditClient();
        const subredditRef = reddit.getSubreddit(subreddit) as any;
        const about = await subredditRef.fetch();

        if (!about?.display_name) {
            throw new Error("Subreddit not found");
        }

        const result = {
            display_name: about.display_name,
            public_description: about.public_description || "",
            subscribers: about.subscribers || 0,
            url: `https://reddit.com/r/${about.display_name}`,
        };

        this.setCached(key, result, this.CACHE_TTL.SUBREDDIT_INFO);
        return result;
    }

    async fetchSubredditRules(subreddit: string): Promise<SubredditRule[]> {
        const key = `subreddit_rules_${subreddit}`;
        const cached = this.getCached<SubredditRule[]>(key);
        if (cached) return cached;

        try {
            const reddit = await getRedditClient();
            const response: any = await reddit.getSubreddit(subreddit).getRules();
            const rawRules = Array.isArray(response?.rules) ? response.rules : [];

            const rules = rawRules.map((rule: any) => ({
                kind: rule.kind || "all",
                short_name: rule.short_name || "Rule",
                description: rule.description || "",
                description_html: rule.description_html || "",
                created_utc: rule.created_utc || Date.now() / 1000,
                priority: rule.priority || 0,
                violation_reason: rule.violation_reason || "",
            }));

            this.setCached(key, rules, this.CACHE_TTL.RULES);
            return rules;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (!errorMessage.includes(EXPECTED_BLOCK_MESSAGE)) {
                console.warn(`Error fetching rules for r/${subreddit}: ${errorMessage}`);
            }
            return [];
        }
    }

    async fetchPostRequirements(subreddit: string): Promise<PostRequirement | null> {
        const key = `post_requirements_${subreddit}`;
        const cached = this.getCached<PostRequirement>(key);
        if (cached) return cached;

        try {
            const reddit = await getRedditClient();
            const data: any = await reddit.oauthRequest({
                uri: `/r/${subreddit}/api/post_requirements`,
                method: "get",
            });

            const normalized: PostRequirement = {
                title_required: data?.title_required !== false,
                title_text_max_length: data?.title_text_max_length || 300,
                title_text_min_length: data?.title_text_min_length || 1,
                body_restriction_policy: data?.body_restriction_policy || "none",
                domain_blacklist: data?.domain_blacklist || [],
                domain_whitelist: data?.domain_whitelist || [],
                body_blacklisted_strings: data?.body_blacklisted_strings || [],
                body_required_strings: data?.body_required_strings || [],
                title_blacklisted_strings: data?.title_blacklisted_strings || [],
                title_required_strings: data?.title_required_strings || [],
                is_flair_required: data?.is_flair_required === true,
            };

            this.setCached(key, normalized, this.CACHE_TTL.POST_REQUIREMENTS);
            return normalized;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (!errorMessage.includes(EXPECTED_BLOCK_MESSAGE)) {
                console.warn(
                    `Could not fetch post requirements for r/${subreddit}, using defaults`,
                );
            }
            return {
                title_required: true,
                title_text_max_length: 300,
                title_text_min_length: 1,
                body_restriction_policy: "none",
                domain_blacklist: [],
                domain_whitelist: [],
                body_blacklisted_strings: [],
                body_required_strings: [],
                title_blacklisted_strings: [],
                title_required_strings: [],
                is_flair_required: false,
            };
        }
    }

    async fetchSubredditDataBatch(subreddits: string[]): Promise<{
        [subreddit: string]: {
            info?: unknown;
            rules?: SubredditRule[];
            requirements?: PostRequirement | null;
        };
    }> {
        const results: Record<string, { info?: unknown; rules?: SubredditRule[]; requirements?: PostRequirement | null }> = {};

        for (const subreddit of subreddits) {
            const [info, rules, requirements] = await Promise.allSettled([
                this.fetchSubredditInfo(subreddit),
                this.fetchSubredditRules(subreddit),
                this.fetchPostRequirements(subreddit),
            ]);

            results[subreddit] = {
                info: info.status === "fulfilled" ? info.value : null,
                rules: rules.status === "fulfilled" ? rules.value : [],
                requirements: requirements.status === "fulfilled" ? requirements.value : null,
            };
        }

        return results;
    }

    async fetchAlternativeSubreddits(
        subreddit: string,
        title: string,
        body: string,
    ): Promise<{ strictRules: string[]; alternatives: AlternativeSubreddit[]; message: string }> {
        const rules = await this.fetchSubredditRules(subreddit);
        const strictRules = this.detectStrictRules(rules);

        if (strictRules.length === 0) {
            return {
                strictRules: [],
                alternatives: [],
                message: `r/${subreddit} doesn't have strict rules that would prevent your post.`,
            };
        }

        const aiSuggestions = await this.getAISuggestions(title, body, subreddit, strictRules);
        const topSuggestions = aiSuggestions.slice(0, 5);
        const batchData = await this.fetchSubredditDataBatch(topSuggestions.map((s) => s.name));

        const alternatives: AlternativeSubreddit[] = [];

        for (const suggestion of topSuggestions) {
            const subredditData = batchData[suggestion.name] as any;
            if (subredditData?.info && subredditData?.rules) {
                const conflictingRules = this.detectStrictRules(subredditData.rules);
                if (conflictingRules.length === 0) {
                    alternatives.push({
                        display_name: subredditData.info.display_name,
                        public_description: subredditData.info.public_description || "No description available",
                        subscribers: subredditData.info.subscribers || 0,
                        url: subredditData.info.url,
                        reason: suggestion.reason,
                    });
                }
            }
        }

        return {
            strictRules,
            alternatives: alternatives.sort((a, b) => b.subscribers - a.subscribers),
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
            "no self-promotion",
            "no ads",
            "no sponsored",
        ];

        const detectedRules: string[] = [];

        for (const rule of rules) {
            const ruleText = `${rule.short_name} ${rule.description}`.toLowerCase();
            if (strictRuleKeywords.some((keyword) => ruleText.includes(keyword))) {
                detectedRules.push(rule.short_name);
            }
        }

        return detectedRules;
    }

    private async getAISuggestions(
        title: string,
        body: string,
        currentSubreddit: string,
        strictRules: string[],
    ): Promise<Array<{ name: string; reason: string }>> {
        try {
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Gemini API key not configured");
            }

            const prompt = `You are a Reddit expert. A user wants to post the following content but the subreddit r/${currentSubreddit} has strict rules that prevent it.

Title: "${title}"
Body: "${body}"
Strict Rules: ${strictRules.join(", ")}

Suggest 5 alternative subreddits. Return JSON array only:
[{"name":"subreddit_name","reason":"why suitable"}]`;

            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const geminiResult = await model.generateContent(prompt);
            const result = geminiResult.response.text();
            if (!result) throw new Error("No content generated from Gemini API");

            const jsonMatch = result.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("No JSON array found in response");

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error("Error getting AI suggestions:", error);
            return [
                { name: "SideProject", reason: "Share your side projects and get feedback" },
                { name: "IndieHackers", reason: "Community for indie hackers and bootstrapped founders" },
                { name: "SaaS", reason: "Software as a Service discussions" },
                { name: "startups", reason: "Startup discussions and advice" },
                { name: "productivity", reason: "Productivity and efficiency tips" },
            ];
        }
    }

    clearSubredditCache(subreddit: string): void {
        this.cache.delete(`subreddit_info_${subreddit}`);
        this.cache.delete(`subreddit_rules_${subreddit}`);
        this.cache.delete(`post_requirements_${subreddit}`);
    }

    clearAllCache(): void {
        this.cache.clear();
    }

    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

export const redditAPIOptimized = RedditAPIOptimized.getInstance();
export default redditAPIOptimized;
