import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (session: any) =>
  createBrowserClient<Database>(
    supabaseUrl!,
    supabaseKey!,
    {
      accessToken: async () => session?.getToken() ?? null,
    },
  );
