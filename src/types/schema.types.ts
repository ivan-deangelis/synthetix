/**
 * Schema type definitions for API data structure configuration.
 * 
 * These types define how API schemas are structured and how data
 * should be generated for each field. They support nested objects,
 * arrays, and multiple generation methods (AI, Faker, static).
 */

/**
 * Root schema type - a record of field names to field definitions
 */
export type Schema = Record<string, SchemaField>;

/**
 * Settings for field data generation.
 * Supports three generation methods:
 * - 'ai': Uses OpenAI to generate data based on prompts
 * - 'faker': Uses Faker.js library with specified method
 * - 'static': Returns a predefined static value
 */
export type FieldSettings = {
    /** The method used to generate data for this field */
    generationMethod: "ai" | "faker" | "static";
    
    /** AI prompt describing what to generate (required for AI generation) */
    aiPrompt?: string;
    
    /** Additional constraints for AI generation (optional for AI generation) */
    aiConstraints?: string;
    
    /** Faker.js method in dot notation (required for faker generation) */
    fakerMethod?: string;
    
    /** Additional options to pass to Faker method (optional for faker generation) */
    additionalOptions?: Record<string, unknown>;
    
    /** Static value to return (required for static generation) */
    staticValue?: unknown;
};

/**
 * Extended array items field that can optionally specify generation count.
 * This allows fine-grained control over array generation.
 */
export type ArrayItemsField = SchemaField & { count?: number };

/**
 * Union type representing all possible field types in a schema.
 * 
 * Can be:
 * - Primitive fields (string, number, boolean)
 * - Array fields with typed items and count
 * - Object fields with nested field definitions
 */
export type SchemaField =
    | {
          type: "string" | "number" | "boolean";
          settings: FieldSettings;
      }
    | {
          type: "array";
          count: number;
          items: ArrayItemsField;
          settings?: FieldSettings;
      }
    | {
          type: "object";
          fields: Record<string, SchemaField>;
          settings?: FieldSettings;
      };
