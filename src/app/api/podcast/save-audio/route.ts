import { put } from "@vercel/blob";

interface SaveAudioRequest {
  audioBase64: string;
  filename?: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body: SaveAudioRequest = await req.json();
    const { audioBase64, filename } = body;

    if (!audioBase64) {
      return Response.json(
        { success: false, error: "No audio data provided" },
        { status: 400 }
      );
    }

    // Generate filename based on date/time if not provided
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const timeStr = today.toTimeString().split(" ")[0].replace(/:/g, "-");
    const finalFilename = filename || `podcast-${dateStr}-${timeStr}.wav`;

    // Decode base64 and create WAV file
    const audioBuffer = Buffer.from(audioBase64, "base64");
    
    // Create WAV header for PCM 24kHz, 16-bit, mono
    const wavHeader = createWavHeader(audioBuffer.length, 24000, 1, 16);
    const wavFile = Buffer.concat([wavHeader, audioBuffer]);

    // Upload to Vercel Blob
    const blob = await put(`podcasts/${finalFilename}`, wavFile, {
      access: "public",
      contentType: "audio/wav",
    });

    console.log(`[SaveAudio] Uploaded to Vercel Blob: ${blob.url} (${wavFile.length} bytes)`);

    return Response.json({
      success: true,
      data: {
        url: blob.url,
        filename: finalFilename,
        size: wavFile.length,
      },
    });
  } catch (error) {
    console.error("[SaveAudio] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { success: false, error: `Failed to save audio file: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Create a WAV file header
 */
function createWavHeader(
  dataLength: number,
  sampleRate: number,
  numChannels: number,
  bitsPerSample: number
): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const fileSize = 36 + dataLength;

  const header = Buffer.alloc(44);

  // RIFF header
  header.write("RIFF", 0);
  header.writeUInt32LE(fileSize, 4);
  header.write("WAVE", 8);

  // fmt chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Chunk size
  header.writeUInt16LE(1, 20); // Audio format (PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);

  return header;
}
