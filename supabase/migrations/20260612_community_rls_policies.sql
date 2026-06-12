-- ════════════════════════════════════════════════════════════════════════════
-- Community & Briefing: RLS-Policies
--
-- Kontext: Auf channels, channel_members, channel_posts, quick_questions,
-- quick_answers, card_verifications und daily_briefings war RLS aktiviert,
-- aber es existierte KEINE einzige Policy. Damit war jeder Client-Zugriff
-- (lesen UND schreiben) blockiert — Community, Schnellfragen, Verifizierung
-- und Daily Briefing waren in Produktion funktionslos (alle Tabellen leer).
--
-- Design:
--  • Lesen: öffentlich (anon + authenticated) für alles, was im UI ohne
--    Login sichtbar ist; private Channels nur für Mitglieder.
--  • Schreiben: nur eingeloggt und nur eigene Zeilen (Ownership-Check).
--  • daily_briefings: Schreiben bleibt bewusst ohne Policy — der Briefing-
--    Endpoint schreibt mit der Service-Role (umgeht RLS).
--  • auth.uid() überall als (select auth.uid()) für initplan-Caching.
-- ════════════════════════════════════════════════════════════════════════════

-- ── channels ────────────────────────────────────────────────────────────────
-- Ersteller-Spalte nachrüsten (fehlt im Basis-Schema): ermöglicht Ownership
-- bei INSERT und das Beitreten des Erstellers zu privaten Channels.
alter table public.channels
  add column if not exists created_by uuid
    references public.profiles(id) on delete set null
    default auth.uid();

create policy channels_select on public.channels
  for select to anon, authenticated
  using (
    not is_private
    or exists (
      select 1 from public.channel_members m
      where m.channel_id = channels.id
        and m.user_id = (select auth.uid())
    )
  );

create policy channels_insert on public.channels
  for insert to authenticated
  with check (created_by = (select auth.uid()));

-- ── channel_members ─────────────────────────────────────────────────────────
create policy channel_members_select on public.channel_members
  for select to anon, authenticated
  using (true);

create policy channel_members_insert on public.channel_members
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.channels c
      where c.id = channel_id
        and (not c.is_private or c.created_by = (select auth.uid()))
    )
  );

create policy channel_members_delete on public.channel_members
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ── channel_posts ───────────────────────────────────────────────────────────
create policy channel_posts_select on public.channel_posts
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.channels c
      where c.id = channel_posts.channel_id
        and (
          not c.is_private
          or exists (
            select 1 from public.channel_members m
            where m.channel_id = c.id
              and m.user_id = (select auth.uid())
          )
        )
    )
  );

create policy channel_posts_insert on public.channel_posts
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.channels c
      where c.id = channel_id
        and (
          not c.is_private
          or exists (
            select 1 from public.channel_members m
            where m.channel_id = c.id
              and m.user_id = (select auth.uid())
          )
        )
    )
  );

-- Update-Policy bereits jetzt: Grundlage für die Bearbeiten-Funktion.
create policy channel_posts_update on public.channel_posts
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy channel_posts_delete on public.channel_posts
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ── quick_questions ─────────────────────────────────────────────────────────
create policy quick_questions_select on public.quick_questions
  for select to anon, authenticated
  using (true);

create policy quick_questions_insert on public.quick_questions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy quick_questions_delete on public.quick_questions
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ── quick_answers ───────────────────────────────────────────────────────────
create policy quick_answers_select on public.quick_answers
  for select to anon, authenticated
  using (true);

create policy quick_answers_insert on public.quick_answers
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy quick_answers_delete on public.quick_answers
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ── card_verifications ──────────────────────────────────────────────────────
create policy card_verifications_select on public.card_verifications
  for select to anon, authenticated
  using (true);

create policy card_verifications_insert on public.card_verifications
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy card_verifications_delete on public.card_verifications
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ── daily_briefings ─────────────────────────────────────────────────────────
-- Lesen öffentlich (Feed zeigt das Briefing auch ausgeloggt);
-- Schreiben absichtlich NUR via Service-Role (keine Insert/Update-Policy).
create policy daily_briefings_select on public.daily_briefings
  for select to anon, authenticated
  using (true);
