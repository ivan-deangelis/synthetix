import { Schema, SchemaField } from "@/types/schema.types";
import { BackgroundProcessor } from "./background-processor";

export class SchemaBuilder {
    static async build(schema: Schema, apiSetId: string, userId: string) {
        const schemaConfig: Record<string, unknown> = {};

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

        const serializeField = async (
            fieldName: string,
            field: SchemaField
        ): Promise<unknown> => {
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

            const { settings, type } = field;
            const hasGenerationMethod =
                settings && (settings as any).generationMethod;
            const effectiveSettings = hasGenerationMethod
                ? (settings as any)
                : getDefaultSettingsForType(type);

            if (effectiveSettings.generationMethod === "static") {
                return {
                    type,
                    settings: {
                        generationMethod: "static",
                        staticValue: effectiveSettings.staticValue,
                    },
                };
            }

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

            // faker
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

        for (const [fieldName, fieldValue] of Object.entries(schema)) {
            schemaConfig[fieldName] = await serializeField(
                fieldName,
                fieldValue
            );
        }

        return { success: true, data: schemaConfig };
    }
}
