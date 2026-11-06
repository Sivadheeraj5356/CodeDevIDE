"use client";

import { ConvexProvider } from "convex/react";
import { useEffect } from "react";
import { convexClient, applyStoredAuth } from "@/lib/convex-client";

// When the backend is not configured, fail visibly and keep generation
// disabled: no provider, no data hooks, an explicit state instead of a
// build-time crash or a runtime failure on a placeholder URL.
export function ConvexClientProvider({ children }) {
  useEffect(() => {
    // Pick up a stored Google ID token (returning visitor) so Convex function
    // calls are authenticated from the first render.
    applyStoredAuth();
  }, []);

  if (!convexClient) {
    return (
      <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center">
        <h1 className="text-xl font-semibold">Configuration unavailable</h1>
        <p className="max-w-md text-sm opacity-80">
          NEXT_PUBLIC_CONVEX_URL is not set, so this deployment cannot reach its
          backend. Sign-in, workspaces and code generation are disabled until it
          is configured.
        </p>
      </div>
    );
  }
  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
}
