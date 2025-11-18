import { Database } from "@/types/database.types";
import { auth } from "@clerk/nextjs/server";

import { createClient } from "@supabase/supabase-js";

export async function createServerSupabaseClient() {
  const clerkAuth = await auth();
  const token = await clerkAuth.getToken();
  
  // For local development, use service role key if Clerk token is not available
  // or if we're using local Supabase
  const isLocalSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost');
  
  // Use internal Docker network URL for server-side connections
  const supabaseUrl = process.env.SUPABASE_URL_INTERNAL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  
  if (isLocalSupabase && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Use service role key for local development
    return createClient<Database>(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  
  // For production, use Clerk token
  return createClient<Database>(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return token;
      },
    },
  );
}
