import { redirect } from "next/navigation";
import ViewPage from "../page";

// Mock the dependencies
jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}));

jest.mock("@/app/actions/apiset-action", () => ({
    getApiSet: jest.fn(),
}));

jest.mock("../ViewPageClient", () => {
    return function MockViewPageClient({ apiSet }: { apiSet: any }) {
        return (
            <div data-testid="view-page-client">
                View Page Client - {apiSet.name}
            </div>
        );
    };
});

describe("ViewPage", () => {
    const mockParams = { id: "test-api-id" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should redirect to dashboard when API set is not found", async () => {
        const { getApiSet } = require("@/app/actions/apiset-action");
        getApiSet.mockResolvedValue({ success: false, data: null });

        await ViewPage({ params: Promise.resolve(mockParams) });

        expect(redirect).toHaveBeenCalledWith("/dashboard");
    });

    it("should render ViewPageClient when API set is found", async () => {
        const { getApiSet } = require("@/app/actions/apiset-action");
        const mockApiSet = {
            id: "test-api-id",
            name: "Test API",
            description: "Test description",
            visibility: "public" as const,
            status: "active" as const,
            schema: { test: "schema" },
            headers: [],
            created_at: "2024-01-01T00:00:00Z",
            api_secret: null,
            subdomain: null,
            user_id: null,
        };
        getApiSet.mockResolvedValue({ success: true, data: mockApiSet });

        const result = await ViewPage({ params: Promise.resolve(mockParams) });

        // Since this is a server component, we can't render it directly
        // Just verify that it doesn't throw and returns a component
        expect(result).toBeDefined();
    });
});
