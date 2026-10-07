-- Expand student progress validation for the two additional 40-mission worlds.
alter table public.bloco_teams drop constraint if exists bloco_teams_last_level_check;
alter table public.bloco_teams add constraint bloco_teams_last_level_check
  check (last_level ~ '^[1-7]-([1-9]|[12][0-9]|3[0-9]|40)$');

create or replace function public.validate_bloco_team() returns trigger
language plpgsql set search_path = '' as $$
declare member jsonb; item record; session jsonb;
begin
  if TG_OP = 'UPDATE' and (new.id is distinct from old.id or new.owner_id is distinct from old.owner_id or new.classroom_id is distinct from old.classroom_id) then
    raise exception 'A identidade da equipe e da sala não pode ser alterada.';
  end if;
  if TG_OP = 'UPDATE' and public.is_bloco_teacher(old.classroom_id) and (
    new.progress is distinct from old.progress or new.attempts is distinct from old.attempts or
    new.sessions is distinct from old.sessions or new.last_level is distinct from old.last_level
  ) then
    return null;
  end if;
  for member in select value from jsonb_array_elements(new.members) loop
    if jsonb_typeof(member) <> 'string' or char_length(btrim(member #>> '{}')) not between 1 and 40 then raise exception 'Nome de aluno inválido.'; end if;
  end loop;
  for item in select key, value from jsonb_each(new.progress) loop
    if item.key !~ '^[1-7]-([1-9]|[12][0-9]|3[0-9]|40)$' or jsonb_typeof(item.value) <> 'object' or not coalesce(item.value->>'stars' in ('2','3'),false) then raise exception 'Progresso inválido.'; end if;
  end loop;
  for item in select key, value from jsonb_each(new.attempts) loop
    if item.key !~ '^[1-7]-([1-9]|[12][0-9]|3[0-9]|40)$' or jsonb_typeof(item.value) <> 'object' or not coalesce(item.value->>'count' ~ '^[0-9]{1,6}$', false) then raise exception 'Tentativas inválidas.'; end if;
  end loop;
  for session in select value from jsonb_array_elements(new.sessions) loop
    if jsonb_typeof(session) <> 'object' or jsonb_typeof(session->'played') is distinct from 'array' or jsonb_typeof(session->'completed') is distinct from 'array' or char_length(coalesce(session->>'note','')) > 300 then raise exception 'Sessão inválida.'; end if;
  end loop;
  new.updated_at = now();
  return new;
end;
$$;
