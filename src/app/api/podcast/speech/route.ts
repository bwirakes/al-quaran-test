export const maxDuration = 120; // TTS can take longer

interface SpeechRequest {
  text: string;
  voiceStyle?: "calm" | "warm" | "contemplative";
}

// Available Gemini TTS prebuilt voices:
// Puck, Charon, Kore, Fenrir, Aoede, Leda, Orus, Zephyr
// See: https://ai.google.dev/gemini-api/docs/speech-generation

export async function POST(req: Request): Promise<Response> {
  try {
    const body: SpeechRequest = await req.json();
    const { text, voiceStyle = "warm" } = body;

    if (!text || text.trim().length === 0) {
      return Response.json(
        { success: false, error: "Teks tidak boleh kosong" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
      return Response.json({
        success: true,
        data: {
          audio: null,
          mimeType: null,
          scriptOnly: true,
          message: "Audio tidak tersedia. Silakan baca naskah podcast.",
          generatedAt: new Date().toISOString(),
        },
      });
    }

    // Voice style to voice mapping
    // Kore = calm/measured, Aoede = warm/friendly, Charon = deep/thoughtful
    const voiceMap: Record<string, string> = {
      calm: "Kore",
      warm: "Aoede",
      contemplative: "Charon",
    };

    const selectedVoice = voiceMap[voiceStyle] || "Aoede";

    // Build the prompt with style direction embedded (as per Google's documentation)
    // Using director's notes style for better control
    const styledPrompt = `### DIRECTOR'S NOTES
Style: Speak in a ${voiceStyle}, respectful, and sincere tone. This is an Islamic religious podcast in Indonesian language (Bahasa Indonesia). Maintain a warm, inviting tone like a kind ustadz speaking to their congregation.

Pacing: Moderate pace with natural pauses for reflection. Not too fast, allowing listeners to absorb the meaning.

### TRANSCRIPT
${text}`;

    // Call Gemini 2.5 Flash Preview TTS API
    // Reference: https://ai.google.dev/gemini-api/docs/speech-generation
    const requestBody = {
      contents: [{
        parts: [{
          text: styledPrompt
        }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: selectedVoice,
            }
          }
        }
      }
    };

    console.log("[TTS] Request to gemini-2.5-flash-preview-tts");
    console.log("[TTS] Voice:", selectedVoice);
    console.log("[TTS] Text length:", text.length, "chars");

    const ttsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("[TTS] Response status:", ttsResponse.status);

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.text();
      console.error("[TTS] API error:", ttsResponse.status);
      console.error("[TTS] Error body:", errorData);
      
      // Return script-only response on TTS failure
      return Response.json({
        success: true,
        data: {
          audio: null,
          mimeType: null,
          scriptOnly: true,
          message: "Audio sedang tidak tersedia. Silakan baca naskah podcast.",
          generatedAt: new Date().toISOString(),
        },
      });
    }

    const responseData = await ttsResponse.json();
    console.log("[TTS] Response keys:", Object.keys(responseData));

    // Extract audio data from response
    // Response format: candidates[0].content.parts[0].inlineData.data (base64)
    const audioData = responseData.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    
    console.log("[TTS] Has candidates:", !!responseData.candidates);
    console.log("[TTS] Has audioData:", !!audioData);
    if (audioData) {
      console.log("[TTS] Audio mimeType:", audioData.mimeType);
      console.log("[TTS] Audio data length:", audioData.data?.length || 0);
    }
    
    if (!audioData || !audioData.data) {
      console.error("[TTS] No audio data in response:", JSON.stringify(responseData).slice(0, 1000));
      // If no audio in response, return script-only
      return Response.json({
        success: true,
        data: {
          audio: null,
          mimeType: null,
          scriptOnly: true,
          message: "Audio tidak tersedia. Silakan baca naskah podcast.",
          generatedAt: new Date().toISOString(),
        },
      });
    }

    // Return audio as base64 with metadata
    // Note: Gemini TTS returns PCM audio at 24kHz, mono, 16-bit
    console.log("[TTS] Success! Returning audio data");
    return Response.json({
      success: true,
      data: {
        audio: audioData.data,
        mimeType: audioData.mimeType || "audio/L16;rate=24000",
        scriptOnly: false,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("TTS generation error:", error);
    
    // Graceful fallback - return script-only response
    return Response.json({
      success: true,
      data: {
        audio: null,
        mimeType: null,
        scriptOnly: true,
        message: "Terjadi kesalahan saat menghasilkan audio. Silakan baca naskah podcast.",
        generatedAt: new Date().toISOString(),
      },
    });
  }
}
