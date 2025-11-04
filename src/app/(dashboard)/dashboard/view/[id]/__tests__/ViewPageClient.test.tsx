import { render, screen } from "@testing-library/react";
import ViewPageClient from "../ViewPageClient";
import { HeaderTitleProvider } from "@/components/Dashboard/header-title-context";

// Mock Next.js router
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        back: jest.fn(),
        push: jest.fn(),
    }),
    useSearchParams: () => ({
        get: jest.fn(() => null),
    }),
}));

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(),
    },
});

describe("ViewPageClient", () => {
    const mockApiSet = {
        id: "test-api-id",
        name: "Test API",
        description: "This is a test API description",
        visibility: "public" as const,
        status: "active" as const,
        schema: {
            user: {
                type: "object",
                fields: {
                    id: { type: "string" },
                    name: { type: "string" },
                    email: { type: "string" },
                },
            },
        },
        headers: [
            { key: "Content-Type", value: "application/json" },
            { key: "Authorization", value: "Bearer token" },
        ],
        created_at: "2024-01-01T00:00:00Z",
        api_secret: null,
        subdomain: null,
        user_id: "user-1",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders API name and description", () => {
        render(
            <HeaderTitleProvider>
                <ViewPageClient apiSet={mockApiSet} />
            </HeaderTitleProvider>
        );

        // Use more specific selectors
        expect(screen.getByRole("heading", { name: "Test API" })).toBeTruthy();
        expect(
            screen.getAllByText("This is a test API description").length
        ).toBeGreaterThan(0);
    });

    it("displays correct status and visibility badges", () => {
        render(
            <HeaderTitleProvider>
                <ViewPageClient apiSet={mockApiSet} />
            </HeaderTitleProvider>
        );

        // Check that badges exist (multiple instances are expected)
        expect(screen.getAllByText("Public").length).toBeGreaterThan(0);
        expect(screen.getAllByText("active").length).toBeGreaterThan(0);
    });

    it("shows overview cards with correct information", () => {
        render(
            <HeaderTitleProvider>
                <ViewPageClient apiSet={mockApiSet} />
            </HeaderTitleProvider>
        );

        // Check for overview cards
        expect(screen.getByText("Schema Fields")).toBeTruthy();
        expect(screen.getByText("Headers")).toBeTruthy();
        expect(screen.getAllByText("Created").length).toBeGreaterThan(0);
        expect(screen.getByText("API ID")).toBeTruthy();
    });

    it("displays tabs for different sections", () => {
        render(
            <HeaderTitleProvider>
                <ViewPageClient apiSet={mockApiSet} />
            </HeaderTitleProvider>
        );

        expect(screen.getByText("Overview")).toBeTruthy();
        expect(screen.getByText("Schema")).toBeTruthy();
        expect(screen.getByText("Endpoint")).toBeTruthy();
    });

    it("shows action buttons", () => {
        render(
            <HeaderTitleProvider>
                <ViewPageClient apiSet={mockApiSet} isOwner />
            </HeaderTitleProvider>
        );

        // "Edit API" should render as a link (Button asChild -> Link)
        expect(screen.getByRole("link", { name: /Edit API/ })).toBeTruthy();
    });

    it("shows expandable object fields in schema summary", () => {
        render(
            <HeaderTitleProvider>
                <ViewPageClient apiSet={mockApiSet} />
            </HeaderTitleProvider>
        );

        // Check that the object field is displayed with expandable functionality
        expect(screen.getByText("user")).toBeTruthy();
        expect(screen.getByText("object (3 fields)")).toBeTruthy();
    });
});
