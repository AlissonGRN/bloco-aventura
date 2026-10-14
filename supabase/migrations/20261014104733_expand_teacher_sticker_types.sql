alter table public.team_stickers
  drop constraint if exists team_stickers_type_check;

alter table public.team_stickers
  add constraint team_stickers_type_check check (
    type in (
      'teamwork',
      'persistence',
      'logic',
      'creativity',
      'debugger',
      'focus',
      'helper',
      'explorer',
      'kindness',
      'respect',
      'care',
      'participation',
      'learning-buddies',
      'organization',
      'responsibility',
      'patience',
      'bravery',
      'celebration'
    )
  );
