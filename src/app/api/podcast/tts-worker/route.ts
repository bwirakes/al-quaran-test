/**
 * Background TTS Worker - Called by QStash
 * Generates audio and saves to Vercel Blob
 */
import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { put } from "@vercel/blob";
import { updateJob } from "@/lib/podcast/job-store";

// Allow up to 5 minutes for background processing
export const maxDuration = 300;

/**
 * Create WAV header for raw PCM data
 * Gemini TTS returns 24kHz, 16-bit, mono PCM
 */
function createWavHeader(dataLength: number): Buffer {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const fileSize = 36 + dataLength;

  const header = Buffer.alloc(44);
  
  // RIFF header
  header.write("RIFF", 0);
  header.writeUInt32LE(fileSize, 4);
  header.write("WAVE", 8);
  
  // fmt subchunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  
  // data subchunk
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);

  return header;
}

// QStash signature verification
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
});

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

    // Convert raw PCM to WAV with proper header
    const pcmBuffer = Buffer.from(audioData, "base64");
    const wavHeader = createWavHeader(pcmBuffer.length);
    const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
    
    console.log(`[TTS Worker] PCM size: ${pcmBuffer.length}, WAV size: ${wavBuffer.length}`);

    // Save audio to Vercel Blob
    const filename = `podcast-${jobId}.wav`;
    const blob = await put(`podcasts/${filename}`, wavBuffer, {
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

// Wrap handler with QStash signature verification
export async function POST(req: Request): Promise<Response> {
  // Verify QStash signature in production
  if (process.env.NODE_ENV === "production" && process.env.QSTASH_CURRENT_SIGNING_KEY) {
    const signature = req.headers.get("upstash-signature");
    const body = await req.text();
    
    try {
      await receiver.verify({
        signature: signature || "",
        body,
      });
      
      // Re-create request with body for handler
      const newReq = new Request(req.url, {
        method: req.method,
        headers: req.headers,
        body,
      });
      return handler(newReq);
    } catch (error) {
      console.error("[TTS Worker] Signature verification failed:", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }
  
  // In development, skip verification
  return handler(req);
}
