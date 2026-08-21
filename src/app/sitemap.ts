import { MetadataRoute } from "next";
import { SUBREDDIT_PSEO_TARGETS } from "@/lib/pseo/subreddits";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://unbannnable.com";

    const staticRoutes: Array<{
        route: string;
        changeFrequency: "daily" | "weekly" | "monthly";
        priority: number;
    }> = [
        { route: "", changeFrequency: "weekly", priority: 1 },
        { route: "/privacy", changeFrequency: "monthly", priority: 0.3 },
        { route: "/terms", changeFrequency: "monthly", priority: 0.3 },
        { route: "/check", changeFrequency: "weekly", priority: 0.9 },
        { route: "/check/r", changeFrequency: "weekly", priority: 0.8 },
        { route: "/create-post", changeFrequency: "weekly", priority: 0.5 },
    ];

    const routes = staticRoutes.map(({ route, changeFrequency, priority }) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
    }));

    const subredditRoutes = SUBREDDIT_PSEO_TARGETS.map((item) => ({
        url: `${baseUrl}/check/r/${item.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    // Deduplicate in case staticRoutes overlaps with subredditRoutes
    const all = [...routes, ...subredditRoutes];
    const seen = new Set<string>();
    return all.filter((entry) => {
        if (seen.has(entry.url)) return false;
        seen.add(entry.url);
        return true;
    });
}
