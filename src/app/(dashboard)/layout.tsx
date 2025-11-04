import { NavHeader } from "@/components/Dashboard/nav-header";
import { AppSidebar } from "@/components/Dashboard/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { HeaderTitleProvider } from "@/components/Dashboard/header-title-context";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <HeaderTitleProvider>
                <SidebarInset>
                    <NavHeader />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main p-16 flex flex-1 flex-col gap-2">
                            {children}
                        </div>
                    </div>
                </SidebarInset>
            </HeaderTitleProvider>
        </SidebarProvider>
    );
}
