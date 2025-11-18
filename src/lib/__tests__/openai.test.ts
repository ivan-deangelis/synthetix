import { generateAIField } from "../openai";

// Mock the environment
const originalEnv = process.env;

describe("generateAIField with faker fallback", () => {
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("should use faker fallback when OPENAI_API_KEY is not set", async () => {
        // Remove OpenAI API key
        delete process.env.OPENAI_API_KEY;

        const result = await generateAIField(
            "email",
            "Generate random email addresses",
            ""
        );

        expect(result).not.toBeNull();
        expect(result?.result).toHaveLength(20);
        expect(result?.result[0]).toBeTruthy();
        
        // Check if emails are generated (basic format check)
        const hasAtSymbol = result?.result.some(email => email.includes("@"));
        expect(hasAtSymbol).toBe(true);
    });

    it("should detect field name and use appropriate faker method", async () => {
        delete process.env.OPENAI_API_KEY;

        const testCases = [
            { field: "username", expectedPattern: /\w+/ },
            { field: "name", expectedPattern: /\w+/ },
            { field: "age", expectedPattern: /\d+/ },
        ];

        for (const testCase of testCases) {
            const result = await generateAIField(
                testCase.field,
                `Generate ${testCase.field}`,
                ""
            );

            expect(result).not.toBeNull();
            expect(result?.result).toHaveLength(20);
            expect(result?.result[0]).toMatch(testCase.expectedPattern);
        }
    });

    it("should analyze prompt for hints", async () => {
        delete process.env.OPENAI_API_KEY;

        const result = await generateAIField(
            "contact",
            "Generate email addresses for users",
            ""
        );

        expect(result).not.toBeNull();
        expect(result?.result).toHaveLength(20);
        
        // Should detect "email" in prompt and generate email-like strings
        const hasAtSymbol = result?.result.some(val => 
            typeof val === "string" && val.includes("@")
        );
        expect(hasAtSymbol).toBe(true);
    });

    it("should generate consistent number of items", async () => {
        delete process.env.OPENAI_API_KEY;

        const result = await generateAIField(
            "randomField",
            "Generate some data",
            ""
        );

        expect(result).not.toBeNull();
        expect(result?.result).toHaveLength(20); // Default count
    });
});
