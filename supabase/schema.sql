-- =================================================================
-- Haberry Desk - Supabase Database Schema
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gnkoxanhilpekggajdfc/sql/new
-- =================================================================

-- 1. Create Profiles Table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to automatically create a profile on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create Tasks Table (Kanban Perspective)
create table if not exists public.tasks (
  id text primary key,
  title text not null,
  description text default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority text default 'P1' check (priority in ('P0', 'P1', 'P2')),
  tag text default 'General',
  tag_color text default 'bg-blue-950/60 text-blue-300 border-blue-800/60',
  assignee text default 'Unassigned',
  github_pr text,
  subtasks text,
  user_id uuid references auth.users on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Tasks
alter table public.tasks enable row level security;

-- Policies: Authenticated users can view, create, edit, and delete their tasks
create policy "Authenticated users can view tasks"
  on public.tasks for select
  to authenticated
  using (true);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  to authenticated
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can update their tasks"
  on public.tasks for update
  to authenticated
  using (true);

create policy "Users can delete their tasks"
  on public.tasks for delete
  to authenticated
  using (auth.uid() = user_id or user_id is null);

-- 3. Seed Initial Haberry Desk Tasks
insert into public.tasks (id, title, status, priority, tag, tag_color, assignee, subtasks)
values
  ('HAB-104', 'Docker compose healthcheck & backup scripts', 'todo', 'P1', 'DevOps', 'bg-blue-950/60 text-blue-300 border-blue-800/60', 'Alex K.', '1/3'),
  ('HAB-108', 'Global shortcut G+T to navigate to Gantt timeline', 'todo', 'P2', 'UI / UX', 'bg-purple-950/60 text-purple-300 border-purple-800/60', 'Maria P.', null),
  ('HAB-112', 'Webhook signature verification using HMAC-SHA256', 'todo', 'P0', 'Security', 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60', 'David R.', '0/2'),
  ('HAB-092', 'Bi-directional GitHub webhook auto-state transitions', 'in_progress', 'P0', 'Integration', 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60', 'David R.', '4/5'),
  ('HAB-097', 'Optimistic UI updates for instant drag-and-drop', 'in_progress', 'P1', 'Frontend', 'bg-amber-950/60 text-amber-300 border-amber-800/60', 'Sarah T.', null),
  ('HAB-089', 'Model Context Protocol (MCP) server stdio bridge', 'in_review', 'P0', 'AI / MCP', 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60', 'Elena V.', '2/2'),
  ('HAB-081', 'Zero-latency SQLite and PostgreSQL hybrid storage', 'done', 'P0', 'Database', 'bg-zinc-800 text-zinc-300 border-zinc-700', 'David R.', '3/3'),
  ('HAB-085', 'Markdown spec rendering inside task modal', 'done', 'P2', 'Editor', 'bg-zinc-800 text-zinc-300 border-zinc-700', 'Maria P.', null)
on conflict (id) do nothing;

