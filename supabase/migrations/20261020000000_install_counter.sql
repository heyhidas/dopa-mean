-- Install counter: free-app infrastructure. Additive and idempotent.
-- The app reads and bumps the counter through two SECURITY INVOKER wrappers in public
-- that call SECURITY DEFINER functions in the non-exposed "private" schema.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

create table if not exists public.installation_stats (
  id    smallint primary key default 1 check (id = 1),
  count bigint   not null default 0 check (count >= 0)
);
-- Seed with the count carried over from the previous project.
insert into public.installation_stats (id, count) values (1, 1614) on conflict (id) do nothing;

create or replace function private.bump_installations() returns void
language sql security definer set search_path = '' as $$
  update public.installation_stats set count = count + 1;
$$;

create or replace function private.installation_count() returns bigint
language sql stable security definer set search_path = '' as $$
  select count from public.installation_stats limit 1;
$$;

revoke all on function private.bump_installations(), private.installation_count() from public;
grant execute on function private.bump_installations(), private.installation_count() to anon, authenticated;

drop function if exists public.increment_installations();
create function public.increment_installations() returns void
language sql security invoker set search_path = '' as $$
  select private.bump_installations();
$$;

drop function if exists public.get_installation_count();
create function public.get_installation_count() returns bigint
language sql stable security invoker set search_path = '' as $$
  select private.installation_count();
$$;

revoke all on function public.increment_installations(), public.get_installation_count() from public;
grant execute on function public.increment_installations(), public.get_installation_count() to anon, authenticated;
