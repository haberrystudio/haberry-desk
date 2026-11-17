-- =================================================================
-- Haberry Desk - Complete Database Schema (Idempotent & Re-runnable)
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gnkoxanhilpekggajdfc/sql/new
-- =================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------
-- 1. Profiles Table (extends auth.users)
-- -----------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view all profiles" on public.profiles;
create policy "Users can view all profiles"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------
-- Clean up any previous / template task & workspace tables
-- (Prevents ERROR 42703 if an older tasks table was present in Supabase)
-- -----------------------------------------------------------------
drop table if exists public.task_activities cascade;
drop table if exists public.task_relations cascade;
drop table if exists public.subtasks cascade;
drop table if exists public.tasks cascade;
drop table if exists public.workspace_invitations cascade;
drop table if exists public.workspace_members cascade;
drop table if exists public.projects cascade;
drop table if exists public.workspaces cascade;

-- -----------------------------------------------------------------
-- 2. Workspaces Table
-- -----------------------------------------------------------------
create table public.workspaces (
  id text primary key,
  name text not null,
  description text default '',
  plan text default 'free',
  owner_id uuid references auth.users on delete cascade,
  members_type text default 'team',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure column exists if upgrading existing workspaces table
alter table public.workspaces add column if not exists description text default '';

alter table public.workspaces enable row level security;

drop policy if exists "Authenticated users can view workspaces" on public.workspaces;
create policy "Authenticated users can view workspaces"
  on public.workspaces for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can create workspaces" on public.workspaces;
create policy "Authenticated users can create workspaces"
  on public.workspaces for insert
  to authenticated
  with check (auth.uid() = owner_id or owner_id is null);

drop policy if exists "Owners and admins can update workspaces" on public.workspaces;
create policy "Owners and admins can update workspaces"
  on public.workspaces for update
  to authenticated
  using (true);

-- -----------------------------------------------------------------
-- 3. Projects Table
-- -----------------------------------------------------------------
create table public.projects (
  id text primary key,
  workspace_id text references public.workspaces(id) on delete cascade,
  name text not null,
  prefix text not null default 'HAB',
  icon text default 'layout',
  description text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure column exists if upgrading existing projects table
alter table public.projects add column if not exists icon text default 'layout';

alter table public.projects enable row level security;

drop policy if exists "Authenticated users can view projects" on public.projects;
create policy "Authenticated users can view projects"
  on public.projects for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can create projects" on public.projects;
create policy "Authenticated users can create projects"
  on public.projects for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update projects" on public.projects;
create policy "Authenticated users can update projects"
  on public.projects for update
  to authenticated
  using (true);

-- -----------------------------------------------------------------
-- 4. Workspace Members Table
-- -----------------------------------------------------------------
create table public.workspace_members (
  id uuid default uuid_generate_v4() primary key,
  workspace_id text references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users on delete cascade,
  email text not null,
  name text default 'Member',
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  project_access text default 'all',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workspace_members enable row level security;

drop policy if exists "Members can view workspace members" on public.workspace_members;
create policy "Members can view workspace members"
  on public.workspace_members for select
  to authenticated
  using (true);

drop policy if exists "Owners and admins can manage members" on public.workspace_members;
create policy "Owners and admins can manage members"
  on public.workspace_members for all
  to authenticated
  using (true);

-- -----------------------------------------------------------------
-- 5. Tasks Table (Supports 4 Kanban Columns: todo, in_progress, in_review, done)
-- -----------------------------------------------------------------
create table public.tasks (
  id text primary key,
  workspace_id text references public.workspaces(id) on delete cascade,
  project_id text references public.projects(id) on delete cascade,
  title text not null,
  description text default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority text default 'none' check (priority in ('none', 'low', 'medium', 'high', 'urgent')),
  assignee_id uuid references auth.users on delete set null,
  assignee_name text default 'Unassigned',
  start_date text,
  due_date text,
  labels jsonb default '[]'::jsonb,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks enable row level security;

drop policy if exists "Authenticated users can view tasks" on public.tasks;
create policy "Authenticated users can view tasks"
  on public.tasks for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert tasks" on public.tasks;
create policy "Authenticated users can insert tasks"
  on public.tasks for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update tasks" on public.tasks;
create policy "Authenticated users can update tasks"
  on public.tasks for update
  to authenticated
  using (true);

drop policy if exists "Authenticated users can delete tasks" on public.tasks;
create policy "Authenticated users can delete tasks"
  on public.tasks for delete
  to authenticated
  using (true);

-- -----------------------------------------------------------------
-- 6. Subtasks Table
-- -----------------------------------------------------------------
create table public.subtasks (
  id text primary key default concat('sub-', substr(md5(random()::text), 1, 8)),
  task_id text references public.tasks(id) on delete cascade,
  title text not null,
  completed boolean default false,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subtasks enable row level security;

drop policy if exists "Authenticated users can manage subtasks" on public.subtasks;
create policy "Authenticated users can manage subtasks"
  on public.subtasks for all
  to authenticated
  using (true);

-- -----------------------------------------------------------------
-- 7. Task Relations Table
-- -----------------------------------------------------------------
create table public.task_relations (
  id text primary key default concat('rel-', substr(md5(random()::text), 1, 8)),
  task_id text references public.tasks(id) on delete cascade,
  related_task_id text references public.tasks(id) on delete cascade,
  relation_type text default 'related' check (relation_type in ('related', 'blocks', 'blocked_by')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.task_relations enable row level security;

drop policy if exists "Authenticated users can manage task relations" on public.task_relations;
create policy "Authenticated users can manage task relations"
  on public.task_relations for all
  to authenticated
  using (true);

-- -----------------------------------------------------------------
-- 8. Task Activities Table
-- -----------------------------------------------------------------
create table public.task_activities (
  id text primary key default concat('act-', substr(md5(random()::text), 1, 8)),
  task_id text references public.tasks(id) on delete cascade,
  user_id uuid references auth.users on delete set null,
  author text not null default 'Haberry Studio',
  action text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.task_activities enable row level security;

drop policy if exists "Authenticated users can view activities" on public.task_activities;
create policy "Authenticated users can view activities"
  on public.task_activities for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert activities" on public.task_activities;
create policy "Authenticated users can insert activities"
  on public.task_activities for insert
  to authenticated
  with check (true);

-- -----------------------------------------------------------------
-- 9. Workspace Invitations Table
-- -----------------------------------------------------------------
create table public.workspace_invitations (
  id text primary key default concat('inv-', substr(md5(random()::text), 1, 10)),
  workspace_id text references public.workspaces(id) on delete cascade,
  workspace_name text not null,
  inviter_id uuid references auth.users on delete set null,
  inviter_name text not null default 'Haberry Studio',
  email text not null,
  role text default 'member' check (role in ('admin', 'member', 'viewer')),
  project_access text default 'all',
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  expires_at timestamp with time zone default (now() + interval '7 days') not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workspace_invitations enable row level security;

drop policy if exists "Anyone can read invitation by id" on public.workspace_invitations;
create policy "Anyone can read invitation by id"
  on public.workspace_invitations for select
  using (true);

drop policy if exists "Authenticated users can insert invitations" on public.workspace_invitations;
create policy "Authenticated users can insert invitations"
  on public.workspace_invitations for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update invitations" on public.workspace_invitations;
create policy "Authenticated users can update invitations"
  on public.workspace_invitations for update
  using (true);

-- -----------------------------------------------------------------
-- 10. Default Seed Workspace & Initial Tasks
-- -----------------------------------------------------------------
insert into public.workspaces (id, name, plan, members_type)
values ('haberry-desk', 'Haberry', 'free', 'team')
on conflict (id) do nothing;

insert into public.projects (id, workspace_id, name, prefix, description)
values ('haberry-desk-proj', 'haberry-desk', 'Haberry-Desk', 'HAB', 'Primary workspace board')
on conflict (id) do nothing;

insert into public.tasks (id, workspace_id, project_id, title, description, status, priority, assignee_name)
values
  ('HAB-5', 'haberry-desk', 'haberry-desk-proj', 'Create your own task', 'Use the + next to a column name, or press T then C. Delete these starter tasks whenever you''re ready.', 'todo', 'none', 'Haberry Studio'),
  ('HAB-6', 'haberry-desk', 'haberry-desk-proj', 'dfgh', 'Configure relations and subtasks.', 'done', 'none', 'Haberry Studio'),
  ('HAB-7', 'haberry-desk', 'haberry-desk-proj', 'cvbnm', 'Review completed tasks and sprint progress.', 'done', 'none', 'Haberry Studio')
on conflict (id) do nothing;

insert into public.task_relations (task_id, related_task_id, relation_type)
values ('HAB-5', 'HAB-6', 'related')
on conflict (id) do nothing;

insert into public.task_activities (task_id, author, action)
values
  ('HAB-5', 'Haberry Studio', 'created this task · 2 days ago'),
  ('HAB-5', 'Haberry Studio', 'assigned the task to themselves · 2 days ago'),
  ('HAB-5', 'Haberry Studio', 'changed status from To Do to In Progress · 2 days ago'),
  ('HAB-5', 'Haberry Studio', 'changed status from In Progress to To Do · 2 days ago')
on conflict (id) do nothing;
