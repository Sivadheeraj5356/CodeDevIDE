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
