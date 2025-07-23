"use client";

import { useEffect, useState } from "react";

export default function DynamicClientComponent() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return <div></div>;
}
