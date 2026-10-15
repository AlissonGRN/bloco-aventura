create or replace function public.claim_bloco_team(team_code text) returns text
language plpgsql security definer set search_path = '' as $$
declare room uuid; claimed_team text; attempt_count integer;
begin
  if auth.uid() is null then raise exception 'Conecte este computador à sala do professor primeiro.'; end if;
  delete from private.bloco_join_attempts where user_id = auth.uid() and attempted_at < now() - interval '1 hour';
  select count(*)::integer into attempt_count from private.bloco_join_attempts where user_id = auth.uid() and attempted_at >= now() - interval '1 hour';
  if attempt_count >= 10 then raise exception 'Muitas tentativas. Aguarde uma hora e tente novamente.'; end if;
  insert into private.bloco_join_attempts(user_id) values (auth.uid());
  team_code := pg_catalog.upper(pg_catalog.btrim(team_code));
  if team_code !~ '^[A-Z]{8}$' then raise exception 'Código da equipe inválido.'; end if;
  select t.id, t.classroom_id into claimed_team, room
    from private.bloco_team_codes c join public.bloco_teams t on t.id = c.team_id
    where c.code_hash = extensions.digest(team_code, 'sha256');
  if claimed_team is null then raise exception 'Código da equipe inválido.'; end if;
  if not public.is_bloco_enrolled(room) then raise exception 'Conecte este computador à sala do professor primeiro.'; end if;
  insert into private.bloco_team_members(team_id, user_id) values (claimed_team, auth.uid()) on conflict do nothing;
  return claimed_team;
end;
$$;
revoke execute on function public.claim_bloco_team(text) from public, anon;
grant execute on function public.claim_bloco_team(text) to authenticated;
