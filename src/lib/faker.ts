import { faker } from "@faker-js/faker";

/**
 * Type representing valid Faker.js category keys (e.g., 'person', 'internet', 'number')
 */
type FakerCategoryKey = {
    [K in keyof typeof faker]: typeof faker[K] extends object ? K : never;
}[keyof typeof faker];

/**
 * Type representing valid method names within a Faker category
 */
type FakerMethodKey<K extends FakerCategoryKey> = Extract<
    keyof typeof faker[K],
    string
>;

/**
 * Generates a value using Faker.js with type-safe method invocation.
 * Parses a dot-notation string (e.g., "faker.person.firstName") and calls
 * the corresponding Faker method with optional parameters.
 * 
 * This function provides a dynamic way to call Faker methods based on string
 * configuration, which is useful for schema-driven data generation where the
 * Faker method is stored as configuration.
 * 
 * @param fakerMethod - Dot-notation string representing the Faker method (e.g., "faker.person.firstName")
 * @param additionalOptions - Optional parameters to pass to the Faker method
 * @returns The generated value from Faker.js
 * @throws {Error} If the method string is invalid or the category/method doesn't exist
 */
export function generateFakerField<
    K extends FakerCategoryKey,
    M extends FakerMethodKey<K>
>(
    fakerMethod: `faker.${K}.${M}` | string,
    additionalOptions?: Record<string, unknown>
) {
    // Parse the dot-notation method string
    const parts = fakerMethod.split(".");
    const category = parts[1] as K | undefined;
    const method = parts[2] as M | undefined;

    // Validate method string format
    if (parts[0] !== "faker" || !category || !method) {
        throw new Error(`Invalid faker method: ${fakerMethod}`);
    }

    // Validate category exists
    const categoryValue = faker[category];
    if (typeof categoryValue !== "object" || categoryValue === null) {
        throw new Error(`Invalid faker category: ${String(category)}`);
    }

    // Validate method exists in category
    const methodValue = (categoryValue as Record<string, unknown>)[method];
    if (typeof methodValue !== "function") {
        throw new Error(
            `Invalid faker method: ${String(category)}.${String(method)}`
        );
    }

    // Call the Faker method with or without options
    const fn = methodValue as (...args: unknown[]) => unknown;
    return additionalOptions ? fn(additionalOptions) : fn();
}