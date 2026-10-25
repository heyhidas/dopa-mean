-- Close direct access to the install counter table. Apply only after the app
-- reads and bumps the counter through the RPC wrappers.

alter table public.installation_stats enable row level security;
revoke all on table public.installation_stats from anon, authenticated;

drop policy if exists "no direct access" on public.installation_stats;
create policy "no direct access" on public.installation_stats
  as restrictive for all to anon, authenticated using (false);

-- Default-deny for anything created later in public: new tables and functions must opt in with explicit grants.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
