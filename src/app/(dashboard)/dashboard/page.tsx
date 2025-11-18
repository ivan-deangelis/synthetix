import DashboardClient from "./DashboardClient";
import { createServerSupabaseClient } from "@/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createServerSupabaseClient();

  const { data: apiSets } = await supabase
    .from("api_sets")
    .select("*")
    .eq("user_id", userId);

  return <DashboardClient apiSets={apiSets ?? []} />;
}
