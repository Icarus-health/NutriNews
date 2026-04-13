-- Migration: performance indexes for feed, interactions, and onboarding checks
-- Safe to run repeatedly (IF NOT EXISTS).

-- Feed listing and pagination
create index if not exists news_cards_status_published_at_idx
  on public.news_cards(status, published_at desc);

-- Fast filtering by category and evidence in feed queries
create index if not exists news_cards_status_category_idx
  on public.news_cards(status, category_main);

create index if not exists news_cards_status_evidence_idx
  on public.news_cards(status, evidence_level);

-- Social signals (counts and user lookups)
create index if not exists likes_news_card_id_idx
  on public.likes(news_card_id);

create index if not exists likes_user_news_card_idx
  on public.likes(user_id, news_card_id);

create index if not exists bookmarks_user_news_card_idx
  on public.bookmarks(user_id, news_card_id);

-- Inbox unread lookups
create index if not exists shares_receiver_read_idx
  on public.shares(receiver_id, read);

-- Profile checks during onboarding guard
create index if not exists profiles_id_setting_idx
  on public.profiles(id, setting);
