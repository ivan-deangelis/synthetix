"use server";

import { createServerSupabaseClient } from "@/supabase/server";

import { z } from "zod";
import { Database } from "@/types/database.types";
import { SchemaBuilder } from "@/lib/schema-builder";
import { Schema } from "@/types/schema.types";
import { auth } from "@clerk/nextjs/server";

export type ApiSet = Pick<
    Database["public"]["Tables"]["api_sets"]["Row"],
    | "id"
    | "name"
    | "description"
    | "visibility"
    | "status"
    | "schema"
    | "headers"
>;

const createApiSetSchema = z.object({
    name: z.string().min(1).max(150).trim(),
    description: z.string().max(255).trim().optional(),
    visibility: z.enum(["public", "private"]),
    status: z.enum(["active", "inactive", "draft", "archived"]),
    schema: z.record(z.string(), z.any()),
    headers: z
        .array(
            z.object({
                key: z.string(),
                value: z.string(),
            }),
        )
        .optional(),
});

const updateApiSetSchema = z.object({
    id: z.string(),
    name: z.string().min(1).max(150).trim(),
    description: z.string().max(255).trim().optional(),
    visibility: z.enum(["public", "private"]),
    status: z.enum(["active", "inactive", "draft", "archived"]),
    schema: z.record(z.string(), z.any()),
    headers: z
        .array(
            z.object({
                key: z.string(),
                value: z.string(),
            }),
        )
        .optional(),
});

// Recursively check if any field in the schema uses AI generation
function schemaHasAI(schema: Schema): boolean {
    const stack: Array<{ name: string; node: any }> = Object.entries(schema).map(
        ([name, node]) => ({ name, node }),
    );

    while (stack.length) {
        const { node } = stack.pop()!;

        // Node-level settings (for objects/arrays)
        if (node && node.settings && (node.settings as any).generationMethod === "ai") {
            return true;
        }

        if (node?.type === "object") {
            for (const [childName, childNode] of Object.entries(node.fields)) {
                stack.push({ name: childName, node: childNode });
            }
            continue;
        }

        if (node?.type === "array") {
            stack.push({ name: `${node.items?.type || "items"}`, node: node.items });
            continue;
        }

        // Primitive field-level settings
        if (node?.settings && (node.settings as any).generationMethod === "ai") {
            return true;
        }
    }

    return false;
}

export async function createApiSet(apiSet: Omit<ApiSet, "id">) {
    const validatedApiSet = createApiSetSchema.safeParse(apiSet);

    if (!validatedApiSet.success) {
        return {
            error: validatedApiSet.error.message,
            success: false,
        };
    }

    const supabase = await createServerSupabaseClient();

    const { userId } = await auth();

    if (!userId) {
        return {
            error: "User not found",
            success: false,
        };
    }

    const { data, error } = await supabase
        .from("api_sets")
        .insert({
            name: apiSet.name,
            description: apiSet.description,
            visibility: apiSet.visibility,
            status: "processing",
            schema: apiSet.schema,
            headers: apiSet.headers,
            user_id: userId,
        })
        .select()
        .single();

    if (error || !data) {
        return {
            error: error?.message || "Failed to create API Set",
            success: false,
        };
    }

    if (apiSet.schema) {
        const { success, data: builtData } = await SchemaBuilder.build(
            apiSet.schema as Schema,
            data.id,
            userId,
        );

        // Persist static values snapshot to api_sets_data
        try {
            const staticSnapshot: Record<string, unknown> = {};
            const walk = (node: any, acc: any) => {
                for (const [key, val] of Object.entries(node || {})) {
                    const v: any = val;
                    if (v?.type === "object") {
                        const obj: any = {};
                        walk(v.fields, obj);
                        // If object node itself has static settings, override with staticValue
                        if (v.settings?.generationMethod === "static") {
                            acc[key] = v.settings.staticValue ?? obj;
                        } else {
                            acc[key] = obj;
                        }
                    } else if (v?.type === "array") {
                        // For arrays, if static specified at node-level, use it, otherwise generate structure of first item as placeholder
                        if (v.settings?.generationMethod === "static") {
                            acc[key] = v.settings.staticValue ?? [];
                        } else {
                            acc[key] = [];
                        }
                    } else if (
                        v?.settings?.generationMethod === "static"
                    ) {
                        acc[key] = v.settings.staticValue ?? null;
                    }
                }
            };
            walk(builtData as any, staticSnapshot);

            // Only insert if there is at least one static value
            if (Object.keys(staticSnapshot).length > 0) {
                const insertPayload: Database["public"]["Tables"]["api_sets_data"]["Insert"] = {
                    api_set_id: data.id,
                    data: staticSnapshot as any,
                };
                await supabase.from("api_sets_data").insert(insertPayload);
            }
        } catch (e) {
            // ignore snapshot errors
        }

        // If there are no AI fields, the API set is immediately ready -> set active
        try {
            if (!schemaHasAI(apiSet.schema as Schema)) {
                await supabase
                    .from("api_sets")
                    .update({ status: "active" as Database["public"]["Enums"]["api_set_status"] })
                    .eq("id", data.id)
                    .eq("user_id", userId);
            }
        } catch (e) {
            // Best-effort update; ignore errors here, the API remains usable
        }

        return {
            success,
            data: builtData,
            error: "Error while building the schema",
        };
    }

    return {
        success: false,
        error: "No schema provided",
    };
}

