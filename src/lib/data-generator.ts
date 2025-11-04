import { Schema, SchemaField } from "@/types/schema.types";
import { generateFakerField } from "./faker";

/**
 * Interface representing the generated data structure
 * The keys are field names from the schema, and values are the generated data
 */
export interface GeneratedData {
    [fieldName: string]: unknown;
}

/**
 * DataGenerator is responsible for generating mock data based on schema definitions.
 * It supports multiple generation methods:
 * - Faker.js: Realistic mock data using Faker library
 * - Static: User-defined static values
 * - AI: AI-generated data using OpenAI (requires pre-generated data)
 * 
 * @example
 * ```typescript
 * const schema = {
 *   name: { type: 'string', settings: { generationMethod: 'faker', fakerMethod: 'faker.person.firstName' } },
 *   age: { type: 'number', settings: { generationMethod: 'faker', fakerMethod: 'faker.number.int', additionalOptions: { min: 18, max: 65 } } }
 * };
 * 
 * const data = DataGenerator.generateData(schema);
 * // Returns: { name: "John", age: 32 }
 * ```
 */
export class DataGenerator {
    /**
     * Generate a single data record based on schema configuration.
     * Recursively processes nested objects and arrays.
     * 
     * @param schema - The schema configuration defining field types and generation methods
     * @param aiData - Optional pre-generated AI data for fields using AI generation method.
     *                 Can be an array of field results or a single field result.
     * @param count - Number of items to generate for arrays (default: 1)
     * @returns Generated data object matching the schema structure
     **/
    static generateData(
        schema: Schema,
        aiData?:
            | Array<{
                  field_name: string;
                  result: string | number | boolean | (string | number | boolean)[];
              }>
            | {
                  field_name: string;
                  result: string | number | boolean | (string | number | boolean)[];
              },
        count: number = 1
    ): GeneratedData {
        const generatedData: GeneratedData = {};

        /**
         * Returns default Faker.js settings for primitive types when no settings are specified.
         * This ensures all fields have a valid generation method.
         * 
         * @param type - The primitive type ('string', 'number', or 'boolean')
         * @returns Default settings object with faker method and options
         */
        const getDefaultSettingsForType = (
            type: "string" | "number" | "boolean"
        ) => {
            if (type === "string") {
                return {
                    generationMethod: "faker" as const,
                    fakerMethod: "faker.person.firstName",
                    additionalOptions: null as Record<string, unknown> | null,
                };
            }
            if (type === "number") {
                return {
                    generationMethod: "faker" as const,
                    fakerMethod: "faker.number.int",
                    additionalOptions: { min: 0, max: 9999 } as Record<
                        string,
                        unknown
                    >,
                };
            }
            return {
                generationMethod: "faker" as const,
                fakerMethod: "faker.datatype.boolean",
                additionalOptions: null as Record<string, unknown> | null,
            };
        };

        /**
         * Recursively generates data for a single field based on its type and settings.
         * Handles arrays, objects, and primitive types with different generation methods.
         * 
         * @param field - The field definition from the schema
         * @param fieldName - The name/path of the field (used for AI data lookup)
         * @returns Generated value for the field
         */
        const generateFromField = (
            field: SchemaField,
            fieldName: string
        ): unknown => {
            // Handle array type: generate multiple items based on count
            if (field.type === "array") {
                const items = [];

                for (let i = 0; i < field.count; i++) {
                    const item = generateFromField(
                        field.items,
                        `${fieldName}[]`
                    );
                    items.push(item);
                }
                return items;
            }
            
            // Handle object type: recursively generate nested fields or use node-level settings
            if (field.type === "object") {
                // If object has its own settings (node-level), honor them; otherwise generate children
                const nodeSettings: any = (field as any).settings;
                if (nodeSettings && nodeSettings.generationMethod === "static") {
                    return nodeSettings.staticValue ?? null;
                }
                if (nodeSettings && nodeSettings.generationMethod === "faker") {
                    const fakerMethod = nodeSettings.fakerMethod;
                    const additionalOptions = nodeSettings.additionalOptions;
                    if (fakerMethod) {
                        try {
                            return generateFakerField(
                                fakerMethod,
                                additionalOptions
                            );
                        } catch (error) {
                            console.error(
                                `Error generating faker data for field ${fieldName}:`,
                                error
                            );
                            return null;
                        }
                    }
                }
                const obj: Record<string, unknown> = {};
                for (const [nestedName, nestedField] of Object.entries(
                    field.fields
                )) {
                    obj[nestedName] = generateFromField(
                        nestedField,
                        `${fieldName}.${nestedName}`
                    );
                }
                return obj;
            }

            // Handle primitive types (string, number, boolean)
            const { settings } = field;
            const hasGenerationMethod =
                settings && (settings as any).generationMethod;
            const effectiveSettings = hasGenerationMethod
                ? (settings as any)
                : getDefaultSettingsForType(field.type);

            // Static generation: return the predefined value
            if (effectiveSettings.generationMethod === "static") {
                return effectiveSettings.staticValue ?? null;
            }

            // AI generation: lookup pre-generated AI data by field name
            if (effectiveSettings.generationMethod === "ai") {
                if (aiData) {
                    if (Array.isArray(aiData)) {
                        const aiField = aiData.find(
                            (item) => item.field_name === fieldName
                        );
                        if (aiField) {
                            const res = aiField.result as any;
                            if (Array.isArray(res)) {
                                return res[Math.floor(Math.random() * res.length)];
                            }
                            return res;
                        }
                    } else if (aiData.field_name === fieldName) {
                        const res = (aiData as any).result;
                        if (Array.isArray(res)) {
                            return res[Math.floor(Math.random() * res.length)];
                        }
                        return res;
                    }
                }
                return null;
            }

            // Faker generation: use Faker.js to generate realistic data
            const fallback = getDefaultSettingsForType(field.type);
            const fakerMethod =
                effectiveSettings.fakerMethod || fallback.fakerMethod;
            const additionalOptions =
                effectiveSettings.additionalOptions ??
                fallback.additionalOptions;
            if (fakerMethod) {
                try {
                    return generateFakerField(fakerMethod, additionalOptions);
                } catch (error) {
                    console.error(
                        `Error generating faker data for field ${fieldName}:`,
                        error
                    );
                    return null;
                }
            }
            return null;
        };

        // Process all top-level fields in the schema
        for (const [fieldName, fieldValue] of Object.entries(schema)) {
            generatedData[fieldName] = generateFromField(fieldValue, fieldName);
        }

        return generatedData;
    }

    /**
     * Generate multiple records of data based on a schema.
     * This is a convenience method that calls generateData multiple times.
     * 
     * @param schema - The schema configuration defining field types and generation methods
     * @param aiDataOrCount - Either the number of records to generate, or pre-generated AI data.
     *                        If number, it's used as the count. If object/array, it's treated as AI data.
     * @param maybeCount - Number of records to generate (used when aiDataOrCount is AI data, default: 1)
     * @returns Single generated object if count=1, otherwise array of generated objects
     */
    static generateMultipleRecords(
        schema: Schema,
        aiDataOrCount?:
            | number
            | Array<{
                  field_name: string;
                  result: string | number | boolean | (string | number | boolean)[];
              }>
            | {
                  field_name: string;
                  result: string | number | boolean | (string | number | boolean)[];
              },
        maybeCount: number = 1
    ): GeneratedData | GeneratedData[] {
        const count = typeof aiDataOrCount === "number" ? aiDataOrCount : maybeCount;
        const aiData = typeof aiDataOrCount === "number" ? undefined : aiDataOrCount as any;

        const records: GeneratedData[] = [];

        for (let i = 0; i < count; i++) {
            records.push(this.generateData(schema, aiData));
        }

        return count === 1 ? records[0] : records;
    }
}
