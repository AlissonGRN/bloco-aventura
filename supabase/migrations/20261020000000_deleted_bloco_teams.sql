create table if not exists public.deleted_bloco_teams (
  team_id text primary key,
  deleted_by uuid not null references auth.users(id),
  deleted_at timestamptz not null default now()
);

alter table public.deleted_bloco_teams enable row level security;

drop policy if exists "Clients can read deleted team markers" on public.deleted_bloco_teams;
create policy "Clients can read deleted team markers"
  on public.deleted_bloco_teams for select to anon, authenticated using (true);

drop policy if exists "Teachers can mark teams deleted" on public.deleted_bloco_teams;
create policy "Teachers can mark teams deleted"
  on public.deleted_bloco_teams for insert to authenticated
  with check (
    deleted_by = auth.uid()
    and exists (select 1 from public.teacher_profiles tp where tp.id = auth.uid())
  );

drop policy if exists "Teachers can keep deleted team markers" on public.deleted_bloco_teams;
create policy "Teachers can keep deleted team markers"
  on public.deleted_bloco_teams for update to authenticated
  using (exists (select 1 from public.teacher_profiles tp where tp.id = auth.uid()))
  with check (deleted_by = auth.uid());

grant select on public.deleted_bloco_teams to anon, authenticated;
grant insert, update on public.deleted_bloco_teams to authenticated;