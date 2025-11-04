"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import ApiCard from "@/components/ApiCard";
import { Database } from "@/types/database.types";
import { ApiCardSkeleton } from "@/components/ApiCard";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { useSession } from "@clerk/nextjs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardClientProps {
    apiSets: Database["public"]["Tables"]["api_sets"]["Row"][] | null;
}

const DashboardClient = ({ apiSets }: DashboardClientProps) => {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [visibilityFilter, setVisibilityFilter] = useState<
        "all" | "public" | "private"
    >("all");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "active" | "inactive" | "draft" | "archived" | "processing"
    >("all");
    const { session } = useSession();

    const filteredApiSets = apiSets
        ?.filter((api) => {
            const q = searchQuery.toLowerCase();
            if (!q) return true;
            return (
                api.name.toLowerCase().includes(q) ||
                (api?.description?.toLowerCase() || "").includes(q)
            );
        })
        .filter((api) => {
            if (visibilityFilter === "all") return true;
            return api.visibility === visibilityFilter;
        })
        .filter((api) => {
            if (statusFilter === "all") return true;
            return api.status === statusFilter;
        });

    return (
        <main className="w-full">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search API sets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Visibility</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => setVisibilityFilter("all")}
                            >
                                {visibilityFilter === "all" ? "• " : ""}All
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setVisibilityFilter("public")}
                            >
                                {visibilityFilter === "public" ? "• " : ""}
                                Public
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setVisibilityFilter("private")}
                            >
                                {visibilityFilter === "private" ? "• " : ""}
                                Private
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Status</DropdownMenuLabel>
                            {(
                                [
                                    "all",
                                    "active",
                                    "draft",
                                    "inactive",
                                    "archived",
                                    "processing",
                                ] as const
                            ).map((s) => (
                                <DropdownMenuItem
                                    key={s}
                                    onClick={() => setStatusFilter(s as any)}
                                >
                                    {statusFilter === s ? "• " : ""}
                                    {s[0].toUpperCase() + s.slice(1)}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex border rounded-lg">
                        <Button
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("grid")}
                            className="rounded-r-none"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className="rounded-l-none"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-card rounded-xl p-6 border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total APIs
                            </p>
                            <p className="text-2xl font-bold">
                                {apiSets?.length}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"
                            onClick={() => router.push("/dashboard/create")}
                        >
                            <Plus className="h-6 w-6 text-primary" />
                        </Button>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-6 border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Public APIs
                            </p>
                            <p className="text-2xl font-bold">
                                {
                                    apiSets?.filter(
                                        (api) => api.visibility === "public"
                                    ).length
                                }
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                            <Filter className="h-6 w-6 text-accent" />
                        </div>
                    </div>
                </div>
            </div>

            {/* API Sets Grid */}
            {filteredApiSets?.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                        No API sets found
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        {searchQuery
                            ? "Try adjusting your search terms"
                            : "Create your first API set to get started"}
                    </p>
                    {!searchQuery && (
                        <Button asChild variant="default">
                            <Link href="/dashboard/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First API
                            </Link>
                        </Button>
                    )}
                </div>
            ) : (
                <div
                    className={
                        viewMode === "grid"
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            : "space-y-4"
                    }
                >
                    <Suspense
                        fallback={Array.from({ length: 3 }).map((_, index) => (
                            <ApiCardSkeleton key={index} />
                        ))}
                    >
                        {filteredApiSets?.map((apiSet) => (
                            <ApiCard
                                key={apiSet.id}
                                {...apiSet}
                                isCreator={true}
                            />
                        ))}
                    </Suspense>
                </div>
            )}
        </main>
    );
};

export default DashboardClient;
