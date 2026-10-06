-- Restrict permanent team deletion to the teacher who owns its classroom.
grant delete on public.bloco_teams to authenticated;
drop policy if exists teacher_delete_team on public.bloco_teams;
create policy teacher_delete_team on public.bloco_teams for delete to authenticated
  using (public.is_bloco_teacher(classroom_id));

-- Enable live sticker notifications for enrolled team devices.
do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'team_stickers'
  ) then
    execute 'alter publication supabase_realtime add table public.team_stickers';
  end if;
end;
$$;
