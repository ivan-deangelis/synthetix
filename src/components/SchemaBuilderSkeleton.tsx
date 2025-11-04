import { Skeleton } from "@/components/ui/skeleton";

interface SchemaBuilderSkeletonProps {
    fieldCount?: number;
}

export function SchemaBuilderSkeleton({ fieldCount = 3 }: SchemaBuilderSkeletonProps) {
    return (
        <div>
            <Skeleton className="h-6 w-24 mb-4" />
            
            {/* Schema Fields */}
            <div className="space-y-5">
                {Array.from({ length: fieldCount }).map((_, index) => (
                    <div
                        key={index}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
                    >
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <Skeleton className="flex-1 min-w-[200px] h-9" />
                            <Skeleton className="w-40 sm:w-44 h-9" />
                            <Skeleton className="h-9 w-9" />
                            {index > 0 && <Skeleton className="h-9 w-9" />}
                        </div>
                    </div>
                ))}

                {/* Add Field Button */}
                <Skeleton className="h-9 w-32" />
            </div>
        </div>
    );
}
