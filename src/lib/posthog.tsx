"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

// Initialize PostHog with improved error handling and production-safe config
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    try {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
            api_host:
                process.env.NEXT_PUBLIC_POSTHOG_HOST ||
                "https://us.i.posthog.com",
            person_profiles: "identified_only",
            // Disable all features that require external script loading
            disable_session_recording: true,
            disable_surveys: true,
            disable_scroll_properties: true,
            autocapture: false,
            capture_pageview: false,
            capture_pageleave: false,
            // Prevent loading external config files (this causes CORS)
            advanced_disable_decide: true,
            // Use only localStorage to avoid cookie domain issues
            persistence: "localStorage",
            cross_subdomain_cookie: false,
            secure_cookie: process.env.NODE_ENV === "production",
            // Handle CSP restrictions
            respect_dnt: true,
            // Graceful error handling
            loaded: (posthog) => {
                if (process.env.NODE_ENV === "development") {
                    console.log("✅ PostHog loaded successfully");
                }
            },
        });
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ PostHog initialization failed:", error);
        }
        // Silently fail in production
    }
}

interface PostHogProviderProps {
    children: React.ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
    return <PHProvider client={posthog}>{children}</PHProvider>;
}

// Hook to identify users with PostHog
export function usePostHogIdentify() {
    const { user } = useUser();

    useEffect(() => {
        if (user && typeof window !== "undefined") {
            posthog.identify(user.id, {
                email: user.emailAddresses[0]?.emailAddress,
                name: user.fullName,
                username: user.username,
                created_at: user.createdAt,
            });
        }
    }, [user]);
}

// Utility functions for tracking events
export const trackEvent = (
    eventName: string,
    properties?: Record<string, any>,
) => {
    if (typeof window !== "undefined") {
        posthog.capture(eventName, properties);
    }
};

// Specific event tracking functions
export const trackPageView = (
    page: string,
    properties?: Record<string, any>,
) => {
    trackEvent("page_viewed", { page, ...properties });
};

export const trackUserAction = (
    action: string,
    properties?: Record<string, any>,
) => {
    trackEvent("user_action", { action, ...properties });
};

export const trackFormSubmission = (
    formType: string,
    properties?: Record<string, any>,
) => {
    trackEvent("form_submitted", { form_type: formType, ...properties });
};

export const trackFeatureUsage = (
    feature: string,
    properties?: Record<string, any>,
) => {
    trackEvent("feature_used", { feature, ...properties });
};

export const trackPostCreation = (properties?: Record<string, any>) => {
    trackEvent("post_created", properties);
};

export const trackAIGeneration = (
    type: string,
    properties?: Record<string, any>,
) => {
    trackEvent("ai_generation", { type, ...properties });
};

export const trackPaymentEvent = (
    eventType: string,
    properties?: Record<string, any>,
) => {
    trackEvent("payment_event", { event_type: eventType, ...properties });
};

export const trackError = (
    errorType: string,
    properties?: Record<string, any>,
) => {
    trackEvent("error_occurred", { error_type: errorType, ...properties });
};

export default posthog;
