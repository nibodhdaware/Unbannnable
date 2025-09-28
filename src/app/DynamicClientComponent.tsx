"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function DynamicClientComponent() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <ThemeProvider defaultTheme="system" storageKey="unbannnable-ui-theme">
            <div></div>
        </ThemeProvider>
    );
}
