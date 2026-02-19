# Smart Bookmark App

A real-time bookmark manager built with **Next.js (App Router)**, **Supabase** (Auth, Database, Realtime), and **Tailwind CSS**.

## Features

- **Google OAuth** — Sign up and log in with your Google account
- **Add bookmarks** — Save a URL with a title
- **Private bookmarks** — Each user only sees their own bookmarks
- **Real-time sync** — Bookmarks update live across tabs (no page refresh needed)
- **Delete bookmarks** — Remove bookmarks you no longer need
- **Deployed on Vercel** — Available at a live URL

## Tech Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Frontend   | Next.js 16 (App Router)          |
| Styling    | Tailwind CSS v4                   |
| Auth       | Supabase Auth (Google OAuth)      |
| Database   | Supabase PostgreSQL               |
| Realtime   | Supabase Realtime                 |
| Deployment | Vercel                            |

## Project Structure

```
smart-bookmark-app/
├── app/
│   ├── auth/callback/route.ts     # OAuth callback — exchanges code for session
│   ├── login/page.tsx             # Login page (Google OAuth)
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout (font, metadata)
│   └── page.tsx                   # Dashboard (server component, auth guard)
├── components/
│   ├── AddBookmarkForm.tsx        # Form to add bookmarks
│   ├── BookmarkList.tsx           # Filtered, searchable bookmark list
│   ├── BookmarkManager.tsx        # State + real-time subscription hub
│   ├── MobileAddBookmark.tsx      # FAB modal for mobile
│   └── Navbar.tsx                 # Top navigation with sign out
├── lib/
│   ├── types.ts                   # Shared TypeScript interfaces
│   └── supabase/
│       ├── client.ts              # Browser Supabase client
│       ├── middleware.ts          # Session refresh helper (used by proxy.ts)
│       └── server.ts             # Server-side Supabase client
├── supabase/
│   └── schema.sql                 # Database schema + RLS policies
├── proxy.ts                       # Next.js 16 auth guard (runs on every request)
├── next.config.ts                 # Turbopack config
└── package.json
```

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/Kavisindhu-N/smart-bookmark-app.git
cd smart-bookmark-app
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Copy the **Project URL** and **anon public key** from **Settings → API**.

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up the Database

1. Go to **SQL Editor** in Supabase Dashboard.
2. Paste and run the contents of `supabase/schema.sql`.

This creates the `bookmarks` table, enables Row Level Security, and configures real-time replication.

### 5. Enable Google OAuth

1. In Supabase Dashboard, go to **Authentication → Providers → Google**.
2. Enable Google and fill in your Google OAuth **Client ID** and **Client Secret**.
3. Get these from [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Create an OAuth 2.0 Client ID (Web application type)
   - Add the Supabase callback URL as an authorized redirect URI:
     `https://your-project.supabase.co/auth/v1/callback`

### 6. Enable Realtime

1. In Supabase Dashboard, go to **Database → Replication**.
2. Enable the `bookmarks` table for realtime updates.
   _(The schema.sql already runs the `alter publication` command, but verify it's active.)_

### 7. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Vercel's project settings.
4. Deploy.

> **Important:** After deploying, add your Vercel URL to the Google OAuth authorized redirect URIs:
> `https://your-project.supabase.co/auth/v1/callback`

## Problems Encountered & Solutions

### 1. Real-time subscription not receiving events
**Problem:** After adding a bookmark, the other tab didn't update.
**Solution:** Enabled the `bookmarks` table in Supabase Replication settings and added `alter publication supabase_realtime add table public.bookmarks;` to the schema SQL.

### 2. Row Level Security blocking queries
**Problem:** After enabling RLS, all bookmark queries returned empty.
**Solution:** Created explicit RLS policies for `SELECT`, `INSERT`, and `DELETE` scoped to `auth.uid() = user_id`, enforcing privacy at the database level regardless of how the API is called.

### 3. OAuth redirect loop on Vercel
**Problem:** After Google login, the user was redirected back to the login page.
**Solution:** Ensured the `/auth/callback` route correctly exchanges the auth code for a session cookie, and that `proxy.ts` (Next.js 16's middleware convention) refreshes the session on every request via `updateSession`.

### 4. URL validation
**Problem:** Users entered URLs without `https://`, causing broken links.
**Solution:** Auto-prefixed URLs with `https://` if no protocol was provided, then validated the result with `new URL()` before inserting.

### 5. Same-tab real-time sync delay
**Problem:** Newly added bookmarks didn't appear instantly, and client-side state management became complex.
**Solution:** Implemented a centralised `BookmarkManager` component that owns a single Supabase Realtime subscription for the entire session. All state is driven exclusively by WebSocket events, ensuring consistency across all tabs.

### 6. Redundant Supabase client creation
**Problem:** The Supabase client was re-created on every render, causing extra connection overhead.
**Solution:** Wrapped client creation in `useMemo` so a single instance is reused throughout the component lifecycle.

### 7. Next.js 16 breaking changes
**Problem:** Next.js 16 ships with Turbopack by default and renamed `middleware.ts` to `proxy.ts`. The project initially had a stale `proxy.ts` (dead code) and the active auth guard in `middleware.ts`, causing a deprecation warning and the session middleware being skipped entirely.
**Solution:** Removed the dead file, renamed the active guard to `proxy.ts` with the correct `proxy` function export, and added `turbopack: { root: __dirname }` to `next.config.ts` to fix Turbopack incorrectly detecting a parent directory's `package-lock.json` as the workspace root.

### 8. Webpack module resolution conflict
**Problem:** A `package.json` in a parent directory (`/home/kavi/`) caused Turbopack to look for `tailwindcss` in the wrong `node_modules`, printing continuous resolution errors.
**Solution:** Setting `turbopack.root` in `next.config.ts` to the project directory explicitly anchors all module resolution to the correct location.
