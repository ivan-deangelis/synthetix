import { render, screen } from "@testing-library/react";
import { SchemaBuilder } from "../SchemaBuilder";

// Mock crypto.randomUUID for testing
Object.defineProperty(global, "crypto", {
    value: {
        randomUUID: jest.fn(
            () => "mock-uuid-" + Math.random().toString(36).substring(2, 15)
        ),
    },
});

describe("SchemaBuilder", () => {
    const mockOnSchemaChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders schema builder with initial fields", () => {
        render(
            <SchemaBuilder
                initialSchema={{}}
                onSchemaChange={mockOnSchemaChange}
            />
        );

        expect(screen.getByText("API Schema")).toBeTruthy();
        expect(screen.getByText("Add Field")).toBeTruthy();
    });

    it("displays object fields with nested fields when editing existing schema", () => {
        const mockSchema = {
            user: {
                type: "object",
                fields: {
                    id: { type: "string" },
                    name: { type: "string" },
                    email: { type: "string" },
                },
            },
        };

        render(
            <SchemaBuilder
                initialSchema={mockSchema}
                onSchemaChange={mockOnSchemaChange}
            />
        );

        // Should show the main object field
        expect(screen.getByDisplayValue("user")).toBeTruthy();

        // Should show the nested fields within the object
        expect(screen.getByDisplayValue("id")).toBeTruthy();
        expect(screen.getByDisplayValue("name")).toBeTruthy();
        expect(screen.getByDisplayValue("email")).toBeTruthy();
    });

    it("displays array object fields with nested fields", () => {
        const mockSchema = {
            users: {
                type: "array",
                count: 5,
                items: {
                    type: "object",
                    fields: {
                        id: { type: "string" },
                        name: { type: "string" },
                    },
                },
            },
        };

        render(
            <SchemaBuilder
                initialSchema={mockSchema}
                onSchemaChange={mockOnSchemaChange}
            />
        );

        // Should show the main array field
        expect(screen.getByDisplayValue("users")).toBeTruthy();

        // Should show the nested object fields within the array
        expect(screen.getByDisplayValue("id")).toBeTruthy();
        expect(screen.getByDisplayValue("name")).toBeTruthy();
    });

    it("handles simple field types correctly", () => {
        const mockSchema = {
            title: { type: "string" },
            count: { type: "number" },
            active: { type: "boolean" },
        };

        render(
            <SchemaBuilder
                initialSchema={mockSchema}
                onSchemaChange={mockOnSchemaChange}
            />
        );

        expect(screen.getByDisplayValue("title")).toBeTruthy();
        expect(screen.getByDisplayValue("count")).toBeTruthy();
        expect(screen.getByDisplayValue("active")).toBeTruthy();
    });

    it("allows deleting the first field", () => {
        const mockSchema = {
            title: { type: "string" },
            count: { type: "number" },
        };

        render(
            <SchemaBuilder
                initialSchema={mockSchema}
                onSchemaChange={mockOnSchemaChange}
            />
        );

        // Should show delete buttons for all fields (including the first one)
        // Look for buttons with destructive variant (red delete buttons)
        const deleteButtons = screen
            .getAllByRole("button")
            .filter((button) => button.className.includes("bg-destructive"));
        expect(deleteButtons.length).toBe(2); // One for each field

        // The first field should have a delete button
        expect(screen.getByDisplayValue("title")).toBeTruthy();
        expect(deleteButtons[0]).toBeTruthy();
    });
});
