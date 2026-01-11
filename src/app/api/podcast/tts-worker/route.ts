/**
 * Background TTS Worker - Called by QStash
 * Generates audio and saves to Vercel Blob
 */
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { updateJob } from "@/lib/podcast/job-store";

// Allow up to 5 minutes for background processing
export const maxDuration = 300;

interface TTSJobPayload {
  jobId: string;
  text: string;
  voice?: string;
}

async function handler(req: Request): Promise<Response> {
  try {
    const body: TTSJobPayload = await req.json();
    const { jobId, text, voice = "Aoede" } = body;

    console.log(`[TTS Worker] Starting job ${jobId}, text length: ${text.length}`);

    // Update status to processing
    await updateJob(jobId, { status: "processing" });

    // Add voice direction to text
    const voiceDirection = `[Speak in a warm, contemplative tone like a wise Islamic teacher giving a gentle sermon. Pace should be calm and measured, with natural pauses for reflection.]`;
    const fullText = `${voiceDirection}\n\n${text}`;

    // Call Gemini TTS API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullText }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TTS Worker] Gemini API error:`, errorText);
      await updateJob(jobId, { status: "failed", error: "TTS generation failed" });
      return NextResponse.json({ success: false, error: "TTS failed" }, { status: 500 });
    }

    const data = await response.json();
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioData) {
      console.error(`[TTS Worker] No audio data in response`);
      await updateJob(jobId, { status: "failed", error: "No audio data returned" });
      return NextResponse.json({ success: false, error: "No audio" }, { status: 500 });
    }

    // Save audio to Vercel Blob
    const audioBuffer = Buffer.from(audioData, "base64");
    const filename = `podcast-${jobId}.wav`;

    const blob = await put(`podcasts/${filename}`, audioBuffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: "audio/wav",
    });

    console.log(`[TTS Worker] Audio saved: ${blob.url}`);

    // Update job with audio URL
    await updateJob(jobId, { status: "completed", audioUrl: blob.url });

    return NextResponse.json({ success: true, audioUrl: blob.url });
  } catch (error) {
    console.error("[TTS Worker] Error:", error);
    return NextResponse.json(
      { success: false, error: "Worker error" },
      { status: 500 }
    );
  }
}

// Export handler directly - QStash verification can be added later with signing keys
// To enable: set QSTASH_CURRENT_SIGNING_KEY and QSTASH_NEXT_SIGNING_KEY
export const POST = handler;
