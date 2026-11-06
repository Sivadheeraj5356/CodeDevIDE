// Server-side verification of Google ID tokens for the paid AI routes.
// Verification follows Google's production guidance: validate the JWT
// signature locally against Google's public JWKS and require matching
// issuer, audience and expiry (https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).
// No cookies are used anywhere, so there is no ambient authority and no CSRF
// vector: the token travels as an Authorization bearer header only.

import { createRemoteJWKSet, jwtVerify } from "jose";

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
// Google documents BOTH issuer spellings as valid; accept either.
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

let jwks;
function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));
  }
  return jwks;
}

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.status = status;
  }
}

export function getBearerToken(req) {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

async function defaultVerify(idToken, clientId) {
  const { payload } = await jwtVerify(idToken, getJwks(), {
    issuer: GOOGLE_ISSUERS,
    audience: clientId,
  });
  return payload;
}

export async function verifyGoogleIdToken(idToken, { clientId, verifyImpl } = {}) {
  if (!idToken) {
    throw new AuthError("Missing ID token");
  }
  if (!clientId) {
    throw new AuthError("Server is missing the Google client id configuration", 500);
  }

  let payload;
  try {
    payload = await (verifyImpl ?? defaultVerify)(idToken, clientId);
  } catch (err) {
    if (err instanceof AuthError) throw err;
    // jwtVerify throws for bad signatures, wrong iss/aud and expired tokens;
    // a JWKS fetch failure lands here too. Neither is ever an allow.
    const isNetwork = /fetch|network|ECONNREFUSED|ENOTFOUND|timeout/i.test(String(err?.message));
    throw new AuthError(
      isNetwork
        ? "Could not fetch Google's signing keys to verify the ID token"
        : "The ID token is invalid or expired. Sign in again.",
      isNetwork ? 502 : 401
    );
  }

  if (payload.email_verified !== true && payload.email_verified !== "true") {
    throw new AuthError("The Google account email is not verified", 401);
  }
  if (!payload.email) {
    throw new AuthError("ID token has no email claim", 401);
  }

  return { email: payload.email, name: payload.name, picture: payload.picture };
}

// Gate for the AI routes: any request without a valid Google ID token stops
// here, before a single (billable) model call is made.
export async function requireApiUser(req, options = {}) {
  const token = getBearerToken(req);
  if (!token) {
    throw new AuthError("Sign in required", 401);
  }
  const clientId =
    options.clientId ||
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_KEY;
  return verifyGoogleIdToken(token, { ...options, clientId });
}
