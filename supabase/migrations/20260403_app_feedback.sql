-- Migration: app_feedback table
-- Run this in the Supabase SQL editor to enable the in-app feedback feature.

create table if not exists public.app_feedback (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete set null,
  type        text not null check (type in ('bug', 'verbesserung', 'lob', 'sonstiges')),
  message     text not null,
  created_at  timestamptz default now() not null
);

-- Row-level security
alter table public.app_feedback enable row level security;

-- Any authenticated (or anonymous) user can submit feedback
create policy "Anyone can submit feedback"
  on public.app_feedback
  for insert
  with check (true);

-- Only admins can read feedback
create policy "Admins can read feedback"
  on public.app_feedback
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
