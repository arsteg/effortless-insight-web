// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Enable replay in production
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out sensitive data
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV !== "production") {
      return null;
    }

    // Remove any PII from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        if (breadcrumb.data) {
          // Mask sensitive fields
          const sensitiveFields = ["email", "password", "token", "gstin", "pan", "mobile"];
          for (const field of sensitiveFields) {
            if (breadcrumb.data[field]) {
              breadcrumb.data[field] = "[REDACTED]";
            }
          }
        }
        return breadcrumb;
      });
    }

    return event;
  },

  // Ignore common non-actionable errors
  ignoreErrors: [
    // Network errors
    "Network request failed",
    "Failed to fetch",
    "NetworkError",
    "AbortError",
    // Browser extensions
    "Extension context invalidated",
    // React hydration mismatches (usually harmless)
    "Minified React error #418",
    "Minified React error #423",
  ],
});
