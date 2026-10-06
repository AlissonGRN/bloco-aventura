-- PostgREST upsert requires UPDATE permission for the columns in its payload.
-- RLS and the immutable-identity trigger still constrain which rows can change.
grant update on public.bloco_teams to authenticated;
