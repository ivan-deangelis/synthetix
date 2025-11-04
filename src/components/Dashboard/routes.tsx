"use client";

import * as React from "react";
import { Home, BarChart3, FileText } from "lucide-react";

export type NavItem = {
    title: string;
    url: string;
    icon?: React.ReactElement;
};

export const NAV_MAIN_ITEMS: NavItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: <Home /> },
    {
        title: "Public Endpoints",
        url: "/dashboard/community",
        icon: <FileText />,
    },
    // { title: "Analytics", url: "/dashboard/analytics", icon: <BarChart3 /> },
];

export const ROUTE_LABELS: Record<string, string> = Object.fromEntries(
    NAV_MAIN_ITEMS.map((item) => [item.url, item.title])
);

export function getRouteLabel(pathname: string): string {
    const direct = ROUTE_LABELS[pathname];
    if (direct) return direct;
    const last = pathname.split("/").filter(Boolean).pop() || "";
    if (!last || last === "dashboard") return "Dashboard";
    return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
