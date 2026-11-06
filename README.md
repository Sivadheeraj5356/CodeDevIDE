# CodeDevIDE

A browser IDE that turns a written prompt into a running React project. You describe what you want, Gemini writes the files, and the result opens in an editor with a live preview — no local setup, no build step.

Live at [codedevai.vercel.app](https://codedevai.vercel.app).

## How it works

You sign in with Google and type a prompt on the landing page. That creates a workspace record in Convex and moves you to `/workspace/<id>`, where two things happen in parallel:

- `ChatView` posts the conversation to `/api/ai-chat`, which asks Gemini for a short plan and appends the reply to the workspace.
- `CodeView` posts the same conversation plus the code-generation prompt to `/api/gen-ai-code`, which asks Gemini for the whole project as JSON: a title, an explanation, and a `files` map of paths to source code.

The returned files are merged over a default template and handed to Sandpack, which bundles and runs them in the browser. They are also saved back to the workspace, so reopening it restores your project instead of regenerating it.

Both API routes run server-side so the Gemini key never reaches the browser.

## Stack

Next.js 15 (App Router, JavaScript), Tailwind CSS with shadcn/ui primitives, Convex for the database and queries, Google OAuth through `@react-oauth/google`, Gemini via `@google/generative-ai`, and Sandpack for the editor and preview.

## Running it locally

You need Node 18+, a Convex account, a Gemini API key, and a Google OAuth client.

```bash
npm install
npx convex dev     # first run links the project and pushes convex/ functions
npm run dev
```

Create `.env.local`:

```bash
# Convex - written by `npx convex dev`
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Google OAuth web client id
NEXT_PUBLIC_GOOGLE_AUTH_KEY=xxxxx.apps.googleusercontent.com

# Gemini - server only, do not prefix with NEXT_PUBLIC_
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.5-flash
```

Convex functions live in `convex/` and are deployed separately from the Next.js app. After changing anything in there, run `npx convex dev --once` (or `npx convex deploy` for production) or the running deployment keeps the old code.

## Layout

```
app/
  page.js                     landing page
  (main)/workspace/[id]/      the IDE: chat on the left, editor and preview on the right
  api/ai-chat/                Gemini chat reply
  api/gen-ai-code/            Gemini project generation, returns JSON
  Provider.jsx                auth bootstrap and the shared contexts
components/custom/            ChatView, CodeView, SandpackPreviewClient, Header, sidebar
configs/AiGeminiModel.js      model config and per-request chat sessions
convex/                       schema plus user and workspace functions
data/Prompt.jsx               the system prompts sent to Gemini
data/LookUp.jsx               default Sandpack files and dependencies
```

## Deploying

Push to Vercel and set `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_GOOGLE_AUTH_KEY`, `GEMINI_API_KEY` and `GEMINI_MODEL` in the project's environment variables, then run `npx convex deploy` so the production Convex deployment has the current functions. Add the deployed domain to the OAuth client's authorized origins too.

`vercel.json` raises the timeout on `/api/gen-ai-code` to 60 seconds. Generating a full project usually takes 25 to 45 seconds, so that ceiling is real: very elaborate prompts can hit it. Trimming `CODE_GEN_PROMPT` in `data/Prompt.jsx` is the cheapest way to speed things up, since it currently asks for a header, navbar, footer, dashboard, routing and a dark mode toggle on every single generation.

## Authentication and access control

Sign-in uses Google's OIDC credential flow: the client receives a Google ID
token (a signed JWT), and both the Convex backend and the paid Next.js API
routes verify that token server-side. There is no client-side session state
that the backend trusts.

- `convex/auth.config.js` registers Google as the OIDC provider (issuer
  `https://accounts.google.com`, audience = the OAuth web client ID). It ships
  with the current client ID as a default. `GOOGLE_CLIENT_ID` must also be
  set on the Convex deployment itself (Convex dashboard -> deployment
  Settings -> Environment Variables): `convex deploy` fails with "used in
  auth config file but its value was not set" otherwise, because it does not
  read the in-file default. Set it to the same public client ID.
- Every Convex function in `convex/users.js` and `convex/workspace.js`
  requires the verified identity (`ctx.auth.getUserIdentity()`) and enforces
  workspace ownership. Clients never send an email or user id for themselves.
- `/api/ai-chat` and `/api/gen-ai-code` require `Authorization: Bearer <id
  token>` and verify it locally against Google's public JWKS (signature,
  issuer, audience, expiry, per Google's production guidance) before any
  model call (`lib/server-auth.js`), so anonymous traffic cannot spend the
  Gemini quota. No cookies are used, so there is no CSRF surface.
- The client session (`lib/session.js`) is the ID token plus its claims. The
  old unsigned `localStorage["user"]` profile is deleted on load and on
  sign-in. ID tokens expire after about an hour; when a session expires the
  user signs in again.

Deploying these changes requires both halves: `npx convex deploy` (pushes
`auth.config.js` and the guarded functions) and the Vercel redeploy of the
Next app. Deploying only one breaks sign-in: the new client no longer sends
the `email`/`userId` arguments the old backend functions required.

Tests: `npm test` covers token handling (`lib/__tests__/session.test.js`),
Google token verification failures (`lib/__tests__/server-auth.test.js`), the
anonymous-request gate on both AI routes
(`lib/__tests__/api-routes-auth.test.js`), and the full backend authorization
contract (anonymous rejected everywhere, cross-user read/write/list blocked,
owner allowed) in `convex-tests/authz.test.js` via `convex-test`.
