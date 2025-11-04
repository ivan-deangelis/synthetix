// Mock the faker library
let callCount = 0;
jest.mock("@faker-js/faker", () => ({
    faker: {
        person: {
            firstName: jest.fn(() => {
                callCount++;
                return callCount % 2 === 0 ? "John" : "Jane";
            }),
            lastName: jest.fn(() => {
                callCount++;
                return callCount % 2 === 0 ? "Doe" : "Smith";
            }),
            fullName: jest.fn(() => "John Doe"),
        },
        number: {
            int: jest.fn((options) => {
                callCount++;
                return (options?.min || 0) + (callCount % 10);
            }),
            float: jest.fn(() => 123.45),
        },
        internet: {
            userName: jest.fn(() => "johndoe"),
            email: jest.fn(() => "john@example.com"),
        },
        lorem: {
            word: jest.fn(() => "lorem"),
            sentence: jest.fn(() => "Lorem ipsum dolor sit amet."),
        },
        company: {
            name: jest.fn(() => "Acme Corp"),
        },
        location: {
            streetAddress: jest.fn(() => "123 Main St"),
            city: jest.fn(() => "New York"),
        },
        phone: {
            number: jest.fn(() => "+1234567890"),
        },
        string: {
            uuid: jest.fn(() => "123e4567-e89b-12d3-a456-426614174000"),
        },
        commerce: {
            price: jest.fn(() => 99.99),
        },
        datatype: {
            boolean: jest.fn(() => true),
            number: jest.fn(() => 42),
        },
        date: {
            past: jest.fn(() => new Date("2023-01-01")),
        },
    },
}));

import { DataGenerator, GeneratedData } from "../data-generator";
import { Schema } from "@/types/schema.types";

describe("DataGenerator", () => {
    const mockSchema: Schema = {
        firstName: {
            type: "string",
            settings: {
                generationMethod: "faker",
                fakerMethod: "faker.person.firstName",
                additionalOptions: {},
            },
        },
        lastName: {
            type: "string",
            settings: {
                generationMethod: "faker",
                fakerMethod: "faker.person.lastName",
                additionalOptions: {},
            },
        },
        age: {
            type: "number",
            settings: {
                generationMethod: "faker",
                fakerMethod: "faker.number.int",
                additionalOptions: { min: 18, max: 65 },
            },
        },
    };

    describe("generateData", () => {
        it("should generate data based on schema configuration", () => {
            const result = DataGenerator.generateData(mockSchema);

            expect(result).toHaveProperty("firstName");
            expect(result).toHaveProperty("lastName");
            expect(result).toHaveProperty("age");

            expect(typeof result.firstName).toBe("string");
            expect(typeof result.lastName).toBe("string");
            expect(typeof result.age).toBe("number");
        });

        it("should handle AI-generated data", () => {
            const schemaWithAI: Schema = {
                ...mockSchema,
                bio: {
                    type: "string",
                    settings: {
                        generationMethod: "ai",
                        aiPrompt: "Generate a short bio",
                        aiConstraints: "Keep it under 100 characters",
                    },
                },
            };

            const aiData = [
                {
                    field_name: "bio",
                    result: "A passionate developer who loves coding.",
                },
            ];

            const result = DataGenerator.generateData(schemaWithAI, aiData);

            expect(result.bio).toBe("A passionate developer who loves coding.");
        });

        it("should handle missing faker methods gracefully", () => {
            const invalidSchema: Schema = {
                invalid: {
                    type: "string",
                    settings: {
                        generationMethod: "faker",
                        fakerMethod: "faker.invalid.method",
                        additionalOptions: {},
                    },
                },
            };

            const result = DataGenerator.generateData(invalidSchema);

            expect(result.invalid).toBeNull();
        });
    });

    describe("generateMultipleRecords", () => {
        it("should generate multiple records", () => {
            const count = 3;
            const results = DataGenerator.generateMultipleRecords(
                mockSchema,
                count,
            );

            expect(results).toHaveLength(count);
            (results as GeneratedData[]).forEach((record) => {
                expect(record).toHaveProperty("firstName");
                expect(record).toHaveProperty("lastName");
                expect(record).toHaveProperty("age");
            });
        });

        it("should generate different data for each record", () => {
            const count = 2;
            const results = DataGenerator.generateMultipleRecords(
                mockSchema,
                count,
            ) as GeneratedData[];

            // Each record should have different values (though there's a small chance they could be the same)
            const firstNames = results.map((r) => r.firstName);
            const lastNames = results.map((r) => r.lastName);
            const ages = results.map((r) => r.age);

            // At least one of the fields should be different between records
            const hasDifferentData = new Set(firstNames).size > 1 ||
                new Set(lastNames).size > 1 ||
                new Set(ages).size > 1;

            expect(hasDifferentData).toBe(true);
        });
    });
});
