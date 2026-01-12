/**
 * Job status store using Vercel Blob
 * Works across serverless function invocations
 */
import { put, list } from "@vercel/blob";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface PodcastJob {
  id: string;
  status: JobStatus;
  scriptText?: string;
  audioUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

const JOB_PREFIX = "podcast-jobs/";

/**
 * Create a new job - stores in Vercel Blob
 */
export async function createJob(jobId: string, scriptText: string): Promise<PodcastJob> {
  const job: PodcastJob = {
    id: jobId,
    status: "pending",
    scriptText,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await put(`${JOB_PREFIX}${jobId}.json`, JSON.stringify(job), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  });

  console.log(`[JobStore] Created job ${jobId}`);
  return job;
}

/**
 * Get job status - fetches from Vercel Blob
 */
export async function getJob(jobId: string): Promise<PodcastJob | null> {
  try {
    // List blobs to find the job file
    const { blobs } = await list({ prefix: `${JOB_PREFIX}${jobId}.json` });
    
    if (blobs.length === 0) {
      console.log(`[JobStore] Job ${jobId} not found`);
      return null;
    }

    // Fetch the job data
    const response = await fetch(blobs[0].url, { cache: "no-store" });
    if (!response.ok) {
      console.log(`[JobStore] Failed to fetch job ${jobId}: ${response.status}`);
      return null;
    }

    const job = await response.json();
    console.log(`[JobStore] Found job ${jobId}: ${job.status}`);
    return job;
  } catch (error) {
    console.error(`[JobStore] Error getting job ${jobId}:`, error);
    return null;
  }
}

/**
 * Update job status
 */
export async function updateJob(
  jobId: string,
  updates: Partial<Pick<PodcastJob, "status" | "audioUrl" | "error">>
): Promise<PodcastJob | null> {
  const existing = await getJob(jobId);
  if (!existing) {
    console.log(`[JobStore] Cannot update - job ${jobId} not found`);
    return null;
  }

  const updated: PodcastJob = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await put(`${JOB_PREFIX}${jobId}.json`, JSON.stringify(updated), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  });

  console.log(`[JobStore] Updated job ${jobId}: ${updated.status}`);
  return updated;
}

/**
 * Delete job (cleanup)
 */
export async function deleteJob(jobId: string): Promise<void> {
  // Note: Vercel Blob doesn't have a delete in the free tier
  // Jobs will be cleaned up naturally or via dashboard
  console.log(`[JobStore] Delete requested for ${jobId}`);
}
