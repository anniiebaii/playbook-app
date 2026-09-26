-- Row Level Security policies for Playbook.
--
-- The browser talks to Postgres through Supabase's public API with the anon key, so these
-- policies are the only thing controlling who can read and write each table. Prisma does
-- not manage policies; apply this file with `npm run db:policies` after `npm run db:push`.
-- The script is idempotent: it can be re-run safely.

begin;

-- True when the signed-in user is an expert (admin). SECURITY DEFINER lets policies on other
-- tables check `users.isAdmin` without being blocked by, or recursing into, the users policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select "isAdmin" from public.users where id = (select auth.uid())), false);
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.users enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.question_upvotes enable row level security;
alter table public.question_bookmarks enable row level security;
alter table public.notifications enable row level security;

-- users: public profiles; each user may create only their own, non-admin profile.
drop policy if exists "Profiles are viewable by everyone" on public.users;
create policy "Profiles are viewable by everyone"
  on public.users for select
  using (true);

drop policy if exists "Users can create their own profile" on public.users;
create policy "Users can create their own profile"
  on public.users for insert to authenticated
  with check (
    id = (select auth.uid())
    and "isAdmin" = false
    and points = 0
    and status = 'ACTIVE'
  );

-- questions: public; members ask as themselves; experts update status and delete.
drop policy if exists "Questions are viewable by everyone" on public.questions;
create policy "Questions are viewable by everyone"
  on public.questions for select
  using (true);

drop policy if exists "Members can ask questions" on public.questions;
create policy "Members can ask questions"
  on public.questions for insert to authenticated
  with check ("authorId" = (select auth.uid()) and status = 'PENDING' and views = 0);

drop policy if exists "Experts can update questions" on public.questions;
create policy "Experts can update questions"
  on public.questions for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Deleting a question cascades to its answers, upvotes, and bookmarks.
drop policy if exists "Experts can delete questions" on public.questions;
create policy "Experts can delete questions"
  on public.questions for delete to authenticated
  using ((select public.is_admin()));

-- answers: public; only experts may answer, as themselves.
drop policy if exists "Answers are viewable by everyone" on public.answers;
create policy "Answers are viewable by everyone"
  on public.answers for select
  using (true);

drop policy if exists "Experts can answer" on public.answers;
create policy "Experts can answer"
  on public.answers for insert to authenticated
  with check ("authorId" = (select auth.uid()) and (select public.is_admin()));

-- upvotes and bookmarks: public counts; users add and remove only their own.
drop policy if exists "Upvotes are viewable by everyone" on public.question_upvotes;
create policy "Upvotes are viewable by everyone"
  on public.question_upvotes for select
  using (true);

drop policy if exists "Users can upvote" on public.question_upvotes;
create policy "Users can upvote"
  on public.question_upvotes for insert to authenticated
  with check ("userId" = (select auth.uid()));

drop policy if exists "Users can remove their upvotes" on public.question_upvotes;
create policy "Users can remove their upvotes"
  on public.question_upvotes for delete to authenticated
  using ("userId" = (select auth.uid()));

drop policy if exists "Bookmarks are viewable by everyone" on public.question_bookmarks;
create policy "Bookmarks are viewable by everyone"
  on public.question_bookmarks for select
  using (true);

drop policy if exists "Users can bookmark" on public.question_bookmarks;
create policy "Users can bookmark"
  on public.question_bookmarks for insert to authenticated
  with check ("userId" = (select auth.uid()));

drop policy if exists "Users can remove their bookmarks" on public.question_bookmarks;
create policy "Users can remove their bookmarks"
  on public.question_bookmarks for delete to authenticated
  using ("userId" = (select auth.uid()));

-- notifications: private to their recipient; created server-side only.
drop policy if exists "Users can read their notifications" on public.notifications;
create policy "Users can read their notifications"
  on public.notifications for select to authenticated
  using ("userId" = (select auth.uid()));

commit;
