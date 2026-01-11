import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { 
  findRelevantVerse, 
  getScriptGenerationPrompt, 
  calculateDuration,
  getPrimaryTopic,
  formatVerseForPodcast,
  type QuranVerse,
} from "@/lib/podcast/script-generator";
import type { PodcastTopicId } from "@/stores/user-store";

export const maxDuration = 60;

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

    const response: PodcastResponse = {
      success: true,
      data: {
        title,
        topic: primaryTopic,
        verse,
        script,
        estimatedDuration: duration,
        generatedAt: new Date().toISOString(),
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
