import { faker } from "@faker-js/faker";

type FakerCategoryKey = {
    [K in keyof typeof faker]: typeof faker[K] extends object ? K : never;
}[keyof typeof faker];

type FakerMethodKey<K extends FakerCategoryKey> = Extract<
    keyof typeof faker[K],
    string
>;

export function generateFakerField<
    K extends FakerCategoryKey,
    M extends FakerMethodKey<K>
>(
    fakerMethod: `faker.${K}.${M}` | string,
    additionalOptions?: Record<string, unknown>
) {
    const parts = fakerMethod.split(".");
    const category = parts[1] as K | undefined;
    const method = parts[2] as M | undefined;

    if (parts[0] !== "faker" || !category || !method) {
        throw new Error(`Invalid faker method: ${fakerMethod}`);
    }

    const categoryValue = faker[category];
    if (typeof categoryValue !== "object" || categoryValue === null) {
        throw new Error(`Invalid faker category: ${String(category)}`);
    }

    const methodValue = (categoryValue as Record<string, unknown>)[method];
    if (typeof methodValue !== "function") {
        throw new Error(
            `Invalid faker method: ${String(category)}.${String(method)}`
        );
    }

    const fn = methodValue as (...args: unknown[]) => unknown;
    return additionalOptions ? fn(additionalOptions) : fn();
}