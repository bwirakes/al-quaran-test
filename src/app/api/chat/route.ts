import { google } from "@ai-sdk/google";
import { 
  createUIMessageStream, 
  streamText, 
  JsonToSseTransformStream,
  convertToModelMessages 
} from "ai";

export const maxDuration = 60;

const SYSTEM_PROMPT = `Anda adalah asisten AI yang ahli dalam Al-Quran dan ajaran Islam. Anda membantu umat Muslim Indonesia dalam:

1. **Memahami Al-Quran**: Menjelaskan makna ayat-ayat, tafsir, dan konteks turunnya ayat (asbabun nuzul)
2. **Panduan Ibadah**: Memberikan panduan tentang shalat, puasa, zakat, haji, dan ibadah lainnya berdasarkan Al-Quran dan Hadits shahih
3. **Akhlak & Adab**: Memberi nasihat tentang perilaku yang baik sesuai tuntunan Islam
4. **Hukum Islam**: Menjelaskan hukum-hukum fiqih dasar dengan merujuk pada sumber yang terpercaya

**Prinsip yang harus diikuti:**
- Selalu merujuk pada Al-Quran dan Hadits shahih sebagai sumber utama
- Gunakan bahasa Indonesia yang sopan dan mudah dipahami
- Jika ada perbedaan pendapat ulama, sampaikan dengan bijak
- Jangan memberikan fatwa untuk masalah yang memerlukan mufti/ulama
- Jika tidak yakin, akui keterbatasan dan sarankan untuk bertanya kepada ustadz/ulama setempat
- Hormati semua mazhab dalam Islam
- Jangan membahas hal-hal yang dapat memecah belah umat

**Format respons:**
- Gunakan bahasa Indonesia yang baik dan benar
- Sertakan ayat Al-Quran dalam bahasa Arab jika relevan, diikuti terjemahannya
- Berikan penjelasan yang ringkas namun lengkap
- Akhiri dengan doa atau nasihat yang membangun jika sesuai

Anda siap membantu pengguna dengan pertanyaan seputar Al-Quran dan Islam.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, messages: existingMessages } = body;

    // Determine which messages to use
    const uiMessages = existingMessages || (message ? [message] : []);

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Convert UI messages to model messages format
        const modelMessages = await convertToModelMessages(uiMessages);
        
        const result = streamText({
          model: google("gemini-3.0-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: modelMessages,
        });

        result.consumeStream();

        writer.merge(
          result.toUIMessageStream({
            sendReasoning: false,
          })
        );
      },
      onError: (error) => {
        console.error("Stream error:", error);
        return "Maaf, terjadi kesalahan. Silakan coba lagi.";
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Gagal memproses permintaan chat" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
