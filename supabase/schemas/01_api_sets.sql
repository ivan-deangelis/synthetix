-- Declarative schema for public.api_sets and related types

create type public.api_set_status as enum ('active', 'inactive', 'draft', 'archived', 'processing');
create type public.api_set_visibility as enum ('public', 'private');

create table public.api_sets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  visibility public.api_set_visibility not null default 'private',
  status public.api_set_status not null default 'draft',
  user_id text not null default auth.jwt()->>'sub',
  subdomain text default null,
  api_secret text default null,
  schema jsonb not null default '{}',
  headers jsonb not null default '{}',
  created_at timestamptz default now()
);

create index idx_api_sets_user_id on public.api_sets(user_id);

alter table public.api_sets enable row level security;

create policy "Users can view all api sets" on public.api_sets
  for select to authenticated, anon
  using (true);

create policy "Users can insert own api_sets" on public.api_sets
  as permissive
  for insert to authenticated
  with check (
    ((select auth.jwt()->>'sub') = (user_id)::text)
  );

create policy "Users can update own api_sets" on public.api_sets
  for update to authenticated
  using ((select auth.jwt()->>'sub') = (user_id)::text)
  with check ((select auth.jwt()->>'sub') = (user_id)::text);

create policy "Users can delete own api_sets" on public.api_sets
  for delete to authenticated
  using ((select auth.jwt()->>'sub') = (user_id)::text);


