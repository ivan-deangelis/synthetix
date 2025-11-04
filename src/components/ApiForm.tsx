"use client";

import { useState, useEffect, useReducer } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Eye } from "lucide-react";
import { ApiPreviewModal } from "@/components/ApiPreviewModal";
import { SchemaBuilder } from "@/components/SchemaBuilder";
import { HeadersBuilder } from "@/components/HeadersBuilder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Header = {
    key: string;
    value: string;
};

// Headers reducer types
type HeadersAction =
    | { type: "SET_HEADERS"; payload: Header[] }
    | { type: "ADD_HEADER"; payload: Header }
    | {
          type: "UPDATE_HEADER";
          payload: { index: number; field: "key" | "value"; value: string };
      }
    | { type: "REMOVE_HEADER"; payload: number }
    | { type: "CLEAR_HEADERS" };

type HeadersState = {
    headers: Header[];
    validHeaders: Header[];
};

interface ApiFormProps {
    initialData?: {
        name: string;
        description: string;
        visibility: "public" | "private";
        schema: any;
        headers?: Header[];
    };
    onSubmit: (data: {
        name: string;
        description: string;
        visibility: "public" | "private";
        schema: any;
        headers: Header[];
    }) => Promise<void>;
    submitButtonText?: string;
    error?: { [key: string]: string } | null;
    onErrorChange?: (error: { [key: string]: string } | null) => void;
}

// Headers reducer
const headersReducer = (
    state: HeadersState,
    action: HeadersAction
): HeadersState => {
    switch (action.type) {
        case "SET_HEADERS":
            const validHeaders = action.payload.filter(
                (header) =>
                    header.key.trim() !== "" && header.value.trim() !== ""
            );
            return {
                headers: action.payload,
                validHeaders,
            };

        case "ADD_HEADER":
            const newHeaders = [...state.headers, action.payload];
            const newValidHeaders = newHeaders.filter(
                (header) =>
                    header.key.trim() !== "" && header.value.trim() !== ""
            );
            return {
                headers: newHeaders,
                validHeaders: newValidHeaders,
            };

        case "UPDATE_HEADER":
            const updatedHeaders = [...state.headers];
            updatedHeaders[action.payload.index] = {
                ...updatedHeaders[action.payload.index],
                [action.payload.field]: action.payload.value,
            };
            const updatedValidHeaders = updatedHeaders.filter(
                (header) =>
                    header.key.trim() !== "" && header.value.trim() !== ""
            );
            return {
                headers: updatedHeaders,
                validHeaders: updatedValidHeaders,
            };

        case "REMOVE_HEADER":
            const filteredHeaders = state.headers.filter(
                (_, index) => index !== action.payload
            );
            const filteredValidHeaders = filteredHeaders.filter(
                (header) =>
                    header.key.trim() !== "" && header.value.trim() !== ""
            );
            return {
                headers: filteredHeaders,
                validHeaders: filteredValidHeaders,
            };

        case "CLEAR_HEADERS":
            return {
                headers: [],
                validHeaders: [],
            };

        default:
            return state;
    }
};

