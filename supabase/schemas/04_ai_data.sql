create table public.ai_data (
    id uuid primary key default gen_random_uuid(),
    api_set_id uuid not null,
    created_by text not null default auth.jwt()->>'sub',
    field_name text not null,
    ai_prompt text not null,
    ai_constraints text,
    status text not null,
    result jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),

    foreign key (api_set_id) references public.api_sets(id)
);

create index idx_ai_data_api_set_id on public.ai_data (api_set_id);
create index idx_ai_data_created_by on public.ai_data (created_by);

alter table public.ai_data enable row level security;

create policy "Users can view own ai_data" on public.ai_data
  for select to authenticated, anon
  using (true);

create policy "Users can insert own ai_data" on public.ai_data
  as permissive
  for insert to authenticated
  with check (
    ((select auth.jwt()->>'sub') = (created_by)::text)
  );

create policy "Users can update own ai_data" on public.ai_data
  for update to authenticated
  using ((select auth.jwt()->>'sub') = (created_by)::text)
  with check ((select auth.jwt()->>'sub') = (created_by)::text);

create policy "Users can delete own ai_data" on public.ai_data
  for delete to authenticated
  using ((select auth.jwt()->>'sub') = (created_by)::text);

