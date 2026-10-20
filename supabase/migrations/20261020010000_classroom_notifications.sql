create table if not exists public.classroom_notifications (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  target_class_group_id text references public.class_groups(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  message text not null check (char_length(message) between 1 and 500),
  kind text not null check (kind in ('standard','custom','silence')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 minutes')
);

alter table public.classroom_notifications enable row level security;

drop policy if exists "Students can read current classroom notifications" on public.classroom_notifications;
create policy "Students can read current classroom notifications"
  on public.classroom_notifications for select to anon, authenticated
  using (expires_at > now());

drop policy if exists "Teachers can send classroom notifications" on public.classroom_notifications;
create policy "Teachers can send classroom notifications"
  on public.classroom_notifications for insert to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.classrooms c
      where c.id = classroom_id and c.teacher_id = auth.uid()
    )
    and (
      target_class_group_id is null
      or exists (
        select 1 from public.class_groups g
        where g.id = target_class_group_id and g.classroom_id = classroom_id
      )
    )
  );

grant select on public.classroom_notifications to anon, authenticated;
grant insert on public.classroom_notifications to authenticated;
create index if not exists classroom_notifications_active_idx
  on public.classroom_notifications (classroom_id, created_at desc);
