import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://unbannnable.com";

    // Add your static routes here
    const routes = [
        "",
        "/privacy",
        "/check",
        "/create-post",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    return [...routes];
}
