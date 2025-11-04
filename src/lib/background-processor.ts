import { createServerSupabaseClient } from "@/supabase/server";
import { generateAIField } from "./openai";
import { Database } from "@/types/database.types";

export interface BackgroundJob {
    jobId: string;
    aiDataId: string;
    apiSetId: string;
    userId: string;
    fieldName: string;
    aiPrompt: string;
    aiConstraints?: string;
    status: "pending" | "processing" | "completed" | "failed";
    createdAt: Date;
    updatedAt: Date;
    result?: any;
    error?: string;
}

export class BackgroundProcessor {
    private static jobs = new Map<string, BackgroundJob>();

    /**
     * Start a background AI generation job
     */
    static async startAIGeneration(
        apiSetId: string,
        userId: string,
        fieldName: string,
        aiPrompt: string,
        aiConstraints?: string
    ): Promise<string> {
        const supabase = await createServerSupabaseClient();

        const { data: insertedAiData, error } = await supabase
            .from("ai_data")
            .insert({
                api_set_id: apiSetId,
                field_name: fieldName,
                created_by: userId,
                ai_prompt: aiPrompt,
                ai_constraints: aiConstraints,
                status: "pending",
            })
            .select()
            .single();

        if (error || !insertedAiData) {
            throw new Error(error?.message || "Failed to insert AI data");
        }

        const jobId = `${apiSetId}-${fieldName}-${Date.now()}`;

        const job: BackgroundJob = {
            jobId: jobId,
            aiDataId: insertedAiData?.id,
            apiSetId,
            userId,
            fieldName,
            aiPrompt,
            aiConstraints,
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Store job in memory
        this.jobs.set(jobId, job);

        // Start processing in background
        this.processJob(jobId);

        return jobId;
    }

    /**
     * Process a background job
     */
    private static async processJob(jobId: string) {
        const job = this.jobs.get(jobId);
        if (!job) return;

        try {
            // Update status to processing
            job.status = "processing";
            job.updatedAt = new Date();
            this.jobs.set(jobId, job);

            // Update database status
            await this.updateJobStatus(job, "processing");

            // Generate AI field
            const aiResult = await generateAIField(
                // result.result is an array of strings
                job.fieldName,
                job.aiPrompt,
                job.aiConstraints || ""
            );

            console.log("RETURN DATA", JSON.stringify(aiResult, null, 2));

            // Update job with result
            job.status = "completed";
            job.result = aiResult?.result;
            job.updatedAt = new Date();
            this.jobs.set(jobId, job);

            // Store result in database
            await this.storeJobResult(job);

            // Update API set status
            await this.updateApiSetStatus(job.apiSetId, job.userId, "active");
        } catch (error) {
            console.error(`Background job ${jobId} failed:`, error);

            // Update job with error
            job.status = "failed";
            job.error =
                error instanceof Error ? error.message : "Unknown error";
            job.updatedAt = new Date();
            this.jobs.set(jobId, job);

            // Store error in database
            await this.storeJobError(job);

            // Update API set status
            await this.updateApiSetStatus(job.apiSetId, job.userId, "draft");
        }
    }

    /**
     * Get job status
     */
    static getJobStatus(jobId: string): BackgroundJob | null {
        return this.jobs.get(jobId) || null;
    }

    /**
     * Get all jobs for an API set
     */
    static getJobsForApiSet(apiSetId: string): BackgroundJob[] {
        return Array.from(this.jobs.values()).filter(
            (job) => job.apiSetId === apiSetId
        );
    }

    /**
     * Update job status in database
     */
    private static async updateJobStatus(
        job: BackgroundJob,
        status: Database["public"]["Enums"]["api_set_status"]
    ) {
        try {
            const supabase = await createServerSupabaseClient();

            await supabase
                .from("ai_data")
                .update({
                    status,
                })
                .eq("id", job.aiDataId);
        } catch (error) {
            console.error("Failed to update job status in database:", error);
        }
    }

    /**
     * Store job result in database
     */
    private static async storeJobResult(job: BackgroundJob) {
        try {
            const supabase = await createServerSupabaseClient();

            // await supabase.rpc("merge_update_jsonb", {
            //     table_name: "api_sets_data",
            //     column_name: "data",
            //     row_id: job.apiSetDataId,
            //     object: { [job.fieldName]: job.result },
            // });

            await supabase
                .from("ai_data")
                .update({
                    status: "completed",
                    result: job.result,
                })
                .eq("id", job.aiDataId);
        } catch (error) {
            console.error("Failed to store job result in database:", error);
        }
    }

    /**
     * Store job error in database
     */
    private static async storeJobError(job: BackgroundJob) {
        try {
            const supabase = await createServerSupabaseClient();

            await supabase
                .from("ai_data")
                .update({
                    status: "failed",
                    result: job.error,
                })
                .eq("id", job.aiDataId);
        } catch (error) {
            console.error("Failed to store job error in database:", error);
        }
    }

    /**
     * Update API set status
     */
    private static async updateApiSetStatus(
        apiSetId: string,
        userId: string,
        status: Database["public"]["Enums"]["api_set_status"]
    ) {
        try {
            const supabase = await createServerSupabaseClient();

            await supabase
                .from("api_sets")
                .update({ status })
                .eq("id", apiSetId)
                .eq("user_id", userId);
        } catch (error) {
            console.error("Failed to update API set status:", error);
        }
    }

    /**
     * Clean up completed jobs (optional - for memory management)
     */
    static cleanupCompletedJobs(maxAge: number = 24 * 60 * 60 * 1000) {
        // 24 hours default
        const now = Date.now();
        for (const [jobId, job] of this.jobs.entries()) {
            if (job.status === "completed" || job.status === "failed") {
                if (now - job.updatedAt.getTime() > maxAge) {
                    this.jobs.delete(jobId);
                }
            }
        }
    }
}
