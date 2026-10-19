create table if not exists public.classroom_proposals (
  class_group_id text primary key references public.class_groups(id) on delete cascade,
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  title text not null default 'Atividade proposta para a aula' check (char_length(title) between 1 and 100),
  level_ids text[] not null default '{}' check (cardinality(level_ids) between 1 and 20),
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.classroom_proposals enable row level security;

drop policy if exists "Students can read classroom proposals" on public.classroom_proposals;
create policy "Students can read classroom proposals"
  on public.classroom_proposals for select
  to anon, authenticated
  using (true);

drop policy if exists "Teachers can create classroom proposals" on public.classroom_proposals;
create policy "Teachers can create classroom proposals"
  on public.classroom_proposals for insert
  to authenticated
  with check (
    updated_by = auth.uid()
    and exists (
      select 1 from public.classrooms c
      join public.teacher_profiles tp on tp.id = auth.uid()
      where c.id = classroom_id and c.teacher_id = auth.uid()
    )
    and exists (
      select 1 from public.class_groups cg
      where cg.id = class_group_id and cg.classroom_id = classroom_id
    )
  );

drop policy if exists "Teachers can update classroom proposals" on public.classroom_proposals;
create policy "Teachers can update classroom proposals"
  on public.classroom_proposals for update
  to authenticated
  using (
    exists (
      select 1 from public.classrooms c
      join public.teacher_profiles tp on tp.id = auth.uid()
      where c.id = classroom_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    updated_by = auth.uid()
    and exists (
      select 1 from public.classrooms c
      join public.teacher_profiles tp on tp.id = auth.uid()
      where c.id = classroom_id and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "Teachers can delete classroom proposals" on public.classroom_proposals;
create policy "Teachers can delete classroom proposals"
  on public.classroom_proposals for delete
  to authenticated
  using (
    exists (
      select 1 from public.classrooms c
      join public.teacher_profiles tp on tp.id = auth.uid()
      where c.id = classroom_id and c.teacher_id = auth.uid()
    )
  );

grant select on public.classroom_proposals to anon, authenticated;
grant insert, update, delete on public.classroom_proposals to authenticated;
