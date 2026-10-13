drop policy if exists teacher_help_read on public.teacher_help_requests;
create policy teacher_help_read on public.teacher_help_requests
  for select to authenticated
  using (public.is_bloco_teacher(classroom_id) or private.can_access_bloco_team(team_id));
