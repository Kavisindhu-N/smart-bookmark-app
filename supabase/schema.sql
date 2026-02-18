-- Smart Bookmark App — Supabase Schema
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Create bookmarks table
create table if not exists public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.bookmarks enable row level security;

-- 3. RLS Policies — each user can only access their own bookmarks
create policy "Users can view own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- 4. Set replica identity to FULL (required for DELETE events to include old row data)
alter table public.bookmarks replica identity full;

-- 5. Grant select permissions for realtime
grant select on public.bookmarks to anon, authenticated;

-- 6. Enable Realtime for this table
-- Go to Supabase Dashboard > Database > Replication
-- and enable the "bookmarks" table for realtime,
-- OR run:
alter publication supabase_realtime add table public.bookmarks;
