"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex items-center space-x-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            <button
                onClick={() => setTheme("light")}
                className={`p-2 rounded-md transition-colors ${
                    theme === "light"
                        ? "bg-white dark:bg-neutral-700 shadow-sm"
                        : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
                title="Light mode"
            >
                <Sun className="h-4 w-4" />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={`p-2 rounded-md transition-colors ${
                    theme === "system"
                        ? "bg-white dark:bg-neutral-700 shadow-sm"
                        : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
                title="System preference"
            >
                <Monitor className="h-4 w-4" />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-md transition-colors ${
                    theme === "dark"
                        ? "bg-white dark:bg-neutral-700 shadow-sm"
                        : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
                title="Dark mode"
            >
                <Moon className="h-4 w-4" />
            </button>
        </div>
    );
}
