import { MetadataRoute } from "next";
import { SUBREDDIT_PSEO_TARGETS } from "@/lib/pseo/subreddits";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://unbannnable.com";

    // Add your static routes here
    const routes = [
        "",
        "/privacy",
        "/check",
        "/check/r",
        "/check/r/AskReddit",
        "/create-post",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    const subredditRoutes = SUBREDDIT_PSEO_TARGETS.map((item) => ({
        url: `${baseUrl}/check/r/${item.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
    }));

    return [...routes, ...subredditRoutes];
}
