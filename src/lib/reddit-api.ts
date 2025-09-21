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

interface AlternativeSubredditsResponse {
    strictRules: string[];
    alternatives: AlternativeSubreddit[];
    message: string;
}

interface PostViabilityResult {
    canPost: boolean;
    reason: string;
    conflictingRules: string[];
    suggestions: string[];
}

interface PostViabilityResponse {
    subreddit: string;
    analysis: PostViabilityResult;
    rulesCount: number;
    message: string;
}

class RedditAPI {
    async fetchSubreddits(limit: number = 50): Promise<Subreddit[]> {
        try {
            const response = await fetch(
                `/api/reddit/subreddits?limit=${limit}`,
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching subreddits:", error);
            throw error;
        }
    }

    async searchSubreddits(
        query: string,
        limit: number = 25,
    ): Promise<Subreddit[]> {
        try {
            const response = await fetch(
                `/api/reddit/subreddits?query=${encodeURIComponent(
                    query,
                )}&limit=${limit}`,
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error searching subreddits:", error);
            throw error;
        }
    }

    async fetchSubredditFlairs(subredditName: string): Promise<Flair[]> {
        // Reddit's public API now requires authentication, so we'll use our server-side scraping
        console.log(
            `🔍 Fetching flairs via server-side scraping for r/${subredditName}`,
        );

        // Fallback to our server API
        try {
            console.log(`🔄 Using server fallback API for r/${subredditName}`);
            const response = await fetch(
                `/api/reddit/flairs?subreddit=${encodeURIComponent(
                    subredditName,
                )}&t=${Date.now()}`,
                {
                    cache: "no-cache",
                    headers: {
                        "Cache-Control": "no-cache",
                    },
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(
                `Error fetching flairs for r/${subredditName}:`,
                error,
            );
            throw error;
        }
    }

    async fetchSubredditRules(subredditName: string): Promise<SubredditRule[]> {
        try {
            const response = await fetch(
                `/api/reddit/rules?subreddit=${encodeURIComponent(
                    subredditName,
                )}`,
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(
                `Error fetching rules for r/${subredditName}:`,
                error,
            );
            throw error;
        }
    }

    async fetchPostRequirements(
        subredditName: string,
    ): Promise<PostRequirement | null> {
        try {
            const response = await fetch(
                `/api/reddit/post-requirements?subreddit=${encodeURIComponent(
                    subredditName,
                )}`,
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(
                `Error fetching post requirements for r/${subredditName}:`,
                error,
            );
            throw error;
        }
    }

    async fetchAlternativeSubreddits(
        subredditName: string,
        title: string = "",
        body: string = "",
    ): Promise<AlternativeSubredditsResponse | null> {
        try {
            const response = await fetch(
                `/api/reddit/alternative-subreddits?subreddit=${encodeURIComponent(
                    subredditName,
                )}&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`,
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(
                `Error fetching alternative subreddits for r/${subredditName}:`,
                error,
            );
            throw error;
        }
    }

    async checkPostViability(
        subredditName: string,
        title: string,
        body: string = "",
    ): Promise<PostViabilityResponse> {
        try {
            const response = await fetch(
                `/api/reddit/check-post-viability?subreddit=${encodeURIComponent(
                    subredditName,
                )}&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`,
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(
                `Error checking post viability for r/${subredditName}:`,
                error,
            );
            throw error;
        }
    }

    // New method to fetch multiple subreddit data in one call
    async fetchSubredditDataBatch(subreddits: string[]): Promise<{
        [subreddit: string]: {
            info?: any;
            rules?: SubredditRule[];
            flairs?: Flair[];
            requirements?: PostRequirement | null;
        };
    }> {
        try {
            const response = await fetch("/api/reddit/batch", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ subreddits }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching batch subreddit data:", error);
            return {};
        }
    }
}

export const redditAPI = new RedditAPI();
export type {
    Subreddit,
    Flair,
    SubredditRule,
    PostRequirement,
    AlternativeSubreddit,
    AlternativeSubredditsResponse,
    PostViabilityResult,
    PostViabilityResponse,
};
