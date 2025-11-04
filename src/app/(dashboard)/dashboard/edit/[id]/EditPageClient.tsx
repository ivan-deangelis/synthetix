"use client";

import { Database } from "@/types/database.types";
import { updateApiSet } from "@/app/actions/apiset-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ApiForm } from "@/components/ApiForm";
import { useState } from "react";

interface EditPageClientProps {
    apiSet: Database["public"]["Tables"]["api_sets"]["Row"];
}

const EditPageClient = ({ apiSet }: EditPageClientProps) => {
    const router = useRouter();
    const [error, setError] = useState<{ [key: string]: string } | null>(null);

    const handleUpdateApi = async (data: {
        name: string;
        description: string;
        visibility: "public" | "private";
        schema: any;
        headers: any[];
    }) => {
        const result = await updateApiSet({
            id: apiSet.id,
            name: data.name,
            description: data.description,
            visibility: data.visibility,
            status: apiSet.status,
            schema: data.schema,
            headers: data.headers,
        });

        if (result.success) {
            toast.success("API updated successfully");
            router.push(`/dashboard/view/${apiSet.id}`);
        } else {
            console.error("API update failed:", result.error);
            toast.error("API update failed");

            if (result.error) {
                try {
                    const errorParsed = JSON.parse(result.error!) as Array<{
                        path: string[];
                        message: string;
                    }>;

                    const errorMessages = errorParsed.reduce(
                        (
                            acc: any,
                            curr: { path: string[]; message: string }
                        ) => {
                            acc[curr.path[0]] = curr.message;
                            return acc;
                        },
                        {}
                    );

                    setError(errorMessages);
                } catch (e) {
                    // If error is not JSON, set it as a general error
                    setError({ general: result.error! });
                }
            }
        }
    };

    // Ensure headers are properly formatted as an array of objects with key and value
    const formattedHeaders: { key: string; value: string }[] = Array.isArray(
        apiSet.headers
    )
        ? (apiSet.headers as any[]).filter(
              (h: any) =>
                  h && typeof h === "object" && "key" in h && "value" in h
          )
        : apiSet.headers && typeof apiSet.headers === "object"
        ? Object.entries(apiSet.headers).map(([key, value]) => ({
              key,
              value: String(value),
          }))
        : [];

    return (
        <ApiForm
            initialData={{
                name: apiSet.name,
                description: apiSet.description || "",
                visibility: apiSet.visibility,
                schema: apiSet.schema,
                headers: formattedHeaders,
            }}
            onSubmit={handleUpdateApi}
            submitButtonText="Update API"
            error={error}
            onErrorChange={setError}
        />
    );
};

export default EditPageClient;
