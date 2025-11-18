import { getApiSet } from "@/app/actions/apiset-action";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EditPageClient from "./EditPageClient";

export const dynamic = "force-dynamic";

export default async function EditApiSetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { success, data: apiSet } = await getApiSet(id);

  if (!success || !apiSet) {
    redirect("/dashboard");
  }

  const { userId } = await auth();
  if (!userId || apiSet.user_id !== userId) {
    redirect(`/dashboard/view/${id}`);
  }

  return <EditPageClient apiSet={apiSet} />;
}
