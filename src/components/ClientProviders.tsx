"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as AppToaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Navigation from "@/components/Navigation";
import React from "react";

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = React.useState(() => new QueryClient());
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <AppToaster />
                <Sonner />
                <div className="min-h-screen bg-background">{children}</div>
            </TooltipProvider>
        </QueryClientProvider>
    );
}
