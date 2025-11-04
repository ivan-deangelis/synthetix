import { createServerSupabaseClient } from "@/supabase/server";
import { generateAIField } from "./openai";
import { Database } from "@/types/database.types";

/**
 * Represents a background job for AI data generation.
 * Jobs track the entire lifecycle from creation to completion or failure.
 */
export interface BackgroundJob {
    /** Unique identifier for the job */
    jobId: string;
    /** Database record ID for the AI data */
    aiDataId: string;
    /** The API set this job belongs to */
    apiSetId: string;
    /** User who created the API set */
    userId: string;
    /** Name of the field being generated */
    fieldName: string;
    /** AI prompt describing what to generate */
    aiPrompt: string;
    /** Optional constraints for AI generation */
    aiConstraints?: string;
    /** Current job status */
    status: "pending" | "processing" | "completed" | "failed";
    /** When the job was created */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
    /** Generated result (available when status is 'completed') */
    result?: any;
    /** Error message (available when status is 'failed') */
    error?: string;
}

/**
 * BackgroundProcessor manages asynchronous AI data generation jobs.
 * It provides:
 * - Job scheduling and tracking
 * - In-memory job state management
 * - Database persistence for job status and results
 * - API set status updates based on job completion
 * 
 * Job Lifecycle:
 * 1. Job is created with 'pending' status
 * 2. Status changes to 'processing' when AI generation starts
 * 3. On success: status becomes 'completed' and result is stored
 * 4. On failure: status becomes 'failed' and error is stored
 */
export class BackgroundProcessor {
    /** In-memory storage for active and recent jobs */
    private static jobs = new Map<string, BackgroundJob>();

    /**
     * Initiates a background AI generation job for a specific field.
     * The job is persisted to the database and processed asynchronously.
     * 
     * @param apiSetId - The API set identifier
     * @param userId - The user who owns the API set
     * @param fieldName - Name of the field to generate data for
     * @param aiPrompt - Description of what to generate
     * @param aiConstraints - Optional constraints or requirements
     * @returns Promise resolving to the job ID for tracking
     * @throws {Error} If database insertion fails
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
     * Processes a background job by generating AI data and updating status.
     * This method runs asynchronously and handles all stages of job execution.
     * 
     * Flow:
     * 1. Updates job status to 'processing'
     * 2. Calls OpenAI API to generate data
     * 3. On success: stores result and marks job as 'completed'
     * 4. On failure: stores error and marks job as 'failed'
     * 5. Updates the parent API set status accordingly
     * 
     * @param jobId - The job identifier to process
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
     * Retrieves the current status of a specific job.
     * 
     * @param jobId - The job identifier
     * @returns The job object if found, null otherwise
     */
    static getJobStatus(jobId: string): BackgroundJob | null {
        return this.jobs.get(jobId) || null;
    }

    /**
     * Retrieves all jobs associated with a specific API set.
     * Useful for monitoring the progress of multiple AI generation jobs.
     * 
     * @param apiSetId - The API set identifier
     * @returns Array of jobs for the specified API set
     */
    static getJobsForApiSet(apiSetId: string): BackgroundJob[] {
        return Array.from(this.jobs.values()).filter(
            (job) => job.apiSetId === apiSetId
        );
    }

    /**
     * Updates the job status in the database.
     * Called internally to keep database in sync with in-memory state.
     * 
     * @param job - The job to update
     * @param status - The new status to set
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
     * Persists the job result to the database.
     * Stores the generated AI data in the ai_data table.
     * 
     * @param job - The completed job with results
     */
    private static async storeJobResult(job: BackgroundJob) {
        try {
            const supabase = await createServerSupabaseClient();

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
     * Persists the job error to the database.
     * Stores error information when job processing fails.
     * 
     * @param job - The failed job with error details
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
     * Updates the status of an API set in the database.
     * Changes status to 'active' when all jobs complete successfully,
     * or 'draft' if any job fails.
     * 
     * @param apiSetId - The API set identifier
     * @param userId - The user who owns the API set
     * @param status - The new status to set
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
     * Removes completed or failed jobs from memory after a specified time.
     * Helps manage memory by cleaning up old job records.
     * Should be called periodically in production environments.
     * 
     * @param maxAge - Maximum age in milliseconds for completed jobs (default: 24 hours)
     */
    static cleanupCompletedJobs(maxAge: number = 24 * 60 * 60 * 1000) {
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
