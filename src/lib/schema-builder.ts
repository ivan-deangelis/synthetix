import { Schema, SchemaField } from "@/types/schema.types";
import { BackgroundProcessor } from "./background-processor";

/**
 * SchemaBuilder is responsible for processing and serializing schema definitions
 * into a standardized format for storage and data generation. It handles:
 * - Schema validation and normalization
 * - AI data generation job scheduling
 * - Nested object and array serialization
 */
export class SchemaBuilder {
    /**
     * Builds and serializes a schema configuration for storage and data generation.
     * This method:
     * 1. Validates the schema structure
     * 2. Applies default settings for fields without explicit settings
     * 3. Schedules background AI generation jobs for AI-powered fields
     * 4. Serializes the schema into a standardized format
     * 
     * @param schema - The raw schema definition from the client
     * @param apiSetId - The unique identifier for the API set
     * @param userId - The user ID who owns the API set
     * @returns Promise resolving to an object with success status and serialized schema data
     * 
     * @throws {Error} If AI prompt is missing for AI-generation fields
     * @throws {Error} If Faker method is missing for faker-generation fields
     */
    static async build(schema: Schema, apiSetId: string, userId: string) {
        const schemaConfig: Record<string, unknown> = {};

        /**
         * Returns default Faker.js generation settings for primitive types.
         * Used as fallback when no explicit generation settings are provided.
         * 
         * @param type - The primitive field type
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
         * Recursively serializes a field definition into a standardized format.
         * Handles arrays, objects, and primitive types with their respective settings.
         * For AI-powered fields at the top level, schedules background generation jobs.
         * 
         * @param fieldName - The full path name of the field (e.g., "user.address.city")
         * @param field - The field definition to serialize
         * @returns Promise resolving to the serialized field configuration
         */
        const serializeField = async (
            fieldName: string,
            field: SchemaField
        ): Promise<unknown> => {
            // Handle array type: serialize items and preserve count
            if (field.type === "array") {
                const serializedItems = await serializeField(
                    `${fieldName}[]`,
                    field.items
                );
                const node: any = {
                    type: "array",
                    items: serializedItems,
                    count: field.count || 5,
                };

                // Apply node-level settings if provided (generation strategy for the whole array)
                if (
                    field.settings &&
                    (field.settings as any).generationMethod
                ) {
                    node.settings = field.settings;
                }
                return node;
            }
            
            // Handle object type: recursively serialize nested fields
            if (field.type === "object") {
                const serializedFields: Record<string, unknown> = {};
                for (const [nestedName, nestedField] of Object.entries(
                    field.fields
                )) {
                    serializedFields[nestedName] = await serializeField(
                        `${fieldName}.${nestedName}`,
                        nestedField
                    );
                }
                const node: any = { type: "object", fields: serializedFields };
                // Apply node-level settings if provided (generation strategy for the whole object)
                if (
                    field.settings &&
                    (field.settings as any).generationMethod
                ) {
                    node.settings = field.settings;
                }
                return node;
            }

            // Handle primitive types (string, number, boolean)
            const { settings, type } = field;
            const hasGenerationMethod =
                settings && (settings as any).generationMethod;
            const effectiveSettings = hasGenerationMethod
                ? (settings as any)
                : getDefaultSettingsForType(type);

            // Static value: store the predefined value
            if (effectiveSettings.generationMethod === "static") {
                return {
                    type,
                    settings: {
                        generationMethod: "static",
                        staticValue: effectiveSettings.staticValue,
                    },
                };
            }

            // AI generation: schedule background job for data generation
            if (effectiveSettings.generationMethod === "ai") {
                const aiPrompt = effectiveSettings.aiPrompt;
                const aiConstraints = effectiveSettings.aiConstraints;

                if (!aiPrompt) {
                    throw new Error(
                        `AI prompt and constraints are required for field: ${fieldName}`
                    );
                }

                // Only trigger background AI generation for top-level fields for now
                if (!fieldName.includes(".")) {
                    await BackgroundProcessor.startAIGeneration(
                        apiSetId,
                        userId,
                        fieldName,
                        aiPrompt,
                        aiConstraints
                    );
                }

                return {
                    type,
                    settings: {
                        generationMethod: "ai",
                        aiPrompt,
                        aiConstraints,
                    },
                };
            }

            // Faker generation: configure Faker.js method and options
            const fallback = getDefaultSettingsForType(type);
            const fakerMethod =
                effectiveSettings.fakerMethod || fallback.fakerMethod;
            const additionalOptions =
                effectiveSettings.additionalOptions ??
                fallback.additionalOptions;

            if (!fakerMethod) {
                throw new Error(
                    `Faker method is required for field: ${fieldName}`
                );
            }

            return {
                type,
                settings: {
                    generationMethod: "faker",
                    fakerMethod,
                    additionalOptions,
                },
            };
        };

        // Process all top-level fields in the schema
        for (const [fieldName, fieldValue] of Object.entries(schema)) {
            schemaConfig[fieldName] = await serializeField(
                fieldName,
                fieldValue
            );
        }

        return { success: true, data: schemaConfig };
    }
}
