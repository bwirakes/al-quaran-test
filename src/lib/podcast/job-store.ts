/**
 * Simple job status store using Vercel Blob
 * Stores job status as small JSON files
 */
import { put, head, del } from "@vercel/blob";

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
const JOB_TTL_HOURS = 24; // Jobs expire after 24 hours

/**
 * Create a new job
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
  });

  return job;
}

/**
 * Get job status
 */
export async function getJob(jobId: string): Promise<PodcastJob | null> {
  try {
    const blobUrl = `${process.env.BLOB_URL || ""}/${JOB_PREFIX}${jobId}.json`;
    const response = await fetch(blobUrl, { cache: "no-store" });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch {
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
  if (!existing) return null;

  const updated: PodcastJob = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await put(`${JOB_PREFIX}${jobId}.json`, JSON.stringify(updated), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });

  return updated;
}

/**
 * Delete job (cleanup)
 */
export async function deleteJob(jobId: string): Promise<void> {
  try {
    const blobUrl = `${process.env.BLOB_URL || ""}/${JOB_PREFIX}${jobId}.json`;
    await del(blobUrl);
  } catch {
    // Ignore errors
  }
}
