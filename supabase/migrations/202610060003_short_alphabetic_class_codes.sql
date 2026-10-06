-- Six uppercase letters keep room codes short and easy to enter.
create or replace function public.generate_bloco_join_code() returns text
language sql volatile set search_path = '' as $$
  select pg_catalog.string_agg(pg_catalog.chr(65 + pg_catalog.floor(pg_catalog.random() * 26)::integer), '' order by n)
  from pg_catalog.generate_series(1, 6) as series(n);
$$;
revoke execute on function public.generate_bloco_join_code() from public, anon;
grant execute on function public.generate_bloco_join_code() to authenticated;

alter table public.classrooms
  alter column join_code set default public.generate_bloco_join_code();
update public.classrooms
  set join_code = public.generate_bloco_join_code()
  where join_code !~ '^[A-Z]{6}$';
alter table public.classrooms
  add constraint classrooms_join_code_format check (join_code ~ '^[A-Z]{6}$');

create or replace function public.join_bloco_classroom(room_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare room uuid;
begin
  if auth.uid() is null then raise exception 'Entre antes de conectar o computador.'; end if;
  room_code := pg_catalog.upper(pg_catalog.btrim(room_code));
  if room_code !~ '^[A-Z]{6}$' then raise exception 'Código da sala inválido.'; end if;
  select id into room from public.classrooms where join_code = room_code;
  if room is null then raise exception 'Código da sala inválido.'; end if;
  insert into public.device_enrollments(user_id, classroom_id)
  values (auth.uid(), room) on conflict do nothing;
  return room;
end;
$$;
