import ApiCard from "@/components/ApiCard";
import { createServerSupabaseClient } from "@/supabase/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const supabase = await createServerSupabaseClient();
  const { userId } = await auth();

  const { data: apiSets } = await supabase
    .from("api_sets")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (!apiSets || apiSets.length === 0) {
    return (
      <div className="text-muted-foreground">
        No public API sets available yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {apiSets.map((apiSet) => (
        <ApiCard
          key={apiSet.id}
          {...apiSet}
          isCreator={apiSet.user_id === userId}
        />
      ))}
    </div>
  );
}
