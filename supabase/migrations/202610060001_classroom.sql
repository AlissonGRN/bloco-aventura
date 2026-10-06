-- Bloco v2. Run once in a dedicated Supabase project.
-- No teacher passwords or privileged API keys belong in this migration.
begin;
create table public.teacher_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create function public.generate_bloco_join_code() returns text
language sql volatile set search_path = '' as $$
  select pg_catalog.string_agg(pg_catalog.chr(65 + pg_catalog.floor(pg_catalog.random() * 26)::integer), '' order by n)
  from pg_catalog.generate_series(1, 6) as series(n);
$$;
revoke execute on function public.generate_bloco_join_code() from public, anon;
grant execute on function public.generate_bloco_join_code() to authenticated;
create table public.classrooms (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null unique references public.teacher_profiles(id) on delete cascade,
  name text not null default 'Minha sala' check (char_length(name) between 1 and 80),
  join_code text not null unique default public.generate_bloco_join_code() check (join_code ~ '^[A-Z]{6}$'),
  created_at timestamptz not null default now()
);
create table public.class_groups (
  id text primary key default gen_random_uuid()::text,
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  grade smallint not null,
  section text not null,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  active boolean not null default true,
  unique (id, classroom_id),
  unique (classroom_id, grade, section),
  check (
    (grade = 1 and section in ('A','B','C')) or
    (grade = 2 and section in ('A','B')) or
    (grade = 3 and section in ('A','B','C')) or
    (grade in (4,5) and section in ('A','B','C'))
  ),
  check (name = grade::text || 'º ano ' || section)
);
create table public.device_enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (user_id, classroom_id)
);
create table public.bloco_teams (
  id text primary key check (char_length(id) between 1 and 100),
  owner_id uuid not null references auth.users(id) on delete cascade,
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  class_id text not null,
  name text not null check (char_length(btrim(name)) between 1 and 40),
  members jsonb not null check (jsonb_typeof(members) = 'array' and jsonb_array_length(members) between 1 and 4),
  avatar smallint not null default 0 check (avatar between 0 and 4),
  progress jsonb not null default '{}' check (jsonb_typeof(progress) = 'object' and octet_length(progress::text) <= 50000),
  attempts jsonb not null default '{}' check (jsonb_typeof(attempts) = 'object' and octet_length(attempts::text) <= 50000),
  sessions jsonb not null default '[]' check (jsonb_typeof(sessions) = 'array' and jsonb_array_length(sessions) <= 100 and octet_length(sessions::text) <= 500000),
  last_level text not null default '1-1' check (last_level ~ '^[1-5]-([1-9]|[12][0-9]|3[0-9]|40)$'),
  updated_at timestamptz not null default now(),
  foreign key (class_id, classroom_id) references public.class_groups(id, classroom_id)
);
-- Team access is limited by row-level policies. Table-level UPDATE is needed
-- because the client uses PostgREST upsert (INSERT ... ON CONFLICT UPDATE).
create table public.team_stickers (
  id text primary key default gen_random_uuid()::text,
  team_id text not null references public.bloco_teams(id) on delete cascade,
  type text not null check (type in ('teamwork','persistence','logic','creativity','debugger','focus','helper','explorer')),
  note text not null default '' check (char_length(note) <= 160),
  created_at timestamptz not null default now()
);
create index on public.class_groups(classroom_id);
create index on public.device_enrollments(classroom_id);
create index on public.bloco_teams(owner_id);
create index on public.bloco_teams(classroom_id, class_id);
create index on public.team_stickers(team_id);

