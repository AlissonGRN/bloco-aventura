create table if not exists private.bloco_join_attempts (
  user_id uuid not null,
  attempted_at timestamptz not null default now()
);
create index if not exists bloco_join_attempts_user_time_idx
  on private.bloco_join_attempts (user_id, attempted_at desc);
alter table private.bloco_join_attempts enable row level security;
revoke all on private.bloco_join_attempts from public, anon, authenticated;
