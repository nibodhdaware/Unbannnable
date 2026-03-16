import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Create Post | Unbannnable",
    description:
        "Create and optimize your Reddit post with Unbannnable's AI tools.",
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: "https://unbannnable.com/create-post",
    },
};

export default function CreatePostLayout({
    children,
}: {
    children: ReactNode;
}) {
    return children;
}
