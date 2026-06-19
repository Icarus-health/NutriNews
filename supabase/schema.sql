-- ════════════════════════════════════════════════════════════════════════════
-- NutriNews — Basis-Schema (Snapshot der Live-Datenbank, Stand 2026-06-13)
--
-- Bisher lag nur eine Reihe dated Migrationen unter supabase/migrations/ vor,
-- aber NICHT das Basis-Schema der Kerntabellen (news_cards, profiles, likes,
-- comments, shares, channels …). Diese Datei dokumentiert den Ist-Zustand
-- vollständig und versioniert ihn — direkt aus der Live-DB generiert.
--
-- Setup-Reihenfolge für ein frisches Projekt:
--   1) dieses schema.sql ausführen (Tabellen, Constraints, RLS-Policies)
--   2) anschließend die dated Migrationen aus supabase/migrations/ einspielen
--      (Funktionen/Trigger wie handle_new_user, sync_like_count,
--      upsert_source_health_batch, check_rate_limit sowie Performance-Indizes
--      werden dort definiert)
--
-- Hinweis: RLS ist auf allen Tabellen aktiv. Tabellen ohne Policy sind bewusst
-- service-role-only (rate_limit_entries).
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Enums ───────────────────────────────────────────────────────────────────
do $$ begin
  create type evidence_level as enum (
    'Meta-Analyse', 'Systematische Review', 'RCT', 'Kohortenstudie',
    'Fallstudie', 'Expertenmeinung', 'Laienpresse/Trend'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type news_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

-- ── Tabellen ────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid not null,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'therapist'::text,
  specialties text[] default '{}'::text[],
  preferred_categories text[] default '{}'::text[],
  notify_new_news boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  setting text,
  alias text,
  language text not null default 'de'::text
);

create table if not exists public.news_cards (
  id uuid not null default uuid_generate_v4(),
  headline text not null,
  snack_what text not null,
  snack_result text not null,
  snack_consequence text not null,
  therapist_check text not null,
  read_time_sec integer not null default 45,
  source_url text not null,
  source_name text,
  category_main text not null,
  subcategories text[] default '{}'::text[],
  evidence_level evidence_level not null default 'Expertenmeinung'::evidence_level,
  status news_status not null default 'draft'::news_status,
  curated_by uuid,
  curated_by_agent boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  practice_relevance_score integer,
  action_recommendation text,
  patient_question_anticipation text,
  evidence_summary text,
  source_type text default 'forschung'::text,
  lay_press_fact_check text,
  policy_impact text,
  policy_action_needed text,
  international_relevance_de text,
  doi text,
  pubmed_id text,
  kernbotschaft text,
  like_count integer not null default 0
);

