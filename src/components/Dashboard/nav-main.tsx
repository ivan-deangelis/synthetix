"use client";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";

export function NavMain({
    items,
    pathname,
}: {
    items: {
        title: string;
        url: string;
        icon?: React.ReactElement;
    }[];
    pathname: string;
}) {
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem className="mb-4">
                        <Link href="/dashboard/create">
                            <SidebarMenuButton className="justify-center border border-purple-600 bg-gradient-to-r from-purple-700 via-purple-900 to-purple-700 cursor-pointer hover:scale-[1.02] transition-all">
                                <Plus className="!size-5" />
                                <span>Create API</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <Link href={item.url} className="w-full">
                                <SidebarMenuButton
                                    className={cn(
                                        "hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 transition-colors cursor-pointer",
                                        pathname === item.url &&
                                            "bg-primary text-primary-foreground"
                                    )}
                                    tooltip={item.title}
                                >
                                    {item.icon && item.icon}
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
