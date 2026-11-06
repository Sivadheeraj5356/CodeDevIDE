"use client";
import { ConvexReactClient } from "convex/react";
import { getConvexUrl } from "@/lib/convex-config";
import { loadSession } from "@/lib/session";

// Direct static reference so Next inlines NEXT_PUBLIC_CONVEX_URL into the
// client bundle; getConvexUrl stays the single source of truth for validation.
const convexUrl = getConvexUrl({ NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL });

export const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

// (Re)register the token source with the Convex client. Calling this right
// after sign-in makes Convex fetch the fresh ID token immediately instead of
// waiting for a reconnect. Returning null means "signed out" and Convex then
// refuses to authenticate any function call.
export function applyStoredAuth() {
  if (!convexClient) return;
  convexClient.setAuth(async () => loadSession()?.idToken ?? null);
}
