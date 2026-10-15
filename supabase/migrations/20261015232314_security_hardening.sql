-- Restrict direct calls to the DDL event-trigger helper and accept the latest world IDs.
alter table public.bloco_teams drop constraint if exists bloco_teams_last_level_check;
alter table public.bloco_teams add constraint bloco_teams_last_level_check
  check (last_level ~ '^(10|11|[1-9])-([1-9]|[12][0-9]|3[0-9]|40)$');
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
