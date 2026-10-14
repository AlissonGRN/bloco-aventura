-- Let teachers grant an individual robot skin to a specific team.
-- Student clients never write this column; the trigger enforces that at the database boundary.
alter table public.bloco_teams
  add column if not exists bonus_skins smallint[] not null default '{}'::smallint[];

alter table public.bloco_teams
  drop constraint if exists bloco_teams_bonus_skins_count_check;
alter table public.bloco_teams
  add constraint bloco_teams_bonus_skins_count_check
  check (cardinality(bonus_skins) <= 21);

create or replace function public.validate_bloco_team() returns trigger
language plpgsql set search_path = '' as $$
declare member jsonb; item record; session jsonb; completed_count integer; sticker_count integer; max_skin integer; sticker_skin integer;
begin
  if TG_OP = 'UPDATE' and (new.id is distinct from old.id or new.owner_id is distinct from old.owner_id or new.classroom_id is distinct from old.classroom_id) then
    raise exception 'A identidade da equipe e da sala não pode ser alterada.';
  end if;
  if TG_OP = 'UPDATE' and new.bonus_skins is distinct from old.bonus_skins and not public.is_bloco_teacher(old.classroom_id) then
    raise exception 'Somente o professor pode liberar skins para a equipe.';
  end if;
  if TG_OP = 'INSERT' and cardinality(new.bonus_skins) > 0 and not public.is_bloco_teacher(new.classroom_id) then
    raise exception 'Somente o professor pode liberar skins para a equipe.';
  end if;
  if exists (select 1 from unnest(new.bonus_skins) as skin where skin < 0 or skin > 20) then
    raise exception 'A lista de skins liberadas contém um item inválido.';
  end if;
  new.bonus_skins := array(select distinct skin from unnest(new.bonus_skins) as skin order by skin);
  if TG_OP = 'UPDATE' and public.is_bloco_teacher(old.classroom_id) and (
    new.progress is distinct from old.progress or new.attempts is distinct from old.attempts or
    new.sessions is distinct from old.sessions or new.last_level is distinct from old.last_level
  ) then
    return null;
  end if;
  select count(*)::integer into completed_count from jsonb_each(new.progress);
  max_skin := case
    when completed_count >= 240 then 12
    when completed_count >= 180 then 11
    when completed_count >= 120 then 10
    when completed_count >= 80 then 9
    when completed_count >= 50 then 8
    when completed_count >= 30 then 7
    when completed_count >= 15 then 6
    when completed_count >= 5 then 5
    else 4
  end;
  select count(*)::integer into sticker_count
  from public.team_stickers where team_id = new.id;
  sticker_skin := case
    when sticker_count >= 40 then 20
    when sticker_count >= 30 then 19
    when sticker_count >= 25 then 18
    when sticker_count >= 20 then 17
    when sticker_count >= 15 then 16
    when sticker_count >= 10 then 15
    when sticker_count >= 6 then 14
    when sticker_count >= 3 then 13
    else 0
  end;
  max_skin := greatest(max_skin, sticker_skin);
  if new.avatar < 0 or new.avatar > 20 or (new.avatar > max_skin and not new.avatar = any(new.bonus_skins)) then
    raise exception 'Esta skin ainda não foi desbloqueada pela equipe.';
  end if;
  for member in select value from jsonb_array_elements(new.members) loop
    if jsonb_typeof(member) <> 'string' or char_length(btrim(member #>> '{}')) not between 1 and 40 then raise exception 'Nome de aluno inválido.'; end if;
  end loop;
  for item in select key, value from jsonb_each(new.progress) loop
    if item.key !~ '^[1-9]-([1-9]|[12][0-9]|3[0-9]|40)$' or jsonb_typeof(item.value) <> 'object' or not coalesce(item.value->>'stars' in ('2','3'),false) then raise exception 'Progresso inválido.'; end if;
  end loop;
  for item in select key, value from jsonb_each(new.attempts) loop
    if item.key !~ '^[1-9]-([1-9]|[12][0-9]|3[0-9]|40)$' or jsonb_typeof(item.value) <> 'object' or not coalesce(item.value->>'count' ~ '^[0-9]{1,6}$', false) then raise exception 'Tentativas inválidas.'; end if;
  end loop;
  for session in select value from jsonb_array_elements(new.sessions) loop
    if jsonb_typeof(session) <> 'object' or jsonb_typeof(session->'played') is distinct from 'array' or jsonb_typeof(session->'completed') is distinct from 'array' or char_length(coalesce(session->>'note','')) > 300 then raise exception 'Sessão inválida.'; end if;
  end loop;
  new.updated_at = now();
  return new;
end;
$$;
