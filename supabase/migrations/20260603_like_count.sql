-- Denormalize like_count onto news_cards to eliminate the "fetch all like rows
-- and count them in application code" pattern in the feed (page.tsx / loadMoreCards).
-- Counting was O(total likes per visible card) on every feed render; this makes it O(1).
-- Fully idempotent — safe to run repeatedly.

-- 1. Counter column
alter table public.news_cards
  add column if not exists like_count integer not null default 0;

-- 2. Trigger function — SECURITY DEFINER so it can update news_cards despite the
--    admin-only UPDATE RLS policy. Fixed search_path (satisfies linter 0011).
create or replace function public.sync_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.news_cards
      set like_count = like_count + 1
      where id = new.news_card_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.news_cards
      set like_count = greatest(like_count - 1, 0)
      where id = old.news_card_id;
    return old;
  end if;
  return null;
end;
$$;

-- 3. Triggers (drop-and-recreate for idempotency)
drop trigger if exists trg_likes_sync_count_ins on public.likes;
create trigger trg_likes_sync_count_ins
  after insert on public.likes
  for each row execute function public.sync_like_count();

drop trigger if exists trg_likes_sync_count_del on public.likes;
create trigger trg_likes_sync_count_del
  after delete on public.likes
  for each row execute function public.sync_like_count();

-- 4. One-time backfill from existing likes
update public.news_cards nc
  set like_count = coalesce(sub.cnt, 0)
  from (
    select news_card_id, count(*)::int as cnt
    from public.likes
    group by news_card_id
  ) sub
  where sub.news_card_id = nc.id;
