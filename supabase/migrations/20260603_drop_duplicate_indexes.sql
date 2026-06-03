-- Supabase advisor 0009 (duplicate_index): each pair below is identical.
-- Dropping the redundant copy removes write/storage overhead with no read impact.
-- Safe & reversible — an identical index remains in place.

drop index if exists public.idx_news_cards_published;   -- keep idx_news_cards_status_published
drop index if exists public.idx_comments_card;          -- keep idx_comments_news_card
