"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Filter,
    TrendingUp,
    Star,
    Download,
    Eye,
    Users,
    Globe,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";

const Community = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const categories = [
        { id: "all", name: "All Categories", count: 245 },
        { id: "ecommerce", name: "E-commerce", count: 52 },
        { id: "social", name: "Social Media", count: 38 },
        { id: "fintech", name: "FinTech", count: 29 },
        { id: "healthcare", name: "Healthcare", count: 24 },
        { id: "education", name: "Education", count: 19 },
        { id: "productivity", name: "Productivity", count: 31 },
        { id: "gaming", name: "Gaming", count: 15 },
    ];

    const publicApis = [
        {
            id: "1",
            name: "Modern E-commerce",
            description:
                "Complete store API with products, categories, cart, orders, and payment processing",
            author: "Sarah Chen",
            category: "ecommerce",
            downloads: 2841,
            stars: 156,
            views: 8234,
            recordCount: 1500,
            endpoints: 12,
            tags: ["products", "orders", "payments", "inventory"],
            featured: true,
        },
        {
            id: "2",
            name: "Social Network Starter",
            description:
                "Social media platform with posts, comments, likes, follows, and messaging",
            author: "Alex Rodriguez",
            category: "social",
            downloads: 1923,
            stars: 89,
            views: 5621,
            recordCount: 2300,
            endpoints: 15,
            tags: ["posts", "comments", "users", "messaging"],
            featured: true,
        },
        {
            id: "3",
            name: "FinTech Dashboard",
            description:
                "Financial application API with accounts, transactions, budgets, and analytics",
            author: "Marcus Johnson",
            category: "fintech",
            downloads: 1456,
            stars: 78,
            views: 4532,
            recordCount: 980,
            endpoints: 10,
            tags: ["transactions", "accounts", "budgets", "analytics"],
            featured: false,
        },
        {
            id: "4",
            name: "Task Management Pro",
            description:
                "Project management with tasks, teams, time tracking, and reporting",
            author: "Emma Wilson",
            category: "productivity",
            downloads: 1234,
            stars: 65,
            views: 3987,
            recordCount: 750,
            endpoints: 9,
            tags: ["tasks", "projects", "teams", "time-tracking"],
            featured: false,
        },
        {
            id: "5",
            name: "Learning Platform",
            description:
                "Educational platform with courses, lessons, quizzes, and student progress",
            author: "David Kim",
            category: "education",
            downloads: 987,
            stars: 43,
            views: 2876,
            recordCount: 1200,
            endpoints: 11,
            tags: ["courses", "lessons", "quizzes", "progress"],
            featured: false,
        },
        {
            id: "6",
            name: "Healthcare Records",
            description:
                "Patient management system with appointments, medical records, and prescriptions",
            author: "Dr. Lisa Parker",
            category: "healthcare",
            downloads: 756,
            stars: 34,
            views: 2143,
            recordCount: 890,
            endpoints: 8,
            tags: ["patients", "appointments", "records", "prescriptions"],
            featured: false,
        },
    ];

    const filteredApis = publicApis.filter((api) => {
        const matchesSearch =
            api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            api.tags.some((tag) =>
                tag.toLowerCase().includes(searchQuery.toLowerCase())
            );
        const matchesCategory =
            selectedCategory === "all" || api.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const featuredApis = publicApis.filter((api) => api.featured);

    return null; // not implemented yet

    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="pt-16">
                {/* Header */}
                <div className="border-b bg-card/50 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center max-w-3xl mx-auto">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                Community{" "}
                                <span className="text-gradient">
                                    Marketplace
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground mb-6">
                                Discover, fork, and remix APIs created by the
                                community
                            </p>
                            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                    <Globe className="h-4 w-4" />
                                    <span>245 Public APIs</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4" />
                                    <span>1.2k+ Developers</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Download className="h-4 w-4" />
                                    <span>50k+ Downloads</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Featured Section */}
                    <section className="mb-12">
                        <div className="flex items-center space-x-2 mb-6">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-bold">
                                Trending This Week
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {featuredApis.slice(0, 2).map((api) => (
                                <div
                                    key={api.id}
                                    className="card-interactive relative overflow-hidden"
                                >
                                    <div className="absolute top-4 right-4">
                                        <Badge
                                            variant="default"
                                            className="bg-gradient-primary border-0"
                                        >
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            Featured
                                        </Badge>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold mb-2">
                                            {api.name}
                                        </h3>
                                        <p className="text-muted-foreground mb-4">
                                            {api.description}
                                        </p>
                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                                            <span>by {api.author}</span>
                                            <div className="flex items-center space-x-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span>{api.stars}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Download className="h-4 w-4" />
                                                <span>
                                                    {api.downloads.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {api.tags.slice(0, 3).map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                asChild
                                                size="sm"
                                                className="flex-1"
                                            >
                                                <Link
                                                    href={`/dashboard/view/${api.id}`}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Search and Filters */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar */}
                        <div className="lg:w-64 space-y-6">
                            <div>
                                <h3 className="font-semibold mb-3">Search</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search APIs..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">
                                    Categories
                                </h3>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() =>
                                                setSelectedCategory(category.id)
                                            }
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                selectedCategory === category.id
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-secondary"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{category.name}</span>
                                                <span className="text-xs opacity-70">
                                                    {category.count}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">
                                    {selectedCategory === "all"
                                        ? "All APIs"
                                        : categories.find(
                                              (c) => c.id === selectedCategory
                                          )?.name}
                                    <span className="text-muted-foreground ml-2">
                                        ({filteredApis.length})
                                    </span>
                                </h2>
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Sort by
                                </Button>
                            </div>

                            {filteredApis.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        No APIs found
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {filteredApis.map((api) => (
                                        <div
                                            key={api.id}
                                            className="card-interactive"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="text-lg font-semibold">
                                                            {api.name}
                                                        </h3>
                                                        {api.featured && (
                                                            <Badge
                                                                variant="default"
                                                                className="bg-gradient-primary border-0 text-xs"
                                                            >
                                                                Featured
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-muted-foreground text-sm mb-3">
                                                        {api.description}
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                        <span>
                                                            by {api.author}
                                                        </span>
                                                        <span>
                                                            {api.endpoints}{" "}
                                                            endpoints
                                                        </span>
                                                        <span>
                                                            {api.recordCount.toLocaleString()}{" "}
                                                            records
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {api.tags.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center space-x-1">
                                                        <Star className="h-4 w-4" />
                                                        <span>{api.stars}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Download className="h-4 w-4" />
                                                        <span>
                                                            {api.downloads.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Eye className="h-4 w-4" />
                                                        <span>
                                                            {api.views.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={`/dashboard/view/${api.id}`}
                                                        >
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Fork
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Community;
