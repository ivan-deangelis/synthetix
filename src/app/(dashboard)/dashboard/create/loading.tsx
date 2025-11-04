import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SchemaBuilderSkeleton } from "@/components/SchemaBuilderSkeleton";

export default function CreatePageLoading() {
    return (
        <main className="flex flex-col gap-6 mx-auto w-full">
            <Skeleton className="h-7 w-32" />

            {/* API Name */}
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full" />
            </div>

            {/* API Description */}
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full" />
            </div>

            {/* Visibility */}
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>

            <Separator className="my-2 md:my-4 bg-zinc-200 dark:bg-zinc-800" />

            {/* Schema Builder */}
            <SchemaBuilderSkeleton fieldCount={1} />

            {/* Action Buttons */}
            <div className="flex items-center mt-4 gap-4 ml-auto">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
            </div>
        </main>
    );
}