export function ApiForm({
    initialData,
    onSubmit,
    submitButtonText = "Create API",
    error,
    onErrorChange,
}: ApiFormProps) {
    const [apiName, setApiName] = useState(initialData?.name || "");
    const [schema, setSchema] = useState<any>(initialData?.schema || {});

    const [headersState, dispatch] = useReducer(headersReducer, {
        headers: initialData?.headers || [],
        validHeaders: (initialData?.headers || []).filter(
            (header) => header.key.trim() !== "" && header.value.trim() !== ""
        ),
    });
    const [apiDescription, setApiDescription] = useState(
        initialData?.description || ""
    );
    const [isPublic, setIsPublic] = useState(
        initialData?.visibility === "public" || false
    );
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit({
                name: apiName,
                description: apiDescription,
                visibility: isPublic ? "public" : "private",
                schema: schema,
                headers: headersState.validHeaders,
            });
        } catch (err) {
            console.error("Form submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePreview = () => {
        if (apiName && Object.keys(schema).length > 0) {
            setPreviewModalOpen(true);
        }
    };

    const clearError = (field: string) => {
        if (onErrorChange && error) {
            const newError = { ...error };
            delete newError[field];
            onErrorChange(Object.keys(newError).length > 0 ? newError : null);
        }
    };

    return (
        <main className="flex flex-col gap-6 mx-auto w-full">
            <h2 className="text-lg font-semibold">API Settings</h2>

            <div className="flex flex-col gap-2">
                <Label htmlFor="api-name">API Name</Label>
                <Input
                    id="api-name"
                    placeholder="Enter your API name"
                    value={apiName}
                    onChange={(e) => {
                        setApiName(e.target.value);
                        clearError("name");
                    }}
                    className="h-11 rounded-md"
                />
                {error?.name && (
                    <p className="text-sm text-red-500">
                        {error["name"] || "API name is required"}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="api-description">API Description</Label>
                <Textarea
                    id="api-description"
                    placeholder="Enter your API description"
                    value={apiDescription}
                    onChange={(e) => {
                        setApiDescription(e.target.value);
                        clearError("description");
                    }}
                    className="h-20 rounded-md dark:bg-input/30"
                />
                {error?.description && (
                    <p className="text-sm text-red-500">
                        {error["description"] || "API description is required"}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="visibility">Visibility</Label>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="visibility"
                        checked={isPublic}
                        onCheckedChange={(checked) =>
                            setIsPublic(checked as boolean)
                        }
                    />
                    <Label htmlFor="visibility">Public</Label>
                </div>
            </div>

            <Separator className="my-2 md:my-4 bg-zinc-200 dark:bg-zinc-800" />

            <Tabs defaultValue="schema" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="schema" className="cursor-pointer">
                        Schema
                    </TabsTrigger>
                    <TabsTrigger value="headers" className="cursor-pointer">
                        Headers
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="schema" className="mt-6">
                    <SchemaBuilder
                        initialSchema={schema}
                        onSchemaChange={setSchema}
                    />
                </TabsContent>
                <TabsContent value="headers" className="mt-6">
                    <HeadersBuilder
                        initialHeaders={headersState.headers}
                        onHeadersChange={(headers) =>
                            dispatch({ type: "SET_HEADERS", payload: headers })
                        }
                        onAddHeader={() =>
                            dispatch({
                                type: "ADD_HEADER",
                                payload: { key: "", value: "" },
                            })
                        }
                        onUpdateHeader={(index, field, value) =>
                            dispatch({
                                type: "UPDATE_HEADER",
                                payload: { index, field, value },
                            })
                        }
                        onRemoveHeader={(index) =>
                            dispatch({ type: "REMOVE_HEADER", payload: index })
                        }
                    />
                </TabsContent>
            </Tabs>

            <div className="flex items-center mt-4 gap-4 ml-auto">
                <Button
                    variant="outline"
                    onClick={handlePreview}
                    disabled={
                        !apiName ||
                        Object.keys(schema).length === 0 ||
                        previewModalOpen
                    }
                >
                    <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={
                        !apiName ||
                        Object.keys(schema).length === 0 ||
                        isSubmitting
                    }
                >
                    {isSubmitting ? "Saving..." : submitButtonText}
                </Button>
            </div>

            {/* Preview Modal */}
            <ApiPreviewModal
                open={previewModalOpen}
                onOpenChange={setPreviewModalOpen}
                apiSet={{
                    id: "preview",
                    name: apiName || "Untitled API",
                    description: apiDescription,
                    visibility: isPublic ? "public" : "private",
                    status: "draft",
                    schema: schema,
                    headers: headersState.validHeaders,
                }}
            />
        </main>
    );
}
