/**
 * Simple job status store
 * Uses in-memory Map for fast access (works in both dev and production)
 * Jobs auto-expire after 1 hour
 */

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

// In-memory job store (shared across requests in the same serverless instance)
const jobStore = new Map<string, PodcastJob>();

// Clean up old jobs periodically (1 hour TTL)
const JOB_TTL_MS = 60 * 60 * 1000;

function cleanupOldJobs() {
  const now = Date.now();
  for (const [id, job] of jobStore.entries()) {
    if (now - new Date(job.createdAt).getTime() > JOB_TTL_MS) {
      jobStore.delete(id);
    }
  }
}

/**
 * Create a new job
 */
export async function createJob(jobId: string, scriptText: string): Promise<PodcastJob> {
  cleanupOldJobs();
  
  const job: PodcastJob = {
    id: jobId,
    status: "pending",
    scriptText,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  jobStore.set(jobId, job);
  console.log(`[JobStore] Created job ${jobId}`);
  return job;
}

/**
 * Get job status
 */
export async function getJob(jobId: string): Promise<PodcastJob | null> {
  const job = jobStore.get(jobId);
  if (job) {
    console.log(`[JobStore] Found job ${jobId}: ${job.status}`);
  } else {
    console.log(`[JobStore] Job ${jobId} not found. Active jobs: ${Array.from(jobStore.keys()).join(", ") || "none"}`);
  }
  return job || null;
}

/**
 * Update job status
 */
export async function updateJob(
  jobId: string,
  updates: Partial<Pick<PodcastJob, "status" | "audioUrl" | "error">>
): Promise<PodcastJob | null> {
  const existing = jobStore.get(jobId);
  if (!existing) {
    console.log(`[JobStore] Cannot update - job ${jobId} not found`);
    return null;
  }

  const updated: PodcastJob = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  jobStore.set(jobId, updated);
  console.log(`[JobStore] Updated job ${jobId}: ${updated.status}`);
  return updated;
}

/**
 * Delete job (cleanup)
 */
export async function deleteJob(jobId: string): Promise<void> {
  jobStore.delete(jobId);
}
