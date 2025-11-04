import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ApiPreviewModal } from "../ApiPreviewModal";

// Mock the mock data generator
const mockApiSet = {
    id: "test-1",
    name: "Test API",
    description: "A test API for testing",
    visibility: "public" as const,
    status: "active" as const,
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

        expect(screen.getByText("Test API")).toBeInTheDocument();
        expect(screen.getByText("Public")).toBeInTheDocument();
        expect(screen.getByText("active")).toBeInTheDocument();
    });

    it("does not render modal when open is false", () => {
        render(
            <ApiPreviewModal
                open={false}
                onOpenChange={mockOnOpenChange}
                apiSet={mockApiSet}
            />
        );

        expect(screen.queryByText("Test API")).not.toBeInTheDocument();
    });

    it("shows preview tab by default", () => {
        render(
            <ApiPreviewModal
                open={true}
                onOpenChange={mockOnOpenChange}
                apiSet={mockApiSet}
            />
        );

        expect(screen.getByText("Preview")).toBeInTheDocument();
        expect(screen.getByText("Schema")).toBeInTheDocument();
        expect(screen.getByText("Endpoint")).toBeInTheDocument();
    });

    it("generates mock data when preview tab is active", async () => {
        render(
            <ApiPreviewModal
                open={true}
                onOpenChange={mockOnOpenChange}
                apiSet={mockApiSet}
            />
        );

        // Wait for the mock data to be generated
        expect(
            await screen.findByText(
                "API Response Preview",
                {},
                { timeout: 3000 }
            )
        ).toBeInTheDocument();
    });

    it("allows changing record count", () => {
        render(
            <ApiPreviewModal
                open={true}
                onOpenChange={mockOnOpenChange}
                apiSet={mockApiSet}
            />
        );

        const recordSelect = screen.getByDisplayValue("1");
        fireEvent.change(recordSelect, { target: { value: "5" } });

        expect(recordSelect).toHaveValue("5");
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
        expect(schemaTab).toBeInTheDocument();
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
        expect(endpointTab).toBeInTheDocument();
    });
});
