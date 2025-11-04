import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Route matcher for public routes that don't require authentication.
 * 
 * Public routes include:
 * - "/" - Landing page
 * - "/sign-in(.*)" - Sign in pages and related routes
 * - "/sign-up(.*)" - Sign up pages and related routes
 * - "/api/v1(.*)" - Public API endpoints
 */
const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/v1(.*)",
]);

/**
 * Clerk middleware for handling authentication across the application.
 * 
 * This middleware:
 * - Allows unrestricted access to public routes
 * - Protects all other routes by requiring authentication
 * - Redirects unauthenticated users to sign-in page
 * 
 * Protected routes include:
 * - /dashboard - User dashboard
 * - /community - Community features
 * - /api (excluding /api/v1) - Internal API routes
 * - Any other routes not marked as public
 */
export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

/**
 * Middleware configuration for Next.js.
 * 
 * The matcher pattern ensures middleware runs on:
 * - All routes except Next.js internals (_next)
 * - All routes except static files (images, fonts, css, js, etc.)
 * - All API and tRPC routes
 * 
 * This configuration optimizes performance by avoiding middleware
 * execution for static assets while ensuring all dynamic routes
 * are properly authenticated.
 */
export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
