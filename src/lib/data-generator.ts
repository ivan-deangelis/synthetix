import { Schema, SchemaField } from "@/types/schema.types";
import { generateFakerField } from "./faker";

export interface GeneratedData {
    [fieldName: string]: unknown;
}

export class DataGenerator {
    /**
     * Generate data on-the-fly based on schema configuration
     * @param schema - The schema configuration
     * @param aiData - Pre-generated AI data (optional)
     * @returns Generated data object
     */
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

        const generateFromField = (
            field: SchemaField,
            fieldName: string
        ): unknown => {
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

            const { settings } = field;
            const hasGenerationMethod =
                settings && (settings as any).generationMethod;
            const effectiveSettings = hasGenerationMethod
                ? (settings as any)
                : getDefaultSettingsForType(field.type);

            if (effectiveSettings.generationMethod === "static") {
                return effectiveSettings.staticValue ?? null;
            }

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

        for (const [fieldName, fieldValue] of Object.entries(schema)) {
            generatedData[fieldName] = generateFromField(fieldValue, fieldName);
        }

        return generatedData;
    }

    /**
     * Generate multiple records of data
     * @param schema - The schema configuration
     * @param count - Number of records to generate
     * @param aiData - Pre-generated AI data (optional)
     * @returns Array of generated data objects
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
