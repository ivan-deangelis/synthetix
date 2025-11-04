"use client";

import { User } from "@supabase/supabase-js";
import { createApiSet } from "@/app/actions/apiset-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ApiForm } from "@/components/ApiForm";
import { useState } from "react";

const CreatePageClient = () => {
    const router = useRouter();
    const [error, setError] = useState<{ [key: string]: string } | null>(null);

    const handleCreateApi = async (data: {
        name: string;
        description: string;
        visibility: "public" | "private";
        schema: any;
        headers: any[];
    }) => {
        console.log("API Name:", data.name);
        console.log("Schema:", JSON.stringify(data.schema, null, 2));
        console.log("Headers:", JSON.stringify(data.headers, null, 2));

        const result = await createApiSet({
            name: data.name,
            description: data.description,
            visibility: data.visibility,
            status: "draft",
            schema: data.schema,
            headers: data.headers,
        });

        if (result.success) {
            toast.success("API created successfully");
            router.replace("/dashboard");
        } else {
            console.error("API creation failed:", result.error);
            toast.error("API creation failed");

            if (result.error) {
                const errorParsed = JSON.parse(result.error!) as Array<{
                    path: string[];
                    message: string;
                }>;

                const errorMessages = errorParsed.reduce(
                    (acc: any, curr: { path: string[]; message: string }) => {
                        acc[curr.path[0]] = curr.message;
                        return acc;
                    },
                    {}
                );

                setError(errorMessages);
            }
        }
    };

    return (
        <ApiForm
            onSubmit={handleCreateApi}
            submitButtonText="Create API"
            error={error}
            onErrorChange={setError}
        />
    );
};

export default CreatePageClient;
