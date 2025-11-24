# Synthetix - Setup Guide

This comprehensive guide covers everything you need to run Synthetix with Supabase.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Application Setup](#application-setup)
4. [Environment Configuration](#environment-configuration)
5. [Testing the Application](#testing-the-application)

---

## Prerequisites

### Required Tools

1. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
   - Required for running the application container
   - Ensure it's running before starting the application

### Required Cloud Services (Free Tiers Available)

1. **Supabase Account** - [Sign up here](https://supabase.com)

   - PostgreSQL database with real-time capabilities and built-in authentication
   - Free tier includes 500MB database, 1GB file storage, 50,000 monthly active users

2. **OpenAI API Key** - [Get it here](https://platform.openai.com/api-keys)
   - For AI-powered data generation
   - Pay-as-you-go pricing (very affordable for development)

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: synthetix (or any name you prefer)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Select the closest region to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for project initialization

### Step 2: Get API Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API keys**:
     - `anon` `public` key (safe to use in browser)

### Step 3: Configure Authentication

1. In your project dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled (it should be by default)
3. Configure email settings:
   - For testing purposes, disable the email confirmation from **Authentication** → **Sign In / Providers**

### Step 4: Configure Database Schema

1. In your project dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the following SQL:

```sql
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
```

4. Click **"Run"** to execute the SQL
5. Verify table was created: Go to **Table Editor** → You should see the `apis` table

---

## Application Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/ivan-deangelis/synthetix.git
cd synthetix
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor and fill in the values:

```env
# Supabase (from Supabase Setup Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Application URL (use localhost for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI (from OpenAI Platform)
OPENAI_API_KEY=sk-proj-...
```

### Step 3: Start the Application

1. Ensure Docker Desktop is running
2. Run:
   ```bash
   docker compose up -d --build
   ```
3. Wait for the build to complete (2-3 minutes first time)
4. Open: http://localhost:3000

### Step 4: Verify Installation

1. Navigate to http://localhost:3000
2. You should see the landing page
3. Click **"Sign Up"** and create a test account
4. After sign-up, you should be redirected to the dashboard

---

## Environment Configuration

### Complete Environment Variables Reference

| Variable                       | Description                      | Where to Get                         |
| ------------------------------ | -------------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`     | Your Supabase project URL        | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase anonymous/public key    | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_APP_URL`          | Application base URL             | Use `http://localhost:3000` for dev  |
| `OPENAI_API_KEY`               | OpenAI API key                   | OpenAI Platform → API Keys           |

### Security Best Practices

⚠️ **Important:**

- Never commit `.env` to version control (it's in `.gitignore`)
- Never share your `OPENAI_API_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Testing the Application

### End-to-End Test

Follow these steps to verify everything works:

1. **Sign Up**

   - Go to http://localhost:3000/signup
   - Create a new account with a valid email and password

2. **Sign In**

   - After sign-up, go to http://localhost:3000/login
   - Sign in with your email and password
   - You should be redirected to the dashboard

3. **Create API**

   - Click **"Create New API"**
   - Fill in:
     - Name: "Test Users API"
     - Description: "A test API for user data"
     - Endpoint slug: "test-users"
     - Schema definition: Start adding some fields or use AI generation

4. **Schema Builder**

   - Add fields manually:
     - Field: `name` (type: text)
     - Field: `email` (type: email)
     - Field: `age` (type: number)
   - Or use AI generation:
     - Enter description: "user profile with name, email, and age"
     - Click **"Generate with AI"**

5. **Generate Data**

   - Set count to 10
   - Click **"Generate"**
   - View generated data in preview

6. **Test API Endpoint**

   - Copy the endpoint URL
   - Test in browser or with curl:

     ```bash
     # Get single record
     curl http://localhost:3000/api/v1/[your-username]/[your-api-slug]

     # Get multiple records
     curl http://localhost:3000/api/v1/[your-username]/[your-api-slug]?limit=5
     ```

7. **Verify in Database**
   - Go to Supabase Dashboard → **Table Editor**
   - Check the `apis` table for your created API
   - Verify the `mock_data` column contains your generated data

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## Quick Reference

### Essential Commands

```bash
# Start application
docker compose up -d --build

# View logs
docker compose logs app -f

# Stop application
docker compose down

# Restart application
docker compose restart app

# View running containers
docker ps

# Clean up Docker
docker system prune -a
```

### Important URLs

**Application:**

- App: http://localhost:3000
- API: http://localhost:3000/api/v1/[username]/[api-slug]

**Cloud Services:**

- Supabase Dashboard: https://supabase.com/dashboard
- OpenAI Platform: https://platform.openai.com

**Recommended for Quick Start:** Supabase setup first, then application configuration.
