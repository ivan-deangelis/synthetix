import { render, screen } from "@testing-library/react";
import ApiCard from "../ApiCard";

describe("ApiCard", () => {
    const mockApiProps = {
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
    };

    it("renders API name", () => {
        render(<ApiCard {...mockApiProps} />);
        expect(screen.getByText("Test API")).toBeTruthy();
    });

    it("renders API description", () => {
        render(<ApiCard {...mockApiProps} />);
        expect(screen.getByText("This is a test API description")).toBeTruthy();
    });

    it("displays public badge when API is public", () => {
        render(<ApiCard {...mockApiProps} visibility="public" />);
        expect(screen.getByText("Public")).toBeTruthy();
    });

    it("displays private badge when API is private", () => {
        render(<ApiCard {...mockApiProps} visibility="private" />);
        expect(screen.getByText("Private")).toBeTruthy();
    });

    it("displays status badge", () => {
        render(<ApiCard {...mockApiProps} status="active" />);
        expect(screen.getByText("active")).toBeTruthy();
    });
});
