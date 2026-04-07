-- Migration: notes table (geräteübergreifende Notizen)
-- Run this in the Supabase SQL editor.

create table if not exists public.notes (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  news_card_id  uuid not null references public.news_cards(id) on delete cascade,
  content       text not null default '',
  updated_at    timestamptz default now() not null,
  unique(user_id, news_card_id)
);

alter table public.notes enable row level security;

-- Users can only read and write their own notes
create policy "Users manage own notes"
  on public.notes
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast lookups per user
create index if not exists notes_user_id_idx on public.notes(user_id);
