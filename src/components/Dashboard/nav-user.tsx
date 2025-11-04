"use client";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { UserButton, useUser } from "@clerk/nextjs";

export function NavUser() {
    const { user } = useUser();

    return (
        <SidebarMenuButton size="lg" className="hover:bg-transparent">
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.username}</span>
                <span className="text-muted-foreground truncate text-xs">
                    {user?.emailAddresses[0].emailAddress}
                </span>
            </div>
            <UserButton />
        </SidebarMenuButton>
    );
}
