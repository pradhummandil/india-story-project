// Background Jobs & Task Queue Processor
// Schedules asynchronous processing for index rebuilding, log flushes, and podcast generator feeds.

export interface QueueJob {
  id: string;
  name: string;
  payload: any;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: number;
}

const jobQueue: QueueJob[] = [];
let processing = false;

const jobHandlers: Record<string, (payload: any) => Promise<void>> = {
  rebuildSearchIndex: async (payload) => {
    console.log("[Background Job] Rebuilding keyword search index densities...", payload);
    // Simulate short processing
    await new Promise((r) => setTimeout(r, 1000));
  },
  flushAuditLogs: async (payload) => {
    console.log("[Background Job] Flashing local log queues to Supabase...", payload);
    await new Promise((r) => setTimeout(r, 500));
  },
  refreshPodcastFeed: async (payload) => {
    console.log("[Background Job] Re-generating XML iTunes enclosure feeds...", payload);
    await new Promise((r) => setTimeout(r, 1200));
  },
};

async function processQueue() {
  if (processing || jobQueue.length === 0) return;
  processing = true;

  while (jobQueue.length > 0) {
    const job = jobQueue.find((j) => j.status === "pending");
    if (!job) break;

    job.status = "processing";
    try {
      const handler = jobHandlers[job.name];
      if (handler) {
        await handler(job.payload);
        job.status = "completed";
      } else {
        throw new Error(`No registered handler for job: ${job.name}`);
      }
    } catch (err) {
      console.error(`[Background Job Error] Job ${job.id} failed:`, err);
      job.status = "failed";
    }
  }

  processing = false;
}

export const queueService = {
  dispatch: (name: string, payload: any = {}): string => {
    const jobId = `job_${Math.random().toString(36).substring(2, 9)}`;
    const job: QueueJob = {
      id: jobId,
      name,
      payload,
      status: "pending",
      createdAt: Date.now(),
    };
    jobQueue.push(job);

    // Process queue in the next execution turn (asynchronously)
    setTimeout(() => {
      processQueue().catch((err) => console.error("Error processing jobs queue:", err));
    }, 0);

    return jobId;
  },

  getJobStatus: (jobId: string): QueueJob["status"] | null => {
    const job = jobQueue.find((j) => j.id === jobId);
    return job ? job.status : null;
  },

  listQueue: (): QueueJob[] => {
    return [...jobQueue];
  },
};
