import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/app/",
                    "/success",
                    "/success-new",
                    "/cancel",
                    "/1",
                    "/2",
                    "/3",
                    "/4",
                    "/5",
                    "/6",
                    "/7",
                    "/8",
                ],
            },
        ],
        sitemap: "https://unbannnable.com/sitemap.xml",
    };
}