create table if not exists public.news_card_translations (
  news_card_id uuid not null,
  lang text not null,
  kernbotschaft text,
  headline text,
  snack_what text,
  snack_result text,
  snack_consequence text,
  therapist_check text,
  action_recommendation text,
  patient_question_anticipation text,
  evidence_summary text,
  lay_press_fact_check text,
  policy_action_needed text,
  international_relevance_de text,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  user_id uuid not null,
  news_card_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  user_id uuid not null,
  news_card_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid not null default uuid_generate_v4(),
  news_card_id uuid not null,
  user_id uuid not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.shares (
  id uuid not null default uuid_generate_v4(),
  sender_id uuid not null,
  receiver_id uuid,
  receiver_email text,
  news_card_id uuid not null,
  message text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid not null default uuid_generate_v4(),
  user_id uuid not null,
  name text not null,
  emoji text default '📁'::text,
  created_at timestamptz not null default now()
);

create table if not exists public.collection_items (
  collection_id uuid not null,
  news_card_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  news_card_id uuid not null,
  content text not null default ''::text,
  updated_at timestamptz not null default now()
);

create table if not exists public.channels (
  id uuid not null default gen_random_uuid(),
  slug text not null,
  name text not null,
  description text default ''::text,
  emoji text default '💬'::text,
  created_at timestamptz not null default now(),
  is_private boolean not null default false,
  created_by uuid default auth.uid()
);

create table if not exists public.channel_members (
  channel_id uuid not null,
  user_id uuid not null,
  joined_at timestamptz not null default now()
);

create table if not exists public.channel_posts (
  id uuid not null default gen_random_uuid(),
  channel_id uuid,
  user_id uuid,
  body text not null,
  news_card_id uuid,
  parent_post_id uuid,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create table if not exists public.quick_questions (
  id uuid not null default gen_random_uuid(),
  user_id uuid,
  category text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quick_answers (
  id uuid not null default gen_random_uuid(),
  question_id uuid,
  user_id uuid,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.same_question_votes (
  question_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.card_verifications (
  id uuid not null default gen_random_uuid(),
  news_card_id uuid,
  user_id uuid,
  verification_type text not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  actor_id uuid,
  type text not null,
  channel_id uuid,
  question_id uuid,
  post_id uuid,
  preview text not null default ''::text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_briefings (
  id uuid not null default gen_random_uuid(),
  date date not null,
  items jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.app_feedback (
  id uuid not null default gen_random_uuid(),
  user_id uuid,
  type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.source_health (
  source_name text not null,
  source_type text not null,
  items_last_run integer not null default 0,
  error_last_run text,
  last_checked_at timestamptz not null default now(),
  consecutive_failures integer not null default 0,
  total_checks integer not null default 0,
  total_failures integer not null default 0,
  disabled boolean not null default false
);

create table if not exists public.rate_limit_entries (
  key text not null,
  count integer not null default 1,
  reset_at timestamptz not null
);

-- ── Primärschlüssel & Unique-Constraints ────────────────────────────────────
alter table public.profiles add constraint profiles_pkey primary key (id);
alter table public.news_cards add constraint news_cards_pkey primary key (id);
alter table public.news_card_translations add constraint news_card_translations_pkey primary key (news_card_id, lang);
alter table public.likes add constraint likes_pkey primary key (user_id, news_card_id);
alter table public.bookmarks add constraint bookmarks_pkey primary key (user_id, news_card_id);
alter table public.comments add constraint comments_pkey primary key (id);
alter table public.shares add constraint shares_pkey primary key (id);
alter table public.collections add constraint collections_pkey primary key (id);
alter table public.collection_items add constraint collection_items_pkey primary key (collection_id, news_card_id);
alter table public.notes add constraint notes_pkey primary key (id);
alter table public.notes add constraint notes_user_id_news_card_id_key unique (user_id, news_card_id);
alter table public.channels add constraint channels_pkey primary key (id);
alter table public.channels add constraint channels_slug_key unique (slug);
alter table public.channel_members add constraint channel_members_pkey primary key (channel_id, user_id);
alter table public.channel_posts add constraint channel_posts_pkey primary key (id);
alter table public.quick_questions add constraint quick_questions_pkey primary key (id);
alter table public.quick_answers add constraint quick_answers_pkey primary key (id);
alter table public.same_question_votes add constraint same_question_votes_pkey primary key (question_id, user_id);
alter table public.card_verifications add constraint card_verifications_pkey primary key (id);
alter table public.card_verifications add constraint card_verifications_news_card_id_user_id_verification_type_key unique (news_card_id, user_id, verification_type);
alter table public.notifications add constraint notifications_pkey primary key (id);
alter table public.daily_briefings add constraint daily_briefings_pkey primary key (id);
alter table public.daily_briefings add constraint daily_briefings_date_key unique (date);
alter table public.app_feedback add constraint app_feedback_pkey primary key (id);
alter table public.source_health add constraint source_health_pkey primary key (source_name);
alter table public.rate_limit_entries add constraint rate_limit_entries_pkey primary key (key);

-- ── Check-Constraints ───────────────────────────────────────────────────────
alter table public.profiles add constraint profiles_role_check check ((role = any (array['therapist'::text, 'admin'::text])));
alter table public.app_feedback add constraint app_feedback_type_check check ((type = any (array['bug'::text, 'verbesserung'::text, 'lob'::text, 'sonstiges'::text, 'report'::text])));
alter table public.notifications add constraint notifications_type_check check ((type = any (array['quick_answer'::text, 'channel_reply'::text])));

-- ── Foreign Keys ────────────────────────────────────────────────────────────
alter table public.profiles add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;
alter table public.news_cards add constraint news_cards_curated_by_fkey foreign key (curated_by) references profiles(id) on delete set null;
alter table public.news_card_translations add constraint news_card_translations_news_card_id_fkey foreign key (news_card_id) references news_cards(id) on delete cascade;
alter table public.likes add constraint likes_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
alter table public.likes add constraint likes_news_card_id_fkey foreign key (news_card_id) references news_cards(id) on delete cascade;
alter table public.bookmarks add constraint bookmarks_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
alter table public.bookmarks add constraint bookmarks_news_card_id_fkey foreign key (news_card_id) references news_cards(id) on delete cascade;
alter table public.comments add constraint comments_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
alter table public.comments add constraint comments_news_card_id_fkey foreign key (news_card_id) references news_cards(id) on delete cascade;
alter table public.shares add constraint shares_sender_id_fkey foreign key (sender_id) references profiles(id) on delete cascade;
alter table public.shares add constraint shares_receiver_id_fkey foreign key (receiver_id) references profiles(id) on delete cascade;
alter table public.shares add constraint shares_news_card_id_fkey foreign key (news_card_id) references news_cards(id) on delete cascade;
alter table public.collections add constraint collections_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
alter table public.collection_items add constraint collection_items_collection_id_fkey foreign key (collection_id) references collections(id) on delete cascade;
alter table public.collection_items add constraint collection_items_news_card_id_fkey foreign key (news_card_id) references news_cards(id) on delete cascade;
alter table public.notes add constraint notes_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
alter table public.notes add constraint notes_news_card_id_fkey foreign key (news_card_id) references news_cards(id) on delete cascade;
alter table public.channels add constraint channels_created_by_fkey foreign key (created_by) references profiles(id) on delete set null;
alter table public.channel_members add constraint channel_members_channel_id_fkey foreign key (channel_id) references channels(id) on delete cascade;
alter table public.channel_members add constraint channel_members_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
alter table public.channel_posts add constraint channel_posts_channel_id_fkey foreign key (channel_id) references channels(id) on delete cascade;
alter table public.channel_posts add constraint channel_posts_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
alter table public.channel_posts add constraint channel_posts_news_card_id_fkey foreign key (news_card_id) references news_cards(id);
alter table public.channel_posts add constraint channel_posts_parent_post_id_fkey foreign key (parent_post_id) references channel_posts(id);
alter table public.quick_questions add constraint quick_questions_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
alter table public.quick_answers add constraint quick_answers_question_id_fkey foreign key (question_id) references quick_questions(id) on delete cascade;
alter table public.quick_answers add constraint quick_answers_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
alter table public.same_question_votes add constraint same_question_votes_question_id_fkey foreign key (question_id) references quick_questions(id) on delete cascade;
alter table public.same_question_votes add constraint same_question_votes_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
alter table public.card_verifications add constraint card_verifications_news_card_id_fkey foreign key (news_card_id) references news_cards(id) on delete cascade;
alter table public.card_verifications add constraint card_verifications_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
alter table public.notifications add constraint notifications_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
alter table public.notifications add constraint notifications_actor_id_fkey foreign key (actor_id) references profiles(id) on delete set null;
alter table public.notifications add constraint notifications_channel_id_fkey foreign key (channel_id) references channels(id) on delete cascade;
alter table public.notifications add constraint notifications_question_id_fkey foreign key (question_id) references quick_questions(id) on delete cascade;
alter table public.notifications add constraint notifications_post_id_fkey foreign key (post_id) references channel_posts(id) on delete cascade;
alter table public.app_feedback add constraint app_feedback_user_id_fkey foreign key (user_id) references profiles(id) on delete set null;

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.news_cards enable row level security;
alter table public.news_card_translations enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.comments enable row level security;
alter table public.shares enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.notes enable row level security;
alter table public.channels enable row level security;
alter table public.channel_members enable row level security;
alter table public.channel_posts enable row level security;
alter table public.quick_questions enable row level security;
alter table public.quick_answers enable row level security;
alter table public.same_question_votes enable row level security;
alter table public.card_verifications enable row level security;
alter table public.notifications enable row level security;
alter table public.daily_briefings enable row level security;
alter table public.app_feedback enable row level security;
alter table public.source_health enable row level security;
alter table public.rate_limit_entries enable row level security;

-- ── Policies ────────────────────────────────────────────────────────────────
-- profiles
create policy "Profile suchen" on public.profiles for select to authenticated using (true);
create policy "Eigenes Profil updaten" on public.profiles for update to public using ((select auth.uid()) = id);

-- news_cards
create policy "Alle lesen published news" on public.news_cards for select to public using (status = 'published'::news_status);
create policy "Admin alles" on public.news_cards for all to public using (exists (select 1 from profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin'::text));

-- news_card_translations
create policy "Alle lesen Uebersetzungen published" on public.news_card_translations for select to public using (exists (select 1 from news_cards c where c.id = news_card_translations.news_card_id and c.status = 'published'::news_status));
create policy "Admin alles translations" on public.news_card_translations for all to public using (exists (select 1 from profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin'::text));

-- likes
create policy "Alle Likes zaehlen" on public.likes for select to authenticated using (true);
create policy "Like erstellen" on public.likes for insert to public with check ((select auth.uid()) = user_id);
create policy "Like löschen" on public.likes for delete to public using ((select auth.uid()) = user_id);

-- bookmarks
create policy "Eigene Bookmarks" on public.bookmarks for all to public using ((select auth.uid()) = user_id);

-- comments
create policy "Kommentare lesen" on public.comments for select to public using (true);
create policy "Kommentar erstellen" on public.comments for insert to public with check ((select auth.uid()) = user_id);
create policy "Eigenen Kommentar löschen" on public.comments for delete to public using ((select auth.uid()) = user_id);

-- shares
create policy "Gesendete anzeigen" on public.shares for select to public using (((select auth.uid()) = sender_id) or ((select auth.uid()) = receiver_id));
create policy "Share erstellen" on public.shares for insert to public with check ((select auth.uid()) = sender_id);
create policy "Share als gelesen markieren" on public.shares for update to public using ((select auth.uid()) = receiver_id);

-- collections / collection_items
create policy "Eigene Sammlungen" on public.collections for all to public using ((select auth.uid()) = user_id);
create policy "Eigene Sammlungs-Items" on public.collection_items for all to public using (exists (select 1 from collections where collections.id = collection_items.collection_id and collections.user_id = (select auth.uid())));

-- notes
create policy "Users manage own notes" on public.notes for all to public using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- channels
create policy channels_select on public.channels for select to authenticated, anon using ((not is_private) or exists (select 1 from channel_members m where m.channel_id = channels.id and m.user_id = (select auth.uid())));
create policy channels_insert on public.channels for insert to authenticated with check (created_by = (select auth.uid()));

-- channel_members
create policy channel_members_select on public.channel_members for select to authenticated, anon using (true);
create policy channel_members_insert on public.channel_members for insert to authenticated with check ((user_id = (select auth.uid())) and exists (select 1 from channels c where c.id = channel_members.channel_id and ((not c.is_private) or (c.created_by = (select auth.uid())))));
create policy channel_members_delete on public.channel_members for delete to authenticated using (user_id = (select auth.uid()));

-- channel_posts
create policy channel_posts_select on public.channel_posts for select to authenticated, anon using (exists (select 1 from channels c where c.id = channel_posts.channel_id and ((not c.is_private) or exists (select 1 from channel_members m where m.channel_id = c.id and m.user_id = (select auth.uid())))));
create policy channel_posts_insert on public.channel_posts for insert to authenticated with check ((user_id = (select auth.uid())) and exists (select 1 from channels c where c.id = channel_posts.channel_id and ((not c.is_private) or exists (select 1 from channel_members m where m.channel_id = c.id and m.user_id = (select auth.uid())))));
create policy channel_posts_update on public.channel_posts for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy channel_posts_delete on public.channel_posts for delete to authenticated using (user_id = (select auth.uid()));

-- quick_questions
create policy quick_questions_select on public.quick_questions for select to authenticated, anon using (true);
create policy quick_questions_insert on public.quick_questions for insert to authenticated with check (user_id = (select auth.uid()));
create policy quick_questions_delete on public.quick_questions for delete to authenticated using (user_id = (select auth.uid()));

-- quick_answers
create policy quick_answers_select on public.quick_answers for select to authenticated, anon using (true);
create policy quick_answers_insert on public.quick_answers for insert to authenticated with check (user_id = (select auth.uid()));
create policy quick_answers_delete on public.quick_answers for delete to authenticated using (user_id = (select auth.uid()));

-- same_question_votes
create policy "Anyone can read same_question_votes" on public.same_question_votes for select to public using (true);
create policy "Users can insert own votes" on public.same_question_votes for insert to public with check ((select auth.uid()) = user_id);
create policy "Users can delete own votes" on public.same_question_votes for delete to public using ((select auth.uid()) = user_id);

-- card_verifications
create policy card_verifications_select on public.card_verifications for select to authenticated, anon using (true);
create policy card_verifications_insert on public.card_verifications for insert to authenticated with check (user_id = (select auth.uid()));
create policy card_verifications_delete on public.card_verifications for delete to authenticated using (user_id = (select auth.uid()));

-- notifications
create policy notifications_select on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy notifications_insert on public.notifications for insert to authenticated with check ((actor_id = (select auth.uid())) and (user_id <> (select auth.uid())));
create policy notifications_update on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_delete on public.notifications for delete to authenticated using (user_id = (select auth.uid()));

-- daily_briefings (Schreiben nur via Service-Role)
create policy daily_briefings_select on public.daily_briefings for select to authenticated, anon using (true);

-- app_feedback
create policy "Admins can read feedback" on public.app_feedback for select to public using (exists (select 1 from profiles where profiles.id = (select auth.uid()) and profiles.role = 'admin'::text));
create policy "Anyone can submit feedback" on public.app_feedback for insert to public with check (true);

-- source_health (Schreiben via Service-Role; Lesen für Admin-Dashboard)
create policy service_role_full_access on public.source_health for all to public using (true) with check (true);

-- rate_limit_entries: bewusst KEINE Policy (nur Service-Role, RLS aktiv)
