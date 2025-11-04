"use client";

import * as React from "react";
import {
    Camera,
    Database,
    FileText,
    HelpCircle,
    Search,
    Settings,
    Bot,
    FileCode,
    Layers,
} from "lucide-react";

import { NavMain } from "@/components/Dashboard/nav-main";
import { NavSecondary } from "@/components/Dashboard/nav-secondary";
import { NavUser } from "@/components/Dashboard/nav-user";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { NAV_MAIN_ITEMS } from "@/components/Dashboard/routes";
import Link from "next/link";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: NAV_MAIN_ITEMS,
    navClouds: [
        {
            title: "Capture",
            icon: <Camera />,
            isActive: true,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
        {
            title: "Proposal",
            icon: <FileText />,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
        {
            title: "Prompts",
            icon: <Bot />,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Settings",
            url: "#",
            icon: <Settings />,
        },
        {
            title: "Get Help",
            url: "#",
            icon: <HelpCircle />,
        },
        {
            title: "Search",
            url: "#",
            icon: <Search />,
        },
    ],
    documents: [
        {
            name: "Data Library",
            url: "#",
            icon: <Database />,
        },
        {
            name: "Reports",
            url: "#",
            icon: <FileCode />,
        },
        {
            name: "Word Assistant",
            url: "#",
            icon: FileText,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link href="/" className="text-base font-semibold">
                                Synthetix
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} pathname={pathname} />
                {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
