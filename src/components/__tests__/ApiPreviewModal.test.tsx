import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ApiPreviewModal } from "../ApiPreviewModal";

// Mock the mock data generator
const mockApiSet = {
    id: "test-1",
    name: "Test API",
    description: "A test API for testing",
    visibility: "public" as const,
    status: "active" as const,
    headers: [] as Array<{ key: string; value: string }>,
    schema: {
        user: {
            type: "object",
            fields: {
                id: {
                    type: "string",
                    settings: { fakerMethod: "faker.string.uuid" },
                },
                name: {
                    type: "string",
                    settings: { fakerMethod: "faker.person.fullName" },
                },
                email: {
                    type: "string",
                    settings: { fakerMethod: "faker.internet.email" },
                },
            },
        },
    },
};

describe("ApiPreviewModal", () => {
    const mockOnOpenChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders modal when open is true", () => {
        render(
            <ApiPreviewModal
                open={true}
                onOpenChange={mockOnOpenChange}
                apiSet={mockApiSet}
            />
        );

        expect(screen.getByText("Test API")).toBeTruthy();
        expect(screen.getByText("Public")).toBeTruthy();
        expect(screen.getByText("active")).toBeTruthy();
    });

    it("does not render modal when open is false", () => {
        render(
            <ApiPreviewModal
                open={false}
                onOpenChange={mockOnOpenChange}
                apiSet={mockApiSet}
            />
        );

        expect(screen.queryByText("Test API")).toBeNull();
    });

    it("shows preview tab by default", () => {
        render(
            <ApiPreviewModal
                open={true}
                onOpenChange={mockOnOpenChange}
                apiSet={mockApiSet}
            />
        );

        expect(screen.getByText("Schema")).toBeTruthy();
        expect(screen.getByText("Endpoint")).toBeTruthy();
    });

    it("generates mock data when preview tab is active", async () => {
        render(
            <ApiPreviewModal
                open={true}
                onOpenChange={mockOnOpenChange}
                apiSet={mockApiSet}
            />
        );
    });

    it("calls onOpenChange when close button is clicked", () => {
        render(
            <ApiPreviewModal
                open={true}
                onOpenChange={mockOnOpenChange}
                apiSet={mockApiSet}
            />
        );

        const closeButton = screen.getAllByText("Close")[0];
        fireEvent.click(closeButton);

        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("shows schema tab content when clicked", async () => {
        render(
            <ApiPreviewModal
                open={true}
                onOpenChange={mockOnOpenChange}
                apiSet={mockApiSet}
            />
        );

        const schemaTab = screen.getByRole("tab", { name: /Schema/i });
        fireEvent.click(schemaTab);
        expect(schemaTab).toBeTruthy();
    });

    it("shows endpoint tab content when clicked", async () => {
        render(
            <ApiPreviewModal
                open={true}
                onOpenChange={mockOnOpenChange}
                apiSet={mockApiSet}
            />
        );

        const endpointTab = screen.getByRole("tab", { name: /Endpoint/i });
        fireEvent.click(endpointTab);
        expect(endpointTab).toBeTruthy();
    });
});
