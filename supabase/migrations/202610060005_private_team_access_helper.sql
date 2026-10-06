-- Keep the team membership predicate outside the PostgREST exposed schema.
begin;
create or replace function private.can_access_bloco_team(team text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.bloco_teams t where t.id = team and t.owner_id = (select auth.uid()))
    or exists(select 1 from private.bloco_team_members m where m.team_id = team and m.user_id = (select auth.uid()));
$$;
grant usage on schema private to authenticated;
grant execute on function private.can_access_bloco_team(text) to authenticated;
drop policy if exists team_read on public.bloco_teams;
create policy team_read on public.bloco_teams for select to authenticated
  using (private.can_access_bloco_team(id) or public.is_bloco_teacher(classroom_id));
drop policy if exists team_edit on public.bloco_teams;
create policy team_edit on public.bloco_teams for update to authenticated
  using (private.can_access_bloco_team(id) and public.is_bloco_enrolled(classroom_id))
  with check (private.can_access_bloco_team(id) and public.is_bloco_enrolled(classroom_id));
drop policy if exists sticker_read on public.team_stickers;
create policy sticker_read on public.team_stickers for select to authenticated
  using (private.can_access_bloco_team(team_id) or public.teaches_bloco_team(team_id));
commit;
