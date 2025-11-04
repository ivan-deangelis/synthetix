"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Cog, Trash2, Plus } from "lucide-react";
import { FieldSettingsModal } from "@/components/FieldSettingsModal";
import { Label } from "./ui/label";

/**
 * Supported field types for schema definition
 */
const fieldTypes = [
    "string",
    "number",
    "boolean",
    "object",
    "array",
    "date",
    "time",
    "datetime",
    "email",
];

/**
 * Props for the SchemaBuilder component
 */
interface SchemaBuilderProps {
    /** Initial schema to populate the builder (for edit mode) */
    initialSchema?: any;
    /** Callback when schema changes */
    onSchemaChange: (schema: any) => void;
}

/**
 * FieldEditor - Internal component for editing individual fields and nested structures.
 * Handles field creation, type selection, and nested object/array management.
 * Maximum nesting depth is 3 levels to prevent overly complex schemas.
 */
function FieldEditor({
    path,
    onChange,
    level = 1,
    initialFields = [],
}: {
    path: string[];
    onChange: (schema: any) => void;
    level?: number;
    initialFields?: any[];
}) {
    /**
     * Returns default generation settings based on field type.
     * Used when creating new fields or changing field types.
     */
    const getDefaultSettingsForType = (type: string) => {
        if (type === "number") {
            return {
                generationMethod: "faker",
                fakerMethod: "faker.number.int",
                additionalOptions: { min: 0, max: 9999 },
            };
        }
        if (type === "boolean") {
            return {
                generationMethod: "faker",
                fakerMethod: "faker.datatype.boolean",
                additionalOptions: null,
            };
        }
        if (type === "email") {
            return {
                generationMethod: "faker",
                fakerMethod: "faker.internet.email",
                additionalOptions: null,
            };
        }
        return {
            generationMethod: "faker",
            fakerMethod: "faker.person.firstName",
            additionalOptions: {},
        };
    };

    // Field state with unique IDs for React key management
    const [fields, setFields] = useState<
        {
            id: string;
            name: string;
            type: string;
            fields?: any[];
            itemsType?: string;
            itemCount?: number;
            settings?: any;
        }[]
    >(
        initialFields.length > 0
            ? initialFields
            : [
                  {
                      id: crypto.randomUUID(),
                      name: "",
                      type: "string",
                      fields: [],
                      settings: getDefaultSettingsForType("string"),
                  },
              ]
    );
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(
        null
    );

    /**
     * Adds a new empty field to the schema
     */
    const addField = () => {
        setFields([
            ...fields,
            {
                id: crypto.randomUUID(),
                name: "",
                type: "string",
                fields: [],
                settings: getDefaultSettingsForType("string"),
            },
        ]);
    };

    /**
     * Handles field type changes and updates default settings accordingly
     */
    const handleTypeChange = (index: number, newType: string) => {
        const updated = [...fields];
        updated[index].type = newType;
        if (newType === "object" || newType === "array") {
            updated[index].settings = updated[index].settings || {};
        } else {
            updated[index].settings = getDefaultSettingsForType(newType);
        }
        setFields(updated);
        onChange(buildSchema(updated));
    };

    /**
     * Generic field updater for any field property
     */
    const updateField = (index: number, key: string, value: any) => {
        const updated = [...fields];
        (updated[index] as any)[key] = value;
        setFields(updated);
        onChange(buildSchema(updated));
    };

    /**
     * Removes a field from the schema
     */
    const removeField = (index: number) => {
        const updated = fields.filter((_, i) => i !== index);
        setFields(updated);
        onChange(buildSchema(updated));
    };

    /**
     * Opens the settings modal for advanced field configuration
     */
    const openSettingsModal = (index: number) => {
        setSelectedFieldIndex(index);
        setSettingsModalOpen(true);
    };

    /**
     * Saves settings from the modal and updates the field
     */
    const handleSettingsSave = (settings: any) => {
        if (selectedFieldIndex !== null) {
            console.log(settings);
            const updated = [...fields];
            updated[selectedFieldIndex].settings = settings;
            setFields(updated);
            onChange(buildSchema(updated));
        }
    };

    /**
     * Recursively builds the schema object from field configurations.
     * Transforms the internal field representation into the schema format
     * used by the data generator.
     */
    const buildSchema = (fields: any[]) => {
        const schema: any = {};
        if (!Array.isArray(fields)) {
            console.warn("buildSchema received non-array:", fields);
            return schema;
        }

        fields.forEach((f) => {
            console.log(f);
            if (f.type === "object") {
                schema[f.name] = {
                    type: "object",
                    fields: buildSchema(
                        Array.isArray(f.fields) ? f.fields : []
                    ),
                };
            } else if (f.type === "array") {
                schema[f.name] = {
                    type: "array",
                    count: f.itemCount,
                    items:
                        f.itemsType === "object"
                            ? {
                                  type: "object",
                                  fields: buildSchema(
                                      Array.isArray(f.fields) ? f.fields : []
                                  ),
                              }
                            : {
                                  type: f.itemsType || "string",
                              },
                };
            } else {
                schema[f.name] = {
                    type: f.type,
                    settings: f.settings,
                };
            }
        });
        return schema;
    };

    // Only allow 'object' type if level < 3 (max 2 levels of nesting)
    const allowedFieldTypes =
        level < 3 ? fieldTypes : fieldTypes.filter((t) => t !== "object");

    return (
        <div className="space-y-5">
            {fields.map((field, index) => (
                <div
                    key={field.id}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <Input
                            placeholder="Field name"
                            value={field.name}
                            onChange={(e) =>
                                updateField(index, "name", e.target.value)
                            }
                            className="flex-1 min-w-[200px]"
                        />
                        <Select
                            value={field.type}
                            onValueChange={(value) =>
                                handleTypeChange(index, value)
                            }
                        >
                            <SelectTrigger className="w-40 sm:w-44 h-9 rounded-md">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {allowedFieldTypes.map((type) => (
                                    <SelectItem
                                        key={type}
                                        value={type}
                                        disabled={
                                            type === "object" && level >= 3
                                        }
                                    >
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-md"
                            onClick={() => openSettingsModal(index)}
                        >
                            <Cog className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-md"
                            onClick={() => removeField(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Nested object fields - recursive FieldEditor */}
                    {field.type === "object" && level < 3 && (
                        <div className="mt-3 ml-4 border-l-2 border-zinc-200 dark:border-zinc-800 pl-4">
                            <FieldEditor
                                path={[...path, field.name]}
                                initialFields={field.fields || []}
                                onChange={(nested) => {
                                    const updated = [...fields];
                                    // Convert the nested schema back to field objects properly
                                    updated[index].fields = Object.entries(
                                        nested
                                    ).map(([k, v]: [string, any]) => {
                                        if (typeof v === "string") {
                                            return {
                                                id: crypto.randomUUID(),
                                                name: k,
                                                type: v,
                                                fields: [],
                                                settings: {},
                                            };
                                        } else if (v.type === "object") {
                                            return {
                                                id: crypto.randomUUID(),
                                                name: k,
                                                type: "object",
                                                fields: Object.entries(
                                                    v.fields || {}
                                                ).map(
                                                    ([fieldName, fieldValue]: [
                                                        string,
                                                        any
                                                    ]) => ({
                                                        id: crypto.randomUUID(),
                                                        name: fieldName,
                                                        type:
                                                            typeof fieldValue ===
                                                            "string"
                                                                ? fieldValue
                                                                : fieldValue.type ||
                                                                  "string",
                                                        fields: [],
                                                        settings:
                                                            typeof fieldValue ===
                                                            "object"
                                                                ? fieldValue.settings ||
                                                                  {}
                                                                : {},
                                                    })
                                                ),
                                            };
                                        } else if (v.type === "array") {
                                            return {
                                                id: crypto.randomUUID(),
                                                name: k,
                                                type: "array",
                                                itemsType:
                                                    v.items?.type || "string",
                                                fields:
                                                    v.items?.type === "object"
                                                        ? Object.entries(
                                                              v.items.fields ||
                                                                  {}
                                                          ).map(
                                                              ([
                                                                  fieldName,
                                                                  fieldValue,
                                                              ]: [
                                                                  string,
                                                                  any
                                                              ]) => ({
                                                                  id: crypto.randomUUID(),
                                                                  name: fieldName,
                                                                  type:
                                                                      typeof fieldValue ===
                                                                      "string"
                                                                          ? fieldValue
                                                                          : fieldValue.type ||
                                                                            "string",
                                                                  fields: [],
                                                                  settings: {},
                                                              })
                                                          )
                                                        : [],
                                            };
                                        }
                                        // Primitive object form: { type: "string"|"number"|"boolean", settings?: {...} }
                                        return {
                                            id: crypto.randomUUID(),
                                            name: k,
                                            type: v.type || "string",
                                            fields: [],
                                            settings: v.settings || {},
                                        };
                                    });
                                    setFields(updated);
                                    onChange(buildSchema(updated));
                                }}
                                level={level + 1}
                            />
                        </div>
                    )}

                    {/* Array configuration - items type and count */}
                    {field.type === "array" && (
                        <div className="mt-3 ml-4 space-y-3">
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label>Items type</Label>
                                    <Select
                                        value={field.itemsType || "string"}
                                        onValueChange={(value) =>
                                            updateField(
                                                index,
                                                "itemsType",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-40 sm:w-44 h-9 rounded-md">
                                            <SelectValue placeholder="Items type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allowedFieldTypes.map((type) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                    disabled={
                                                        (type === "object" &&
                                                            level >= 3) ||
                                                        type === "array"
                                                    }
                                                >
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Items count</Label>
                                    <Select
                                        value={
                                            field.itemCount?.toString() || "5"
                                        }
                                        onValueChange={(value) =>
                                            updateField(
                                                index,
                                                "itemCount",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-40 sm:w-44 h-9 rounded-md">
                                            <SelectValue placeholder="Items count" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[5, 10, 15, 20].map((count) => (
                                                <SelectItem
                                                    key={count}
                                                    value={count.toString()}
                                                >
                                                    {count}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            {field.itemsType === "object" && level < 3 && (
                                <div className="mt-3 border-l-2 border-zinc-200 dark:border-zinc-800 pl-4">
                                    <FieldEditor
                                        path={[...path, field.name, "[]"]}
                                        initialFields={field.fields || []}
                                        onChange={(nested) => {
                                            const updated = [...fields];
                                            // Convert the nested schema back to field objects properly for arrays
                                            updated[index].fields =
                                                Object.entries(nested).map(
                                                    ([k, v]: [string, any]) => {
                                                        if (
                                                            typeof v ===
                                                            "string"
                                                        ) {
                                                            return {
                                                                id: crypto.randomUUID(),
                                                                name: k,
                                                                type: v,
                                                                fields: [],
                                                                settings: {},
                                                            };
                                                        } else if (
                                                            v.type === "object"
                                                        ) {
                                                            return {
                                                                id: crypto.randomUUID(),
                                                                name: k,
                                                                type: "object",
                                                                fields: Object.entries(
                                                                    v.fields ||
                                                                        {}
                                                                ).map(
                                                                    ([
                                                                        fieldName,
                                                                        fieldValue,
                                                                    ]: [
                                                                        string,
                                                                        any
                                                                    ]) => ({
                                                                        id: crypto.randomUUID(),
                                                                        name: fieldName,
                                                                        type:
                                                                            typeof fieldValue ===
                                                                            "string"
                                                                                ? fieldValue
                                                                                : fieldValue.type ||
                                                                                  "string",
                                                                        fields: [],
                                                                        settings:
                                                                            typeof fieldValue ===
                                                                            "object"
                                                                                ? fieldValue.settings ||
                                                                                  {}
                                                                                : {},
                                                                    })
                                                                ),
                                                            };
                                                        } else if (
                                                            v.type === "array"
                                                        ) {
                                                            return {
                                                                id: crypto.randomUUID(),
                                                                name: k,
                                                                type: "array",
                                                                count: v.count,
                                                                itemsType:
                                                                    v.items
                                                                        ?.type ||
                                                                    "string",
                                                                fields:
                                                                    v.items
                                                                        ?.type ===
                                                                    "object"
                                                                        ? Object.entries(
                                                                              v
                                                                                  .items
                                                                                  .fields ||
                                                                                  {}
                                                                          ).map(
                                                                              ([
                                                                                  fieldName,
                                                                                  fieldValue,
                                                                              ]: [
                                                                                  string,
                                                                                  any
                                                                              ]) => ({
                                                                                  id: crypto.randomUUID(),
                                                                                  name: fieldName,
                                                                                  type:
                                                                                      typeof fieldValue ===
                                                                                      "string"
                                                                                          ? fieldValue
                                                                                          : fieldValue.type ||
                                                                                            "string",
                                                                                  fields: [],
                                                                                  settings:
                                                                                      {},
                                                                              })
                                                                          )
                                                                        : [],
                                                            };
                                                        }
                                                        return {
                                                            id: crypto.randomUUID(),
                                                            name: k,
                                                            type:
                                                                v.type ||
                                                                "string",
                                                            fields: [],
                                                            settings:
                                                                v.settings ||
                                                                {},
                                                        };
                                                    }
                                                );
                                            setFields(updated);
                                            onChange(buildSchema(updated));
                                        }}
                                        level={level + 1}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
            <Button
                onClick={addField}
                variant="outline"
                size="sm"
                className="rounded-md"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Field
            </Button>

            {/* Settings Modal */}
            {selectedFieldIndex !== null && (
                <FieldSettingsModal
                    open={settingsModalOpen}
                    onOpenChange={setSettingsModalOpen}
                    fieldName={fields[selectedFieldIndex]?.name || ""}
                    fieldType={fields[selectedFieldIndex]?.type || "string"}
                    settings={fields[selectedFieldIndex]?.settings || {}}
                    onSave={handleSettingsSave}
                />
            )}
        </div>
    );
}

/**
 * SchemaBuilder - Main component for building and editing API schemas.
 */
export function SchemaBuilder({
    initialSchema,
    onSchemaChange,
}: SchemaBuilderProps) {
    /**
     * Converts a schema object back into field editor format.
     * This is needed to initialize the editor with existing schema data.
     */
    const convertSchemaToFields = (schema: any) => {
        if (!schema || typeof schema !== "object") return [];

        return Object.entries(schema).map(([name, value]: [string, any]) => {
            const field: any = {
                id: crypto.randomUUID(),
                name,
                type:
                    typeof value === "string" ? value : value.type || "string",
                fields: [],
                settings: value.settings || {
                    generationMethod: "faker",
                    fakerMethod: "faker.person.firstName",
                    additionalOptions: {},
                },
            };

            if (value.type === "object" && value.fields) {
                field.fields = convertSchemaToFields(value.fields);
            } else if (value.type === "array") {
                field.itemsType = value.items?.type || "string";
                if (value.items?.type === "object" && value.items.fields) {
                    field.fields = convertSchemaToFields(value.items.fields);
                }
            }

            return field;
        });
    };

    // Initialize fields from schema
    const [currentFields, setCurrentFields] = useState(() =>
        convertSchemaToFields(initialSchema)
    );

    // Update fields when initialSchema changes (e.g., switching between different APIs)
    useEffect(() => {
        setCurrentFields(convertSchemaToFields(initialSchema));
    }, [initialSchema]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">API Schema</h2>
                {/* <div className="relative cursor-pointer"> //TODO
                    <Button
                        variant="outline"
                        size="default"
                        className="rounded-md"
                    >
                        <Import className="h-4 w-4 mr-2" />
                        Import JSON
                    </Button>
                    <input
                        type="file"
                        id="schema-import"
                        className="opacity-0 absolute left-0 cursor-pointer top-0 w-full h-full"
                        onChange={handleFileChange}
                    />
                </div> */}
            </div>
            <FieldEditor
                path={[]}
                onChange={onSchemaChange}
                level={1}
                initialFields={currentFields}
            />
        </div>
    );
}
