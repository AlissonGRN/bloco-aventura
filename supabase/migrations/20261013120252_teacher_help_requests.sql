begin;
create table public.teacher_help_requests (
  id uuid primary key default gen_random_uuid(),
  team_id text not null references public.bloco_teams(id) on delete cascade,
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  requester_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  check (resolved_at is null or resolved_at >= created_at)
);
create index teacher_help_requests_classroom_open_idx
  on public.teacher_help_requests (classroom_id, created_at)
  where resolved_at is null;
create unique index teacher_help_requests_one_open_per_team_idx
  on public.teacher_help_requests (team_id)
  where resolved_at is null;

alter table public.teacher_help_requests enable row level security;
revoke all on public.teacher_help_requests from anon, authenticated;
grant select, insert on public.teacher_help_requests to authenticated;
grant update (resolved_at) on public.teacher_help_requests to authenticated;

create policy teacher_help_read on public.teacher_help_requests
  for select to authenticated
  using (
    public.is_bloco_teacher(classroom_id)
    or (requester_id = (select auth.uid()) and private.can_access_bloco_team(team_id))
  );
create policy team_help_create on public.teacher_help_requests
  for insert to authenticated
  with check (
    requester_id = (select auth.uid())
    and resolved_at is null
    and public.is_bloco_enrolled(classroom_id)
    and exists (
      select 1
      from public.bloco_teams t
      where t.id = teacher_help_requests.team_id
        and t.classroom_id = teacher_help_requests.classroom_id
        and private.can_access_bloco_team(t.id)
    )
  );
create policy teacher_resolve_help on public.teacher_help_requests
  for update to authenticated
  using (public.is_bloco_teacher(classroom_id) and resolved_at is null)
  with check (public.is_bloco_teacher(classroom_id) and resolved_at is not null);

do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'teacher_help_requests'
  ) then
    execute 'alter publication supabase_realtime add table public.teacher_help_requests';
  end if;
end;
$$;
commit;
