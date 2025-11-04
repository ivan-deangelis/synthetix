import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ArrowRight,
    Code2,
    Database,
    Zap,
    Globe,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Hero from "@/components/Hero";
import { Badge } from "@/components/ui/badge";

const Homepage = () => {
    const features = [
        {
            icon: <Zap className="h-6 w-6" />,
            title: "Instant API Creation",
            description:
                "Define your data structure and get working endpoints in seconds",
        },
        {
            icon: <Database className="h-6 w-6" />,
            title: "Custom Data Types",
            description:
                "Support for strings, numbers, booleans, arrays, and complex objects",
        },
        {
            icon: <Globe className="h-6 w-6" />,
            title: "Public & Private APIs",
            description:
                "Share your APIs with the community or keep them private",
        },
        {
            icon: <Code2 className="h-6 w-6" />,
            title: "Developer Friendly",
            description:
                "Clean REST endpoints with comprehensive documentation",
        },
    ];

    const steps = [
        {
            step: "01",
            title: "Define Schema",
            description:
                "Create your data structure with our intuitive form builder",
        },
        {
            step: "02",
            title: "Generate Data",
            description:
                "We automatically create realistic mock data based on your schema",
        },
        {
            step: "03",
            title: "Get Endpoints",
            description:
                "Receive working API endpoints ready for your applications",
        },
        {
            step: "04",
            title: "Test & Share",
            description:
                "Use our built-in testing tools and share with your team",
        },
    ];

    const benefits = [
        <div className="text-sm font-medium">No backend setup required</div>,
        <div className="text-sm font-medium">
            Realistic mock data generation
        </div>,
        <div className="text-sm font-medium">RESTful API endpoints</div>,
        <div className="text-sm font-medium">Real-time API testing</div>,
        <div className="text-sm font-medium">
            Community marketplace <Badge variant="outline">Soon</Badge>
        </div>,
        <div className="text-sm font-medium">
            SaaS Templates <Badge variant="outline">Soon</Badge>
        </div>,
    ];

    return (
        <div className="min-h-screen">
            <Hero />

            {/* Features Section */}
            <section id="features" className="py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Everything you need to mock APIs
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Powerful features designed for developers who need
                            realistic mock data fast
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="p-6 text-center hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
                                    {feature.icon}
                                </div>
                                <h3 className="font-semibold text-lg mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    {feature.description}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            How it works
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            From idea to working API in four simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="text-center">
                                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                                    {step.step}
                                </div>
                                <h3 className="font-semibold text-lg mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    {step.description}
                                </p>
                                {index < steps.length - 1 && (
                                    <ArrowRight className="h-6 w-6 text-muted-foreground mx-auto mt-8 hidden lg:block" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section id="why-synthetix" className="py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Why choose Synthetix ?
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                Stop waiting for backend APIs. Start building
                                your frontend with realistic data today.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {benefits.map((benefit, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-3"
                                    >
                                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                                        <span className="text-sm font-medium">
                                            {benefit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8">
                                <Button asChild size="lg">
                                    <Link href="/create">
                                        Get Started Now
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="bg-gradient-card rounded-2xl p-8 lg:p-12">
                            <div className="space-y-4">
                                <div className="bg-card rounded-lg p-4 shadow-card">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-3 h-3 bg-success rounded-full"></div>
                                        <span className="text-sm font-mono">
                                            GET /api/v1/users?count=100
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                        Returns 100 mock user records
                                    </div>
                                </div>
                                <div className="bg-card rounded-lg p-4 shadow-card">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-3 h-3 bg-success rounded-full"></div>
                                        <span className="text-sm font-mono">
                                            GET /api/v1/products?count=50
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                        Returns 50 mock product records
                                    </div>
                                </div>
                                <div className="bg-card rounded-lg p-4 shadow-card">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-3 h-3 bg-success rounded-full"></div>
                                        <span className="text-sm font-mono">
                                            GET /api/v1/orders?count=200
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                        Returns 200 mock order records
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-32 bg-gradient-hero">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                        Ready to accelerate your development?
                    </h2>
                    <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                        Join us and start building your APIs today
                    </p>
                    <Button asChild variant="secondary" size="lg">
                        <Link href="/sign-in">
                            <Code2 className="h-5 w-5 mr-2" />
                            Create Your First API
                            <ArrowRight className="h-5 w-5 ml-2" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default Homepage;
