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
        try {
            const response = await fetch(
                `/api/reddit/flairs?subreddit=${encodeURIComponent(
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
}

export const redditAPI = new RedditAPI();
export type { Subreddit, Flair, SubredditRule, PostRequirement };
