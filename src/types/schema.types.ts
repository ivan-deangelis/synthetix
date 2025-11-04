export type Schema = Record<string, SchemaField>;

export type FieldSettings = {
    generationMethod: "ai" | "faker" | "static";
    aiPrompt?: string;
    aiConstraints?: string;
    fakerMethod?: string;
    additionalOptions?: Record<string, unknown>;
    staticValue?: unknown;
};

// Allows array items to optionally specify a count for generation
export type ArrayItemsField = SchemaField & { count?: number };

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
