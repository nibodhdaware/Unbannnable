import Snoowrap from "snoowrap";

let redditClient: Snoowrap | null = null;
let clientPromise: Promise<Snoowrap> | null = null;
let initFailure: { message: string; retryAt: number } | null = null;

const RETRY_COOLDOWN_MS = 5 * 60 * 1000;

function normalizeInitError(error: unknown): string {
    const statusCode = (error as { statusCode?: number })?.statusCode;
    if (statusCode === 403) {
        return "Reddit API blocked this server/network (HTTP 403). Using fallback data.";
    }
    if (error instanceof Error) return error.message;
    return "Failed to initialize Reddit client";
}

export async function getRedditClient(): Promise<Snoowrap> {
    if (redditClient) return redditClient;
    if (clientPromise) return clientPromise;

    if (initFailure && Date.now() < initFailure.retryAt) {
        throw new Error(initFailure.message);
    }

    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Reddit API credentials not configured");
    }

    const userAgent = process.env.REDDIT_USER_AGENT || "unbannnable/1.0 by u/NicDevIam";

    clientPromise = Snoowrap.fromApplicationOnlyAuth({
        userAgent,
        clientId,
        clientSecret,
        grantType: "client_credentials",
    })
        .then((client) => {
            client.config({
                continueAfterRatelimitError: true,
                requestTimeout: 15000,
            });
            redditClient = client;
            initFailure = null;
            return client;
        })
        .catch((error) => {
            const message = normalizeInitError(error);
            initFailure = { message, retryAt: Date.now() + RETRY_COOLDOWN_MS };
            clientPromise = null;
            throw new Error(message);
        });

    return clientPromise;
}
