import { createServerSupabaseClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { DataGenerator } from "@/lib/data-generator";
import { Schema } from "@/types/schema.types";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    const { id } = await params;

    const count = request.nextUrl.searchParams.get("count")
        ? parseInt(request.nextUrl.searchParams.get("count")!)
        : 1;

    const supabase = await createServerSupabaseClient();

    const { data: apiSet, error } = await supabase
        .from("api_sets")
        .select("id, headers, schema")
        .eq("id", id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!apiSet?.id) {
        return NextResponse.json(
            { error: "API set not found" },
            {
                status: 404,
            },
        );
    }

    // Load static values snapshot if present
    const { data: apiSetData } = await supabase
        .from("api_sets_data")
        .select("data")
        .eq("api_set_id", id)
        .single();

    // Get AI-generated data that was pre-generated
    const { data: aiData } = await supabase
        .from("ai_data")
        .select("field_name,result")
        .eq("api_set_id", apiSet.id)

    // Normalize AI data from the database to the shape expected by DataGenerator
    const normalizedAiData = aiData
        ? (aiData as any[]).map((row) => {
              const result = row.result;
              if (result === null || result === undefined) return null;

              if (Array.isArray(result)) {
                  // keep only primitive values
                  const filtered = result.filter(
                      (v) =>
                          typeof v === "string" ||
                          typeof v === "number" ||
                          typeof v === "boolean",
                  ) as (string | number | boolean)[];
                  return { field_name: row.field_name, result: filtered };
              }

              if (
                  typeof result === "string" ||
                  typeof result === "number" ||
                  typeof result === "boolean"
              ) {
                  return { field_name: row.field_name, result };
              }

              // unsupported type -> drop
              return null;
          }).filter(Boolean) as {
              field_name: string;
              result: string | number | boolean | (string | number | boolean)[];
          }[]
        : undefined;

    // Generate data on-the-fly based on the stored schema
    const schema = apiSet.schema as Schema;
    // If static snapshot exists, always return it, otherwise generate on-the-fly
    const generatedData = apiSetData?.data
        ? apiSetData.data
        : DataGenerator.generateMultipleRecords(
              schema,
              normalizedAiData,
              count,
          );

    const headers = (apiSet.headers as { key: string; value: string }[]) || [];

    return NextResponse.json(generatedData, {
        headers: headers.reduce((acc, header) => {
            acc[header.key] = header.value;
            return acc;
        }, {} as Record<string, string>),
    });
}
