// Client session: a verified Google ID token (OIDC JWT), kept in localStorage.
// This replaces the old unsigned {name,email,picture} JSON under the "user"
// key, which anyone could forge in devtools to impersonate any account.
const KEY = "codedev.session";
const LEGACY_KEY = "user";

export function decodeJwtPayload(token) {
  try {
    if (typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    const payload = JSON.parse(json);
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

// 30s skew so a token is never used right up to its expiry boundary.
export function isTokenExpired(payload, nowMs = Date.now(), skewMs = 30000) {
  const exp = Number(payload?.exp);
  if (!Number.isFinite(exp)) return true;
  return exp * 1000 <= nowMs + skewMs;
}

export function saveSession(idToken) {
  const payload = decodeJwtPayload(idToken);
  if (!payload || isTokenExpired(payload)) return null;
  const session = {
    idToken,
    name: payload.name ?? "",
    email: payload.email ?? "",
    picture: payload.picture ?? "",
    exp: payload.exp,
  };
  localStorage.setItem(KEY, JSON.stringify(session));
  localStorage.removeItem(LEGACY_KEY);
  return session;
}

export function loadSession(nowMs = Date.now()) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.idToken || isTokenExpired(session, nowMs)) {
      localStorage.removeItem(KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function getIdToken() {
  return loadSession()?.idToken ?? null;
}

export function clearSession() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(LEGACY_KEY);
}

export function authHeaders() {
  const token = getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
