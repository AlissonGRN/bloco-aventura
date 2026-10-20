alter table public.classroom_proposals
  drop constraint if exists classroom_proposals_level_ids_check;

alter table public.classroom_proposals
  add constraint classroom_proposals_level_ids_check
  check (cardinality(level_ids) between 1 and 40);

create or replace function public.delete_bloco_team_for_owner(target_team_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.bloco_teams
    where id = target_team_id and owner_id = auth.uid()
  ) then
    raise exception 'Equipe não encontrada ou sem permissão para excluí-la.';
  end if;

  insert into public.deleted_bloco_teams(team_id, deleted_by)
  values (target_team_id, auth.uid())
  on conflict (team_id) do nothing;

  delete from public.bloco_teams
  where id = target_team_id and owner_id = auth.uid();
end;
$$;

revoke all on function public.delete_bloco_team_for_owner(text) from public;
grant execute on function public.delete_bloco_team_for_owner(text) to authenticated;
