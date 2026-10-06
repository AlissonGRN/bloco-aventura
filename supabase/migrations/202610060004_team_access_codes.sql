-- Let a team use another computer through a private, teacher-issued code.
create extension if not exists pgcrypto with schema extensions;
begin;

alter table public.class_groups drop constraint if exists class_groups_check;
alter table public.class_groups add constraint class_groups_grade_section_check check (
  (grade = 1 and section in ('A','B','C')) or
  (grade = 2 and section in ('A','B')) or
  (grade = 3 and section in ('A','B','C')) or
  (grade in (4,5) and section in ('A','B','C'))
);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.bloco_team_codes (
  team_id text primary key references public.bloco_teams(id) on delete cascade,
  code_hash bytea not null unique,
  created_at timestamptz not null default now()
);
create table private.bloco_team_members (
  team_id text not null references public.bloco_teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);
revoke all on private.bloco_team_codes, private.bloco_team_members from public, anon, authenticated;
alter table private.bloco_team_codes enable row level security;
alter table private.bloco_team_members enable row level security;

create or replace function private.can_access_bloco_team(team text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.bloco_teams t where t.id = team and t.owner_id = (select auth.uid()))
    or exists(select 1 from private.bloco_team_members m where m.team_id = team and m.user_id = (select auth.uid()));
$$;

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

create or replace function public.claim_bloco_team(team_code text) returns text
language plpgsql security definer set search_path = '' as $$
declare room uuid; claimed_team text;
begin
  if auth.uid() is null then raise exception 'Conecte este computador à sala do professor primeiro.'; end if;
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

revoke execute on function public.rotate_bloco_team_code(text), public.claim_bloco_team(text) from public, anon;
grant execute on function public.rotate_bloco_team_code(text), public.claim_bloco_team(text) to authenticated;
commit;
