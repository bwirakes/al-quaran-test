/**
 * Podcast Script Generator
 * 
 * Generates structured podcast scripts based on Quran verses and selected topics.
 */

import { searchQuran, getVerseByKey } from "@/lib/quran-data";
import type { PodcastTopicId } from "@/stores/user-store";

// Topic to Quran search mapping
const TOPIC_SEARCH_QUERIES: Record<PodcastTopicId, string[]> = {
  akhlak: ["akhlak", "budi pekerti", "perilaku baik", "berbuat baik"],
  ibadah: ["shalat", "ibadah", "taqwa", "dzikir"],
  keluarga: ["keluarga", "anak", "orangtua", "istri", "suami"],
  pekerjaan: ["rezeki", "bekerja", "usaha", "berniaga"],
  kesehatan: ["sehat", "penyakit", "kesembuhan", "makanan halal"],
  sabar: ["sabar", "ujian", "cobaan", "musibah"],
  syukur: ["syukur", "nikmat", "berterima kasih", "karunia"],
  taubat: ["taubat", "ampun", "dosa", "maghfirah"],
};

// Topic labels in Indonesian
const TOPIC_LABELS: Record<PodcastTopicId, string> = {
  akhlak: "Akhlak Mulia",
  ibadah: "Ibadah",
  keluarga: "Keluarga",
  pekerjaan: "Pekerjaan & Rezeki",
  kesehatan: "Kesehatan",
  sabar: "Kesabaran",
  syukur: "Syukur",
  taubat: "Taubat",
};

