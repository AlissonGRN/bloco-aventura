create or replace function public.rotate_bloco_team_code(team_id text) returns text
language plpgsql security definer set search_path = '' as $$
declare room uuid; code text; digest bytea; random_bytes bytea;
begin
  if auth.uid() is null then raise exception 'Entre para gerar um código de equipe.'; end if;
  select classroom_id into room from public.bloco_teams where id = team_id;
  if room is null or (not public.is_bloco_teacher(room) and not public.owns_bloco_team(team_id)) then
    raise exception 'Você não pode gerar um código para esta equipe.';
  end if;
  loop
    random_bytes := extensions.gen_random_bytes(8);
    select string_agg(substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', (pg_catalog.get_byte(random_bytes, n) % 26) + 1, 1), '' order by n)
      into code from pg_catalog.generate_series(0, 7) as bytes(n);
    digest := extensions.digest(code, 'sha256');
    exit when not exists(select 1 from private.bloco_team_codes c where c.code_hash = digest and c.team_id <> rotate_bloco_team_code.team_id);
  end loop;
  insert into private.bloco_team_codes as stored (team_id, code_hash) values (rotate_bloco_team_code.team_id, digest)
  on conflict on constraint bloco_team_codes_pkey do update set code_hash = excluded.code_hash, created_at = now();
  return code;
end;
$$;
