create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(btrim(message)) between 10 and 1000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  publication_consent boolean not null default false check (publication_consent),
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_moderators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;
alter table public.feedback_moderators enable row level security;

create or replace function public.is_feedback_moderator()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.feedback_moderators
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_feedback_moderator() from public;
grant execute on function public.is_feedback_moderator() to authenticated;

revoke all on public.feedback from public, anon, authenticated;
grant select on public.feedback to anon, authenticated;
grant insert (message, publication_consent) on public.feedback to anon, authenticated;
grant update (message, status) on public.feedback to authenticated;
grant delete on public.feedback to authenticated;
revoke all on public.feedback_moderators from public, anon, authenticated;
grant select on public.feedback_moderators to authenticated;

drop policy if exists "Anyone can read approved feedback" on public.feedback;
create policy "Anyone can read approved feedback"
  on public.feedback for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "Moderators can read all feedback" on public.feedback;
create policy "Moderators can read all feedback"
  on public.feedback for select
  to authenticated
  using ((select public.is_feedback_moderator()));

drop policy if exists "Visitors can submit feedback for review" on public.feedback;
create policy "Visitors can submit feedback for review"
  on public.feedback for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and publication_consent = true
  );

drop policy if exists "Moderators can update feedback" on public.feedback;
create policy "Moderators can update feedback"
  on public.feedback for update
  to authenticated
  using ((select public.is_feedback_moderator()))
  with check ((select public.is_feedback_moderator()));

drop policy if exists "Moderators can delete feedback" on public.feedback;
create policy "Moderators can delete feedback"
  on public.feedback for delete
  to authenticated
  using ((select public.is_feedback_moderator()));

drop policy if exists "Moderators can read their own access" on public.feedback_moderators;
create policy "Moderators can read their own access"
  on public.feedback_moderators for select
  to authenticated
  using (user_id = (select auth.uid()));
