-- ════════════════════════════════════════════════════════════════════════════
-- Supabase advisor hardening (performance + security linters)
--
-- All statements below were generated from the LIVE policy/function definitions
-- and are semantics-preserving. They have ALREADY been applied to the NutriNews
-- project (ref: xkikowmhkyperuoohzjd); this file is the source-of-truth copy for
-- the repo. Safe to re-run (idempotent where the operation allows; ALTER POLICY /
-- ALTER FUNCTION / REVOKE are naturally idempotent).
--
-- Verified after apply:
--   • unwrapped auth.uid() policies: 0
--   • functions with pinned search_path: 3
--   • new FK covering indexes: 19
--   • advisor: auth_rls_initplan / unindexed_foreign_keys / duplicate_index → cleared
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. auth_rls_initplan (0003) ──────────────────────────────────────────────
-- Wrap auth.uid() in (select auth.uid()) so Postgres evaluates it once per query
-- (initplan) instead of once per row. Identical semantics; pure scaling win.

alter policy "Admins can read feedback" on public.app_feedback
  using (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin'));

alter policy "Eigene Bookmarks" on public.bookmarks
  using ((select auth.uid()) = user_id);

alter policy "Eigene Sammlungs-Items" on public.collection_items
  using (exists (select 1 from public.collections where collections.id = collection_items.collection_id and collections.user_id = (select auth.uid())));

alter policy "Eigene Sammlungen" on public.collections
  using ((select auth.uid()) = user_id);

alter policy "Eigenen Kommentar löschen" on public.comments
  using ((select auth.uid()) = user_id);

alter policy "Kommentar erstellen" on public.comments
  with check ((select auth.uid()) = user_id);

alter policy "Like erstellen" on public.likes
  with check ((select auth.uid()) = user_id);

alter policy "Like löschen" on public.likes
  using ((select auth.uid()) = user_id);

alter policy "Admin alles translations" on public.news_card_translations
  using (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin'));

alter policy "Admin alles" on public.news_cards
  using (exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin'));

alter policy "Users manage own notes" on public.notes
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Eigenes Profil updaten" on public.profiles
  using ((select auth.uid()) = id);

alter policy "Users can delete own votes" on public.same_question_votes
  using ((select auth.uid()) = user_id);

alter policy "Users can insert own votes" on public.same_question_votes
  with check ((select auth.uid()) = user_id);

alter policy "Gesendete anzeigen" on public.shares
  using (((select auth.uid()) = sender_id) or ((select auth.uid()) = receiver_id));

alter policy "Share als gelesen markieren" on public.shares
  using ((select auth.uid()) = receiver_id);

alter policy "Share erstellen" on public.shares
  with check ((select auth.uid()) = sender_id);

-- ── 2. function_search_path_mutable (0011) ───────────────────────────────────
-- Pin a deterministic search_path. Bodies verified to reference only
-- public-resolvable objects (public.profiles / public.likes / source_health).
alter function public.handle_new_user() set search_path = public;
alter function public.upsert_source_health_batch(jsonb) set search_path = public;
alter function public.get_like_count(uuid) set search_path = public;

-- ── 3. SECURITY DEFINER exposure (0028 / 0029) ───────────────────────────────
-- These functions are only ever invoked via the service_role key (rate limiter
-- in lib/rate-limit.ts + cron upsert) or as triggers — never from the browser
-- client. Revoke direct PostgREST RPC access from anon/authenticated.
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.rls_auto_enable() from anon, authenticated;
revoke execute on function public.upsert_source_health_batch(jsonb) from anon, authenticated;
revoke execute on function public.check_rate_limit(text, integer, bigint) from anon, authenticated;
revoke execute on function public.cleanup_rate_limit_entries() from anon, authenticated;

-- ── 4. unindexed_foreign_keys (0001) ─────────────────────────────────────────
-- Add covering indexes for every foreign key flagged by the linter (additive).
create index if not exists app_feedback_user_id_idx         on public.app_feedback(user_id);
create index if not exists bookmarks_news_card_id_idx        on public.bookmarks(news_card_id);
create index if not exists card_verifications_user_id_idx    on public.card_verifications(user_id);
create index if not exists channel_members_user_id_idx       on public.channel_members(user_id);
create index if not exists channel_posts_channel_id_idx      on public.channel_posts(channel_id);
create index if not exists channel_posts_news_card_id_idx    on public.channel_posts(news_card_id);
create index if not exists channel_posts_parent_post_id_idx  on public.channel_posts(parent_post_id);
create index if not exists channel_posts_user_id_idx         on public.channel_posts(user_id);
create index if not exists collection_items_news_card_id_idx on public.collection_items(news_card_id);
create index if not exists collections_user_id_idx           on public.collections(user_id);
create index if not exists comments_user_id_idx              on public.comments(user_id);
create index if not exists news_cards_curated_by_idx         on public.news_cards(curated_by);
create index if not exists notes_news_card_id_idx            on public.notes(news_card_id);
create index if not exists quick_answers_question_id_idx     on public.quick_answers(question_id);
create index if not exists quick_answers_user_id_idx         on public.quick_answers(user_id);
create index if not exists quick_questions_user_id_idx       on public.quick_questions(user_id);
create index if not exists same_question_votes_user_id_idx   on public.same_question_votes(user_id);
create index if not exists shares_news_card_id_idx           on public.shares(news_card_id);
create index if not exists shares_sender_id_idx              on public.shares(sender_id);

-- ════════════════════════════════════════════════════════════════════════════
-- DELIBERATELY DEFERRED (NOT applied — need a product/security decision):
--
--  • multiple_permissive_policies (0006) on news_cards & news_card_translations:
--    two permissive SELECT policies ("Admin alles" + public published-read).
--    Consolidating means restructuring the admin ALL-policy — behavioural risk,
--    marginal benefit at current scale. Revisit when traffic grows.
--
--  • rls_enabled_no_policy (0008) on channels/channel_*/quick_*/card_verifications/
--    daily_briefings/rate_limit_entries: RLS on, no policy ⇒ no client access.
--    For rate_limit_entries this is CORRECT (service_role only). For the community
--    tables this may be intentional (feature gated) or a latent bug — depends on
--    whether those features are meant to be live. Needs product confirmation
--    before adding read/write policies.
--
--  • public_bucket_allows_listing (0025) on the `avatars` bucket: tightening the
--    SELECT policy could affect avatar URLs — verify storage access pattern first.
--
--  • auth_leaked_password_protection (HaveIBeenPwned): enable in the Supabase
--    Dashboard → Auth → Policies (a project setting, not SQL).
-- ════════════════════════════════════════════════════════════════════════════
