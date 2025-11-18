# Synthetix - Setup Guide

This comprehensive guide covers everything you need to run Synthetix with Supabase Cloud.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Cloud Setup](#supabase-cloud-setup)
3. [Clerk Authentication Setup](#clerk-authentication-setup)
4. [Application Setup](#application-setup)
5. [Environment Configuration](#environment-configuration)
6. [Testing the Application](#testing-the-application)

---

## Prerequisites

### Required Tools

1. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
   - Required for running the application container
   - Ensure it's running before starting the application

### Required Cloud Services (Free Tiers Available)

1. **Supabase Account** - [Sign up here](https://supabase.com)

   - PostgreSQL database with real-time capabilities
   - Free tier includes 500MB database, 1GB file storage, 50,000 monthly active users

2. **Clerk Account** - [Sign up here](https://clerk.com)

   - Authentication and user management
   - Free tier includes 10,000 monthly active users

3. **OpenAI API Key** - [Get it here](https://platform.openai.com/api-keys)
   - For AI-powered schema generation
   - Pay-as-you-go pricing (very affordable for development)

---

## Supabase Cloud Setup

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
     - `service_role` key (keep this secret!)

### Step 3: Configure Database Schema

1. In your project dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the following SQL:

```sql
-- Create api_sets table
CREATE TABLE IF NOT EXISTS public.api_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    schema JSONB NOT NULL DEFAULT '[]'::jsonb,
    endpoint_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create api_sets_data table
CREATE TABLE IF NOT EXISTS public.api_sets_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_set_id UUID REFERENCES public.api_sets(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_data table (for AI-generated field data)
CREATE TABLE IF NOT EXISTS public.ai_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_set_id UUID NOT NULL REFERENCES public.api_sets(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    ai_prompt TEXT NOT NULL,
    ai_constraints TEXT,
    status TEXT NOT NULL,
    result JSONB,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_sets_user_id ON public.api_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_api_sets_endpoint_id ON public.api_sets(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_api_sets_data_api_set_id ON public.api_sets_data(api_set_id);
CREATE INDEX IF NOT EXISTS idx_ai_data_api_set_id ON public.ai_data(api_set_id);
CREATE INDEX IF NOT EXISTS idx_ai_data_status ON public.ai_data(status);
CREATE INDEX IF NOT EXISTS idx_ai_data_created_by ON public.ai_data(created_by);

-- Enable Row Level Security
ALTER TABLE public.api_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_sets_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_sets
CREATE POLICY "Users can view own API sets" ON public.api_sets FOR SELECT
    USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create own API sets" ON public.api_sets FOR INSERT
    WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update own API sets" ON public.api_sets FOR UPDATE
    USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete own API sets" ON public.api_sets FOR DELETE
    USING (auth.jwt() ->> 'sub' = user_id);

-- RLS Policies for api_sets_data
CREATE POLICY "Users can view data for their API sets" ON public.api_sets_data FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.api_sets
            WHERE api_sets.id = api_sets_data.api_set_id
            AND api_sets.user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can create data for their API sets" ON public.api_sets_data FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.api_sets
            WHERE api_sets.id = api_sets_data.api_set_id
            AND api_sets.user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Service role can read all data" ON public.api_sets_data FOR SELECT
    USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for ai_data
CREATE POLICY "Users can view own ai_data" ON public.ai_data
  FOR SELECT TO authenticated, anon
  USING(true);

CREATE POLICY "Users can insert own ai_data" ON public.ai_data
  AS permissive
  FOR INSERT TO authenticated
  WITH check (
    ((SELECT auth.jwt()->>'sub') = (created_by)::text)
  );

CREATE POLICY "Users can update own ai_data" ON public.ai_data
  FOR UPDATE TO authenticated
  USING ((SELECT auth.jwt()->>'sub') = (created_by)::text)
  WITH check ((SELECT auth.jwt()->>'sub') = (created_by)::text);

CREATE POLICY "Users can delete own ai_data" ON public.ai_data
  FOR DELETE TO authenticated
  USING ((SELECT auth.jwt()->>'sub') = (created_by)::text);

$$ LANGUAGE plpgsql SECURITY DEFINER;
```

4. Click **"Run"** to execute the SQL
5. Verify tables were created: Go to **Table Editor** → You should see `api_sets` and `api_sets_data`

---

## Clerk Authentication Setup

### Step 1: Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click **"Add application"** (or create new if first time)
3. Enter application name: **Synthetix**
4. Select authentication methods (recommended: Email + Google)
5. Click **"Create Application"**

### Step 2: Get Clerk API Keys

1. In your application dashboard, go to **API Keys**
2. Copy the following:
   - **Publishable key**: `pk_test_...` (for development)
   - **Secret key**: `sk_test_...` (for development)
   - Save these for later use

### Step 3: Integrate Clerk with Supabase

This is **critical** for authentication to work with Supabase!

https://clerk.com/docs/guides/development/integrations/databases/supabase

1. In the Clerk Dashboard, navigate to the [Supabase integration setup](https://dashboard.clerk.com/setup/supabase).
2. Select your configuration options, and then select Activate Supabase integration.
3. This will reveal the Clerk domain for your Clerk instance.
4. Save the Clerk domain.
5. In the Supabase Dashboard, navigate to [Authentication > Sign In / Up](https://supabase.com/dashboard/project/_/auth/third-party).
6. Select Add provider and select Clerk from the list of providers.
7. Paste the Clerk domain you copied from the Clerk Dashboard.

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
# Supabase Cloud (from Supabase Setup Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Clerk (from Clerk Setup Step 2)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs (keep these as is)
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in

# OpenAI
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

| Variable                            | Description                   | Where to Get                        |
| ----------------------------------- | ----------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`          | Your Supabase project URL     | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Supabase anonymous/public key | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key         | Clerk Dashboard → API Keys          |
| `CLERK_SECRET_KEY`                  | Clerk secret key              | Clerk Dashboard → API Keys          |
| `OPENAI_API_KEY`                    | OpenAI API key                | OpenAI Platform → API Keys          |

### Security Best Practices

⚠️ **Important:**

- Never commit `.env` to version control (it's in `.gitignore`)
- Keep `CLERK_SECRET_KEY` private

---

## Testing the Application

### End-to-End Test

Follow these steps to verify everything works:

1. **Sign Up**

   - Go to http://localhost:3000/sign-up
   - Create a new account
   - Verify email redirect works

2. **Dashboard Access**

   - After sign-up, you should see the dashboard
   - Try navigating between sections

3. **Create API**

   - Click **"Create New API"**
   - Fill in:
     - Name: "Test Users API"
     - Description: "A test API for user data"
   - Click **"Create"**

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
     curl http://localhost:3000/api/v1/[your-endpoint-id]

     # Get multiple records
     curl http://localhost:3000/api/v1/[your-endpoint-id]?count=5
     ```

7. **Verify in Database**
   - Go to Supabase Dashboard → **Table Editor**
   - Check `api_sets` table for your API
   - Check `api_sets_data` table for generated data
   - Check `ai_data` table for ai generated data

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
- API: http://localhost:3000/api/v1/[endpoint-id]

**Cloud Services:**

- Supabase Dashboard: https://supabase.com/dashboard
- Clerk Dashboard: https://dashboard.clerk.com
- OpenAI Platform: https://platform.openai.com

**Recommended for Quick Start:** Supabase first, then Clerk, then Application.
