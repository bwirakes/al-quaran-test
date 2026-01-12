import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { Client } from "@upstash/qstash";
import { 
  findRelevantVerse, 
  getScriptGenerationPrompt, 
  calculateDuration,
  getPrimaryTopic,
  formatVerseForPodcast,
  type QuranVerse,
} from "@/lib/podcast/script-generator";
import { createJob, updateJob } from "@/lib/podcast/job-store";
import type { PodcastTopicId } from "@/stores/user-store";

export const maxDuration = 60;

// Initialize QStash client lazily to ensure env vars are loaded
const getQStashClient = () => {
  const token = process.env.QSTASH_TOKEN;
  console.log("[QStash] Token present:", !!token, "Length:", token?.length);
  console.log("[QStash] Token first 20 chars:", token?.slice(0, 20));
  console.log("[QStash] All env keys:", Object.keys(process.env).filter(k => k.includes("QSTASH")));
  if (!token) {
    throw new Error("QSTASH_TOKEN not configured");
  }
  return new Client({ token });
};

interface GenerateRequest {
  topics: PodcastTopicId[];
}

interface PodcastResponse {
  success: boolean;
  data?: {
    title: string;
    topic: string;
    verse: QuranVerse;
    script: string;
    estimatedDuration: number;
    generatedAt: string;
    jobId: string; // For polling TTS status
  };
  error?: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body: GenerateRequest = await req.json();
    const { topics } = body;

    if (!topics || topics.length === 0) {
      return Response.json(
        { success: false, error: "Pilih minimal satu topik" } as PodcastResponse,
        { status: 400 }
      );
    }

    // Get the primary topic for today
    const primaryTopic = getPrimaryTopic(topics);

    // Find a relevant Quran verse
    const verse = await findRelevantVerse(topics);
    
    if (!verse) {
      return Response.json(
        { success: false, error: "Tidak dapat menemukan ayat yang relevan" } as PodcastResponse,
        { status: 500 }
      );
    }

    // Generate the podcast script using Gemini
    const systemPrompt = getScriptGenerationPrompt(primaryTopic);
    const userPrompt = `Buatlah naskah podcast islami berdasarkan ayat berikut:

${formatVerseForPodcast(verse)}

Teks Arab: ${verse.arabic}

Ingat: Jangan membacakan teks Arab dalam naskah, cukup jelaskan maknanya dalam bahasa Indonesia.`;

    const result = await generateText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    const script = result.text;
    const duration = calculateDuration(script);

    // Create a title based on the topic and verse
    const topicLabels: Record<PodcastTopicId, string> = {
      akhlak: "Akhlak Mulia",
      ibadah: "Ibadah",
      keluarga: "Keluarga",
      pekerjaan: "Rezeki & Pekerjaan",
      kesehatan: "Kesehatan",
      sabar: "Kesabaran",
      syukur: "Syukur",
      taubat: "Taubat",
    };

    const title = `Renungan ${topicLabels[primaryTopic]} - ${verse.verseKey}`;

    // Generate a job ID
    const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Create job record
    await createJob(jobId, script);

    // Queue TTS job
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";
    const workerUrl = `${baseUrl}/api/podcast/tts-worker`;
    
    console.log(`[Generate] VERCEL_URL: ${process.env.VERCEL_URL}`);
    console.log(`[Generate] Worker URL: ${workerUrl}`);
    console.log(`[Generate] QSTASH_TOKEN present: ${!!process.env.QSTASH_TOKEN}`);
    
    // Try QStash first if available
    let qstashSuccess = false;
    if (process.env.QSTASH_TOKEN) {
      try {
        const qstash = getQStashClient();
        const result = await qstash.publishJSON({
          url: workerUrl,
          body: { jobId, text: script, voice: "Aoede" },
          retries: 2,
        });
        console.log(`[Generate] QStash result:`, JSON.stringify(result));
        console.log(`[Generate] Queued TTS job ${jobId} via QStash`);
        qstashSuccess = true;
      } catch (qstashError) {
        console.error("[Generate] QStash error:", qstashError);
      }
    } else {
      console.log("[Generate] QSTASH_TOKEN not set, skipping QStash");
    }
    
    // Fallback: Call worker directly (fire-and-forget)
    if (!qstashSuccess) {
      console.log(`[Generate] Fallback: Calling TTS worker directly for job ${jobId}`);
      // Fire-and-forget - may not complete if function terminates
      fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, text: script, voice: "Aoede" }),
      }).catch(err => console.error("[Generate] Direct TTS call failed:", err));
    }

    const response: PodcastResponse = {
      success: true,
      data: {
        title,
        topic: primaryTopic,
        verse,
        script,
        estimatedDuration: duration,
        generatedAt: new Date().toISOString(),
        jobId,
      },
    };

    return Response.json(response);
  } catch (error) {
    console.error("Podcast generation error:", error);
    return Response.json(
      { 
        success: false, 
        error: "Gagal membuat podcast. Silakan coba lagi." 
      } as PodcastResponse,
      { status: 500 }
    );
  }
}
