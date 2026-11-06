// Convex configuration state. When NEXT_PUBLIC_CONVEX_URL is missing the app
// must not half-run: the provider renders an explicit unavailable state and
// generation stays disabled instead of failing on live data calls later.
export function getConvexUrl(env = process.env) {
  const url = env.NEXT_PUBLIC_CONVEX_URL;
  return typeof url === "string" && url.trim().length > 0 ? url.trim() : null;
}

export function isConvexConfigured(env = process.env) {
  return getConvexUrl(env) !== null;
}
