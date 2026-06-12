-- ════════════════════════════════════════════════════════════════════════════
-- Community-Engagement-Loop: Benachrichtigungen + Beitrag-Bearbeitung
--
--  • notifications: In-App-Benachrichtigung, wenn jemand auf eine Schnellfrage
--    oder einen Channel-Beitrag antwortet. Ohne diese Rückkopplung erfährt
--    die Fragestellerin nie von Antworten — der #1-Grund, warum kleine
--    Communities einschlafen. Erstellt vom Antwortenden (actor), lesbar nur
--    für die Empfängerin.
--  • channel_posts.edited_at: Grundlage für die Bearbeiten-Funktion
--    (Update-Policy existiert seit 20260612_community_rls_policies.sql).
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  actor_id    uuid references public.profiles(id) on delete set null,
  type        text not null check (type in ('quick_answer', 'channel_reply')),
  channel_id  uuid references public.channels(id) on delete cascade,
  question_id uuid references public.quick_questions(id) on delete cascade,
  post_id     uuid references public.channel_posts(id) on delete cascade,
  preview     text not null default '',
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy notifications_select on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Erzeugt wird die Benachrichtigung vom Antwortenden — für andere, nie für sich selbst
create policy notifications_insert on public.notifications
  for insert to authenticated
  with check (actor_id = (select auth.uid()) and user_id <> (select auth.uid()));

create policy notifications_update on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy notifications_delete on public.notifications
  for delete to authenticated
  using (user_id = (select auth.uid()));

create index if not exists notifications_user_read_idx  on public.notifications(user_id, read, created_at desc);
create index if not exists notifications_actor_id_idx   on public.notifications(actor_id);
create index if not exists notifications_channel_id_idx on public.notifications(channel_id);
create index if not exists notifications_question_id_idx on public.notifications(question_id);
create index if not exists notifications_post_id_idx    on public.notifications(post_id);

alter table public.channel_posts
  add column if not exists edited_at timestamptz;

-- Melden-Funktion: Meldungen landen als app_feedback-Eintrag (Typ "report"),
-- damit Admins sie im bestehenden Feedback-Tab sehen.
alter table public.app_feedback drop constraint if exists app_feedback_type_check;
alter table public.app_feedback add constraint app_feedback_type_check
  check (type in ('bug', 'verbesserung', 'lob', 'sonstiges', 'report'));