// Fallback verses for when Quran API is unavailable
const FALLBACK_VERSES: Record<PodcastTopicId, QuranVerse[]> = {
  akhlak: [
    { verseKey: "49:13", arabic: "يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا", translation: "Wahai manusia! Sungguh, Kami telah menciptakan kamu dari seorang laki-laki dan seorang perempuan, kemudian Kami jadikan kamu berbangsa-bangsa dan bersuku-suku agar kamu saling mengenal." },
    { verseKey: "31:18", arabic: "وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا", translation: "Dan janganlah kamu memalingkan wajah dari manusia (karena sombong) dan janganlah berjalan di bumi dengan angkuh." },
  ],
  ibadah: [
    { verseKey: "2:45", arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ", translation: "Dan mohonlah pertolongan (kepada Allah) dengan sabar dan salat. Dan (salat) itu sungguh berat, kecuali bagi orang-orang yang khusyuk." },
    { verseKey: "29:45", arabic: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ", translation: "Sesungguhnya salat itu mencegah dari (perbuatan) keji dan mungkar." },
  ],
  keluarga: [
    { verseKey: "30:21", arabic: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً", translation: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang." },
    { verseKey: "17:23", arabic: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا", translation: "Dan Tuhanmu telah memerintahkan agar kamu jangan menyembah selain Dia dan hendaklah berbuat baik kepada ibu bapak." },
  ],
  pekerjaan: [
    { verseKey: "62:10", arabic: "فَإِذَا قُضِيَتِ الصَّلَاةُ فَانتَشِرُوا فِي الْأَرْضِ وَابْتَغُوا مِن فَضْلِ اللَّهِ", translation: "Apabila salat telah dilaksanakan, maka bertebaranlah kamu di bumi; carilah karunia Allah." },
    { verseKey: "28:77", arabic: "وَابْتَغِ فِيمَا آتَاكَ اللَّهُ الدَّارَ الْآخِرَةَ وَلَا تَنسَ نَصِيبَكَ مِنَ الدُّنْيَا", translation: "Dan carilah (pahala) negeri akhirat dengan apa yang telah dianugerahkan Allah kepadamu, tetapi janganlah kamu lupakan bagianmu di dunia." },
  ],
  kesehatan: [
    { verseKey: "2:168", arabic: "يَا أَيُّهَا النَّاسُ كُلُوا مِمَّا فِي الْأَرْضِ حَلَالًا طَيِّبًا", translation: "Wahai manusia! Makanlah dari (makanan) yang halal dan baik yang terdapat di bumi." },
    { verseKey: "7:31", arabic: "وَكُلُوا وَاشْرَبُوا وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ", translation: "Makan dan minumlah, tetapi jangan berlebihan. Sungguh, Allah tidak menyukai orang yang berlebih-lebihan." },
  ],
  sabar: [
    { verseKey: "2:153", arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", translation: "Wahai orang-orang yang beriman! Mohonlah pertolongan (kepada Allah) dengan sabar dan salat. Sungguh, Allah beserta orang-orang yang sabar." },
    { verseKey: "3:200", arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ", translation: "Wahai orang-orang yang beriman! Bersabarlah kamu dan kuatkanlah kesabaranmu dan tetaplah bersiap siaga dan bertakwalah kepada Allah agar kamu beruntung." },
  ],
  syukur: [
    { verseKey: "14:7", arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ", translation: "Jika kamu bersyukur, niscaya Aku akan menambah (nikmat) kepadamu, tetapi jika kamu mengingkari (nikmat-Ku), maka pasti azab-Ku sangat berat." },
    { verseKey: "31:12", arabic: "وَلَقَدْ آتَيْنَا لُقْمَانَ الْحِكْمَةَ أَنِ اشْكُرْ لِلَّهِ", translation: "Dan sungguh, telah Kami berikan hikmah kepada Lukman, yaitu, 'Bersyukurlah kepada Allah!'" },
  ],
  taubat: [
    { verseKey: "39:53", arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا", translation: "Katakanlah, 'Wahai hamba-hamba-Ku yang melampaui batas terhadap diri mereka sendiri! Janganlah kamu berputus asa dari rahmat Allah. Sesungguhnya Allah mengampuni dosa-dosa semuanya.'" },
    { verseKey: "66:8", arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا", translation: "Wahai orang-orang yang beriman! Bertobatlah kepada Allah dengan tobat yang semurni-murninya." },
  ],
};

export interface QuranVerse {
  verseKey: string;
  arabic: string;
  translation: string;
  surahName?: string;
}

export interface PodcastScript {
  title: string;
  topic: string;
  verse: QuranVerse;
  sections: {
    opening: string;
    verseIntro: string;
    reflection: string;
    application: string;
    closingPrayer: string;
  };
  fullScript: string;
  estimatedDuration: number; // in minutes
}

/**
 * Get a fallback verse for the given topic
 */
function getFallbackVerse(topic: PodcastTopicId): QuranVerse {
  const verses = FALLBACK_VERSES[topic];
  const randomIndex = Math.floor(Math.random() * verses.length);
  return verses[randomIndex];
}

/**
 * Find a relevant Quran verse for the given topics
 * Falls back to pre-defined verses if API is unavailable
 */
export async function findRelevantVerse(topics: PodcastTopicId[]): Promise<QuranVerse | null> {
  // Randomly select one of the user's topics
  const selectedTopic = topics[Math.floor(Math.random() * topics.length)];
  const queries = TOPIC_SEARCH_QUERIES[selectedTopic];
  
  // Randomly select a search query for variety
  const query = queries[Math.floor(Math.random() * queries.length)];
  
  try {
    const searchResult = await searchQuran(query, 1, 10);
    
    if (searchResult.results.length === 0) {
      console.log("[Podcast] No search results, using fallback verse for topic:", selectedTopic);
      return getFallbackVerse(selectedTopic);
    }
    
    // Pick a random verse from results for variety
    const randomIndex = Math.floor(Math.random() * Math.min(searchResult.results.length, 5));
    const result = searchResult.results[randomIndex];
    
    // Fetch full verse details
    const verse = await getVerseByKey(result.verse_key);
    
    if (!verse) {
      console.log("[Podcast] Could not fetch verse details, using fallback for topic:", selectedTopic);
      return getFallbackVerse(selectedTopic);
    }
    
    return {
      verseKey: verse.verse_key,
      arabic: verse.text_uthmani,
      translation: verse.translations[0]?.text || result.translations[0]?.text || "",
    };
  } catch (error) {
    console.error("[Podcast] Error finding relevant verse, using fallback:", error);
    // Use fallback verse when API fails
    return getFallbackVerse(selectedTopic);
  }
}

/**
 * Generate the system prompt for podcast script generation
 */
export function getScriptGenerationPrompt(topic: PodcastTopicId): string {
  const topicLabel = TOPIC_LABELS[topic];
  
  return `Anda adalah seorang ustadz yang bijaksana dan hangat, membuat podcast harian islami dalam Bahasa Indonesia.

KONTEKS:
- Topik hari ini: ${topicLabel}
- Target durasi: 5-7 menit (sekitar 800-1000 kata)
- Gaya: Hangat, personal, penuh hikmah, seperti berbicara dengan teman

STRUKTUR PODCAST:
1. **Pembukaan** (30 detik): Salam hangat, bismillah, dan intro singkat topik hari ini
2. **Pengantar Ayat** (30 detik): Konteks mengapa ayat ini relevan dengan kehidupan sehari-hari
3. **Renungan/Tafsir** (3-4 menit): Penjelasan makna ayat, hikmah, dan pelajaran yang bisa diambil
4. **Aplikasi Praktis** (1-2 menit): Bagaimana menerapkan ajaran ini dalam kehidupan nyata hari ini
5. **Doa Penutup** (30 detik): Doa singkat yang relevan dengan topik

ATURAN PENTING:
- Gunakan bahasa Indonesia yang santun dan mudah dipahami
- Hindari istilah Arab yang rumit tanpa penjelasan
- Sisipkan kisah atau analogi yang relatable dengan kehidupan modern
- Jangan membaca ayat Arab (itu akan direkam terpisah), hanya jelaskan terjemahannya
- Akhiri dengan doa yang menyentuh hati
- Jangan gunakan format markdown, tulis sebagai naskah podcast yang mengalir natural

FORMAT OUTPUT:
Tulis naskah lengkap yang siap dibacakan, tanpa heading atau bullet points. Mulai langsung dengan pembukaan.`;
}

/**
 * Calculate estimated duration based on word count
 * Average Indonesian speech: ~130-150 words per minute
 */
export function calculateDuration(text: string): number {
  const wordCount = text.split(/\s+/).length;
  return Math.round(wordCount / 140); // ~140 words per minute
}

/**
 * Get the primary topic from user's selected topics
 */
export function getPrimaryTopic(topics: PodcastTopicId[]): PodcastTopicId {
  // Rotate through topics based on the day
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return topics[dayOfYear % topics.length];
}

/**
 * Format the verse for display and TTS
 */
export function formatVerseForPodcast(verse: QuranVerse): string {
  return `Surah ${verse.verseKey.replace(":", " ayat ")}: "${verse.translation}"`;
}