-- Small boolean helpers avoid recursive policies. They expose no data.
create function public.is_bloco_teacher(room uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.classrooms where id = room and teacher_id = (select auth.uid()));
$$;
create function public.is_bloco_enrolled(room uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.device_enrollments where classroom_id = room and user_id = (select auth.uid()));
$$;
create function public.owns_bloco_team(team text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.bloco_teams where id = team and owner_id = (select auth.uid()));
$$;
create function public.teaches_bloco_team(team text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.bloco_teams t join public.classrooms c on c.id = t.classroom_id where t.id = team and c.teacher_id = (select auth.uid()));
$$;
create function public.join_bloco_classroom(room_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare room uuid;
begin
  if auth.uid() is null then raise exception 'Entre antes de conectar o computador.'; end if;
  room_code := pg_catalog.upper(pg_catalog.btrim(room_code));
  if room_code !~ '^[A-Z]{6}$' then raise exception 'Código da sala inválido.'; end if;
  select id into room from public.classrooms where join_code = room_code;
  if room is null then raise exception 'Código da sala inválido.'; end if;
  insert into public.device_enrollments(user_id, classroom_id) values (auth.uid(), room) on conflict do nothing;
  return room;
end;
$$;
create function public.validate_bloco_team() returns trigger
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
    if item.key !~ '^[1-5]-([1-9]|[12][0-9]|3[0-9]|40)$' or jsonb_typeof(item.value) <> 'object' or not coalesce(item.value->>'stars' in ('2','3'),false) then raise exception 'Progresso inválido.'; end if;
  end loop;
  for item in select key, value from jsonb_each(new.attempts) loop
    if item.key !~ '^[1-5]-([1-9]|[12][0-9]|3[0-9]|40)$' or jsonb_typeof(item.value) <> 'object' or not coalesce(item.value->>'count' ~ '^[0-9]{1,6}$', false) then raise exception 'Tentativas inválidas.'; end if;
  end loop;
  for session in select value from jsonb_array_elements(new.sessions) loop
    if jsonb_typeof(session) <> 'object' or jsonb_typeof(session->'played') is distinct from 'array' or jsonb_typeof(session->'completed') is distinct from 'array' or char_length(coalesce(session->>'note','')) > 300 then raise exception 'Sessão inválida.'; end if;
  end loop;
  new.updated_at = now();
  return new;
end;
$$;
create trigger validate_bloco_team before insert or update on public.bloco_teams for each row execute function public.validate_bloco_team();

alter table public.teacher_profiles enable row level security;
alter table public.classrooms enable row level security;
alter table public.class_groups enable row level security;
alter table public.device_enrollments enable row level security;
alter table public.bloco_teams enable row level security;
alter table public.team_stickers enable row level security;

-- Reset table grants explicitly: no unauthenticated access to pupil records.
revoke all on public.teacher_profiles, public.classrooms, public.class_groups, public.device_enrollments, public.bloco_teams, public.team_stickers from anon, authenticated;
grant select on public.teacher_profiles to authenticated;
grant select, insert on public.classrooms to authenticated;
grant select, insert, update on public.class_groups to authenticated;
grant select on public.device_enrollments to authenticated;
grant select, insert, update on public.bloco_teams to authenticated;
grant select, insert, delete on public.team_stickers to authenticated;

create policy teacher_own_profile on public.teacher_profiles for select to authenticated using (id = (select auth.uid()));
create policy teacher_own_room on public.classrooms for select to authenticated using (teacher_id = (select auth.uid()));
create policy teacher_create_room on public.classrooms for insert to authenticated with check (teacher_id = (select auth.uid()) and exists(select 1 from public.teacher_profiles where id = (select auth.uid())));
create policy group_read on public.class_groups for select to authenticated using (public.is_bloco_teacher(classroom_id) or public.is_bloco_enrolled(classroom_id));
create policy group_create on public.class_groups for insert to authenticated with check (public.is_bloco_teacher(classroom_id));
create policy group_edit on public.class_groups for update to authenticated using (public.is_bloco_teacher(classroom_id)) with check (public.is_bloco_teacher(classroom_id));
create policy device_own on public.device_enrollments for select to authenticated using (user_id = (select auth.uid()) or public.is_bloco_teacher(classroom_id));
create policy team_read on public.bloco_teams for select to authenticated using (owner_id = (select auth.uid()) or public.is_bloco_teacher(classroom_id));
create policy team_create on public.bloco_teams for insert to authenticated with check (owner_id = (select auth.uid()) and public.is_bloco_enrolled(classroom_id) and exists(select 1 from public.class_groups g where g.id = class_id and g.classroom_id = bloco_teams.classroom_id and g.active));
create policy team_edit on public.bloco_teams for update to authenticated using (owner_id = (select auth.uid()) and public.is_bloco_enrolled(classroom_id)) with check (owner_id = (select auth.uid()) and public.is_bloco_enrolled(classroom_id));
create policy teacher_edit_team_profile on public.bloco_teams for update to authenticated using (public.is_bloco_teacher(classroom_id)) with check (public.is_bloco_teacher(classroom_id));
create policy sticker_read on public.team_stickers for select to authenticated using (public.owns_bloco_team(team_id) or public.teaches_bloco_team(team_id));
create policy teacher_award on public.team_stickers for insert to authenticated with check (public.teaches_bloco_team(team_id));
create policy teacher_remove_award on public.team_stickers for delete to authenticated using (public.teaches_bloco_team(team_id));

revoke execute on function public.generate_bloco_join_code(), public.is_bloco_teacher(uuid), public.is_bloco_enrolled(uuid), public.owns_bloco_team(text), public.teaches_bloco_team(text), public.join_bloco_classroom(text), public.validate_bloco_team() from public, anon;
grant execute on function public.generate_bloco_join_code(), public.is_bloco_teacher(uuid), public.is_bloco_enrolled(uuid), public.owns_bloco_team(text), public.teaches_bloco_team(text), public.join_bloco_classroom(text) to authenticated;
commit;
