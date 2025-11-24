-- Create a table for APIs
create table apis (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  endpoint_slug text not null,
  schema_definition jsonb not null, -- Stores the structure of the API
  is_public boolean default true,
  mock_data jsonb default '[]'::jsonb,
  headers jsonb default '{}'::jsonb,
  status text default 'active' not null check (status in ('pending', 'generating', 'active', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(user_id, endpoint_slug)
);

alter table apis enable row level security;

create policy "Users can view their own APIs."
  on apis for select
  using ( auth.uid() = user_id );

create policy "Users can create their own APIs."
  on apis for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own APIs."
  on apis for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own APIs."
  on apis for delete
  using ( auth.uid() = user_id );

-- Public APIs are viewable by everyone (optional feature)
create policy "Public APIs are viewable by everyone."
  on apis for select
  using ( is_public = true );

  -- Create a function to look up user ID by username from auth.users
-- This function runs with security definer privileges to access the auth schema
create or replace function get_user_id_by_username(username text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  select id into target_id
  from auth.users
  where raw_user_meta_data->>'username' = username;
  
  return target_id;
end;
$$;

-- Grant execute permission to anon and authenticated roles
grant execute on function get_user_id_by_username(text) to anon, authenticated, service_role;
