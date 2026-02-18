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
│   ├── auth/callback/route.ts    # OAuth callback handler
│   ├── components/
│   │   ├── AddBookmarkForm.tsx    # Form to add bookmarks
│   │   ├── BookmarkList.tsx       # Real-time bookmark list
│   │   └── Navbar.tsx             # Top navigation bar
│   ├── login/page.tsx             # Login page (Google OAuth)
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Dashboard (main page)
├── lib/supabase/
│   ├── client.ts                  # Browser Supabase client
│   ├── middleware.ts              # Session refresh helper
│   └── server.ts                  # Server Supabase client
├── supabase/
│   └── schema.sql                 # Database schema + RLS policies
├── middleware.ts                   # Next.js middleware (auth guard)
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

This creates the `bookmarks` table, enables Row Level Security, and sets up real-time.

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
**Solution:** Created explicit RLS policies for `SELECT`, `INSERT`, and `DELETE` operations scoped to `auth.uid() = user_id`.

### 3. OAuth redirect loop on Vercel
**Problem:** After Google login, the user was redirected back to the login page.  
**Solution:** Ensured the `/auth/callback` route correctly exchanges the auth code for a session, and that the Next.js middleware refreshes the session cookie on every request.

### 4. URL validation
**Problem:** Users entered URLs without `https://`, causing broken links.  
**Solution:** Auto-prefixed URLs with `https://` if no protocol was provided.

### 5. Same-tab real-time sync delay
**Problem:** Newly added bookmarks didn't appear instantly in the same tab, or required manual state management which became complex.  
**Solution:** Implemented a centralized `BookmarkManager` that uses a single Supabase Realtime subscription for the entire app. Refactored the architecture to be 100% driven by Supabase broadcasts, ensuring consistency across all tabs and devices.

### 6. Redundant Supabase client creation
**Problem:** The Supabase client was being re-created on every render in components like the Navbar, causing potential memory leaks and extra connection overhead.  
**Solution:** Wrapped the client creation in `useMemo` to ensure a single instance is shared throughout the component lifecycle.

