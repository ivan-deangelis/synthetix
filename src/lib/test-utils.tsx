import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { customRender as render };

// Custom test utilities
export const createMockUser = (overrides = {}) => ({
    id: "test-user-id",
    email: "test@example.com",
    username: "testuser",
    created_at: new Date().toISOString(),
    ...overrides,
});

export const createMockApi = (overrides = {}) => ({
    id: "test-api-id",
    name: "Test API",
    description: "A test API",
    endpoint: "/api/test",
    method: "GET",
    user_id: "test-user-id",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
});

// Mock data factories
export const mockApis = [
    createMockApi({ id: "1", name: "Users API" }),
    createMockApi({ id: "2", name: "Products API" }),
    createMockApi({ id: "3", name: "Orders API" }),
];

export const mockUser = createMockUser();

// Common test constants
export const TEST_IDS = {
    LOADING_SPINNER: "loading-spinner",
    ERROR_MESSAGE: "error-message",
    SUCCESS_MESSAGE: "success-message",
    SUBMIT_BUTTON: "submit-button",
    CANCEL_BUTTON: "cancel-button",
} as const;