export async function updateApiSet(apiSet: ApiSet) {
    const validatedApiSet = updateApiSetSchema.safeParse(apiSet);

    if (!validatedApiSet.success) {
        return {
            error: validatedApiSet.error.message,
            success: false,
        };
    }

    const supabase = await createServerSupabaseClient();

    const { userId } = await auth();

    // Check if the user owns this API set
    const { data: existingApiSet, error: fetchError } = await supabase
        .from("api_sets")
        .select("user_id")
        .eq("id", apiSet.id)
        .single();

    if (fetchError || !existingApiSet) {
        return {
            error: "API Set not found",
            success: false,
        };
    }

    if (existingApiSet.user_id !== userId) {
        return {
            error: "Unauthorized to update this API Set",
            success: false,
        };
    }

    const updateData = {
        name: apiSet.name,
        description: apiSet.description,
        visibility: apiSet.visibility,
        status: apiSet.status,
        schema: apiSet.schema,
        headers: apiSet.headers || [],
    };

    const { data: updated, error: updateError } = await supabase
        .from("api_sets")
        .update(updateData)
        .eq("id", apiSet.id)
        .select()
        .single();

    if (updateError) {
        return {
            error: updateError.message,
            success: false,
        };
    }

    return {
        success: true,
        data: updated,
    };
}

export async function getApiSet(id: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from("api_sets")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return {
            error: error.message,
            success: false,
        };
    }

    return {
        success: true,
        data: data,
    };
}

export async function cloneApiSet(sourceId: string) {
    const supabase = await createServerSupabaseClient();
    const { userId } = await auth();

    if (!userId) {
        return {
            success: false,
            error: "User not authenticated",
        };
    }

    const { data: source, error: fetchError } = await supabase
        .from("api_sets")
        .select("name, description, schema, headers")
        .eq("id", sourceId)
        .single();

    if (fetchError || !source) {
        return {
            success: false,
            error: fetchError?.message || "Source API set not found",
        };
    }

    const newName = `${source.name} (copy)`;

    const { data: inserted, error: insertError } = await supabase
        .from("api_sets")
        .insert({
            name: newName,
            description: source.description,
            visibility: "private",
            status: "draft",
            schema: source.schema,
            headers: source.headers,
            user_id: userId,
        })
        .select("id")
        .single();

    if (insertError || !inserted) {
        return {
            success: false,
            error: insertError?.message || "Failed to clone API set",
        };
    }

    return {
        success: true,
        data: inserted.id,
    };
}

export async function deleteApiSet(id: string) {
    const supabase = await createServerSupabaseClient();
    const { userId } = await auth();

    if (!userId) {
        return {
            success: false,
            error: "User not authenticated",
        };
    }

    // Ensure the requester is the owner
    const { data: existing, error: fetchError } = await supabase
        .from("api_sets")
        .select("user_id")
        .eq("id", id)
        .single();

    if (fetchError || !existing) {
        return {
            success: false,
            error: fetchError?.message || "API set not found",
        };
    }

    if (existing.user_id !== userId) {
        return {
            success: false,
            error: "Unauthorized to delete this API set",
        };
    }

    const { error: deleteError } = await supabase
        .from("api_sets")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

    if (deleteError) {
        return {
            success: false,
            error: deleteError.message,
        };
    }

    return { success: true };
}
