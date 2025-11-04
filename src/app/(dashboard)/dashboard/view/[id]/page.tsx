import { getApiSet } from "@/app/actions/apiset-action";
import { redirect } from "next/navigation";
import ViewPageClient from "./ViewPageClient";
import { auth } from "@clerk/nextjs/server";

export default async function ViewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const { success, data: apiSet } = await getApiSet(id);

    if (!success || !apiSet) {
        redirect("/dashboard");
        return null as any;
    }

    const { userId } = await auth();
    const isOwner = !!userId && apiSet.user_id === userId;

    return <ViewPageClient apiSet={apiSet} isOwner={isOwner} />;
}
