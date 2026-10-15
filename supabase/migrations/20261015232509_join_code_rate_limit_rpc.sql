create or replace function public.join_bloco_classroom(room_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare room uuid; attempt_count integer;
begin
  if auth.uid() is null then raise exception 'Entre antes de conectar o computador.'; end if;
  delete from private.bloco_join_attempts where user_id = auth.uid() and attempted_at < now() - interval '1 hour';
  select count(*)::integer into attempt_count from private.bloco_join_attempts where user_id = auth.uid() and attempted_at >= now() - interval '1 hour';
  if attempt_count >= 10 then raise exception 'Muitas tentativas. Aguarde uma hora e tente novamente.'; end if;
  insert into private.bloco_join_attempts(user_id) values (auth.uid());
  room_code := pg_catalog.upper(pg_catalog.btrim(room_code));
  if room_code !~ '^[A-Z]{6}$' then raise exception 'Código da sala inválido.'; end if;
  select id into room from public.classrooms where join_code = room_code;
  if room is null then raise exception 'Código da sala inválido.'; end if;
  insert into public.device_enrollments(user_id, classroom_id) values (auth.uid(), room) on conflict do nothing;
  return room;
end;
$$;
revoke execute on function public.join_bloco_classroom(text) from public, anon;
grant execute on function public.join_bloco_classroom(text) to authenticated;
