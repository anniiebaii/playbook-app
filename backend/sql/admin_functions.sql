-- Expert-only account management, called from the admin dashboard via supabase.rpc().
--
-- These run as SECURITY DEFINER because they must touch Supabase Auth's own tables
-- (auth.users, auth.sessions), which clients can never access directly. Each function
-- checks that the caller is an expert before doing anything. Apply with
-- `npm run db:functions` after `npm run db:policies`; the script can be re-run safely.

begin;

-- Every account with its private fields (such as email), for the admin dashboard's user list.
create or replace function public.admin_list_users()
returns setof public.users
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only experts can list accounts.' using errcode = '42501';
  end if;
  return query select * from public.users order by "createdAt";
end;
$$;

-- Deactivating bans the login in Supabase Auth (enforced at sign-in and token refresh)
-- and ends every active session. Reactivating lifts the ban.
create or replace function public.admin_set_user_status(
  target_user_id uuid,
  new_status public.user_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only experts can change account status.' using errcode = '42501';
  end if;
  if target_user_id = (select auth.uid()) then
    raise exception 'You can''t change the status of your own account.' using errcode = '42501';
  end if;

  update public.users
  set status = new_status, "updatedAt" = now()
  where id = target_user_id;
  if not found then
    raise exception 'User not found.' using errcode = 'P0002';
  end if;

  -- A far-future date rather than 'infinity', which Supabase Auth can't parse.
  update auth.users
  set banned_until = case when new_status = 'INACTIVE' then now() + interval '100 years' end
  where id = target_user_id;

  if new_status = 'INACTIVE' then
    delete from auth.sessions where user_id = target_user_id;
  end if;
end;
$$;

-- Deleting removes the profile and, through ON DELETE CASCADE foreign keys, everything the
-- user created: their questions (with those questions' answers, upvotes, and bookmarks),
-- their answers, upvotes, bookmarks, and notifications. Questions assigned to them become
-- unassigned. Finally the Supabase Auth account is removed so they can't sign in again.
create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  answered_question_ids int[];
begin
  if not public.is_admin() then
    raise exception 'Only experts can delete accounts.' using errcode = '42501';
  end if;
  if target_user_id = (select auth.uid()) then
    raise exception 'You can''t delete your own account.' using errcode = '42501';
  end if;

  -- Remember which other questions this user answered, before their answers disappear.
  select array_agg(distinct "questionId") into answered_question_ids
  from public.answers
  where "authorId" = target_user_id;

  delete from public.users where id = target_user_id;
  if not found then
    raise exception 'User not found.' using errcode = 'P0002';
  end if;

  -- Questions that lost their only answer go back to the unanswered queue.
  update public.questions q
  set status = 'PENDING', "updatedAt" = now()
  where q.id = any (answered_question_ids)
    and q.status = 'ANSWERED'
    and not exists (select 1 from public.answers a where a."questionId" = q.id);

  delete from auth.users where id = target_user_id;
end;
$$;

-- Callable by signed-in users only; the functions themselves require an expert.
revoke execute on function public.admin_set_user_status(uuid, public.user_status) from public, anon;
revoke execute on function public.admin_delete_user(uuid) from public, anon;
revoke execute on function public.admin_list_users() from public, anon;
grant execute on function public.admin_set_user_status(uuid, public.user_status) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
grant execute on function public.admin_list_users() to authenticated;

-- Make the new functions available through the API immediately.
notify pgrst, 'reload schema';

commit;
