"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    User,
    LogOut,
    Home,
    Briefcase,
    FileText,
    ArrowRight,
    Zap,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useClerk, useUser } from "@clerk/nextjs";

const Navigation = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { user } = useUser();
    const { signOut } = useClerk();

    const handleSignOut = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        try {
            await signOut({ redirectUrl: "/" });
        } catch (err) {
            // noop: optionally add toast here
            console.error("Sign out failed", err);
        }
    };

    const handleSmoothScroll = (
        e: React.MouseEvent<HTMLAnchorElement>,
        url: string
    ) => {
        if (url.startsWith("#")) {
            e.preventDefault();
            const targetId = url.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const offset = 100;
                const elementPosition =
                    targetElement.getBoundingClientRect().top;
                const offsetPosition =
                    elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });
                setActiveTab(
                    items.find((item) => item.url === url)?.name ||
                        items[0].name
                );
            }
        } else if (url === "/") {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
            setActiveTab("Home");
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Community", href: "/community" },
        { name: "Docs", href: "/docs" },
    ];

    const items = [
        { name: "Home", url: "/", icon: Home },
        { name: "Features", url: "#features", icon: Zap },
        { name: "How It Works", url: "#how-it-works", icon: Briefcase },
        { name: "Why Synthetix", url: "#why-synthetix", icon: FileText },
    ];

    const [activeTab, setActiveTab] = useState(items[0].name);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            className={cn(
                "fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-0 w-full max-w-7xl transition-all duration-300",
                isScrolled && "pt-6"
            )}
        >
            <div
                className={cn(
                    "flex items-center justify-between p-2 rounded-full",
                    isScrolled &&
                        "bg-black/60 border border-border backdrop-blur-lg shadow-lg"
                )}
            >
                <img src="/logo.png" alt="logo" className="w-[10rem] h-auto" />
                <div className="flex items-center gap-3">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.name;

                        return (
                            <Link
                                key={item.name}
                                href={item.url}
                                onClick={(e) => {
                                    handleSmoothScroll(e, item.url);
                                }}
                                className={cn(
                                    "relative cursor-pointer text-sm px-6 py-2 rounded-full transition-colors",
                                    "text-foreground/80 hover:text-primary"
                                    // isActive && "bg-muted text-primary",
                                )}
                            >
                                <span className="hidden md:inline">
                                    {item.name}
                                </span>
                                <span className="md:hidden">
                                    <Icon size={18} strokeWidth={2.5} />
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="lamp"
                                        className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                        }}
                                    >
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                                            <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                                            <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                                            <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                                        </div>
                                    </motion.div>
                                )}
                            </Link>
                        );
                    })}
                </div>
                {user ? (
                    <div className="hidden md:block">
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Avatar className="group size-10 rounded-full border-t border-purple-400 bg-gradient-to-b from-purple-700 to-slate-950/80 p-2 text-white shadow-lg shadow-purple-600/20 transition-all hover:shadow-purple-600/40">
                                    <AvatarImage
                                        src={user.imageUrl}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-transparent">
                                        {user.username?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>
                                    {user.username}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Link href="/dashboard">Dashboard</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleSignOut}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ) : (
                    <Link href="/sign-up" className="hidden md:block">
                        <Button
                            className="group rounded-full border-t border-purple-400 bg-gradient-to-b from-purple-700 to-slate-950/80 p-2 text-white shadow-lg shadow-purple-600/20 transition-all hover:shadow-purple-600/40"
                            size="default"
                        >
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Navigation;
