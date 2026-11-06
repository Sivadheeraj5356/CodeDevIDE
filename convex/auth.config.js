// Google is the OIDC identity provider: the client signs in with Google and
// hands the Convex backend the Google ID token, which Convex verifies against
// this issuer + audience. The client ID is a public identifier (it is shipped
// to every browser in the sign-in page), so the real value can live here as a
// default; GOOGLE_CLIENT_ID overrides it at deploy time if the OAuth client
// ever rotates.
const clientId =
  process.env.GOOGLE_CLIENT_ID ||
  "947392404679-s5g1eddr384mhtn0nf1b7p527p9cu125.apps.googleusercontent.com";

// Google documents BOTH issuer spellings as valid in ID tokens
// (https://developers.google.com/identity/gsi/web/guides/verify-google-id-token),
// and Convex matches the provider domain against the token's iss exactly, so
// register both or a token with the bare spelling would be rejected.
export default {
  providers: [
    {
      domain: "https://accounts.google.com",
      applicationID: clientId,
    },
    {
      domain: "accounts.google.com",
      applicationID: clientId,
    },
  ],
};
