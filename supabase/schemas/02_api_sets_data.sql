create table public.api_sets_data (
  id bigint primary key generated always as identity,
  api_set_id uuid not null references public.api_sets(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_api_sets_data_api_set_id on public.api_sets_data(api_set_id);

alter table public.api_sets_data enable row level security;

create policy "Users can view own api_sets_data" on public.api_sets_data
  for select to authenticated
  using (
    exists (
      select 1 from public.api_sets s
      where s.id = public.api_sets_data.api_set_id
        and s.user_id = auth.jwt()->>'sub'
    )
  );

create policy "Users can insert own api_sets_data" on public.api_sets_data
  for insert to authenticated
  with check (
    exists (
      select 1 from public.api_sets s
      where s.id = public.api_sets_data.api_set_id
        and s.user_id = auth.jwt()->>'sub'
    )
  );

create policy "Users can update own api_sets_data" on public.api_sets_data
  for update to authenticated
  using (
    exists (
      select 1 from public.api_sets s
      where s.id = public.api_sets_data.api_set_id
        and s.user_id = auth.jwt()->>'sub'
    )
  )
  with check (
    exists (
      select 1 from public.api_sets s
      where s.id = public.api_sets_data.api_set_id
          and s.user_id = auth.jwt()->>'sub'
    )
  );

create policy "Users can delete own api_sets_data" on public.api_sets_data
  for delete to authenticated
  using (
    exists (
      select 1 from public.api_sets s
      where s.id = public.api_sets_data.api_set_id
        and s.user_id = auth.jwt()->>'sub'
    )
  );


