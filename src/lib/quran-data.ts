// Quran data types and fetching utilities
// Using quran.com API v4 with Indonesian translation (Kemenag)

export interface Surah {
  id: number;
  name_simple: string;
  name_arabic: string;
  name_complex: string;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  verses_count: number;
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  text_indopak?: string;
  translations: Translation[];
}

export interface Translation {
  id: number;
  resource_id: number;
  text: string;
}

export interface ChapterInfo {
  id: number;
  chapter_id: number;
  text: string;
  short_text: string;
  language_name: string;
  source: string;
}

const API_BASE = "https://api.quran.com/api/v4";

// Indonesian Kemenag translation resource ID
const INDONESIAN_TRANSLATION_ID = 33;

export async function getAllSurahs(): Promise<Surah[]> {
  try {
    const response = await fetch(`${API_BASE}/chapters?language=id`);
    if (!response.ok) throw new Error("Failed to fetch surahs");
    const data = await response.json();
    return data.chapters;
  } catch (error) {
    console.error("Error fetching surahs:", error);
    return [];
  }
}

export async function getSurah(surahNumber: number): Promise<Surah | null> {
  try {
    const response = await fetch(`${API_BASE}/chapters/${surahNumber}?language=id`);
    if (!response.ok) throw new Error("Failed to fetch surah");
    const data = await response.json();
    return data.chapter;
  } catch (error) {
    console.error("Error fetching surah:", error);
    return null;
  }
}

export async function getVerses(
  surahNumber: number,
  page: number = 1,
  perPage: number = 50
): Promise<{ verses: Verse[]; pagination: { total_pages: number; current_page: number; total_records: number } }> {
  try {
    const params = new URLSearchParams({
      translations: INDONESIAN_TRANSLATION_ID.toString(),
      language: "id",
      words: "false",
      page: page.toString(),
      per_page: perPage.toString(),
      fields: "text_uthmani",
    });

    const response = await fetch(
      `${API_BASE}/verses/by_chapter/${surahNumber}?${params}`
    );
    if (!response.ok) throw new Error("Failed to fetch verses");
    const data = await response.json();
    return {
      verses: data.verses,
      pagination: data.pagination,
    };
  } catch (error) {
    console.error("Error fetching verses:", error);
    return { verses: [], pagination: { total_pages: 0, current_page: 1, total_records: 0 } };
  }
}

export async function getChapterInfo(surahNumber: number): Promise<ChapterInfo | null> {
  try {
    const response = await fetch(`${API_BASE}/chapters/${surahNumber}/info?language=id`);
    if (!response.ok) throw new Error("Failed to fetch chapter info");
    const data = await response.json();
    return data.chapter_info;
  } catch (error) {
    console.error("Error fetching chapter info:", error);
    return null;
  }
}

export async function searchQuran(
  query: string,
  page: number = 1,
  perPage: number = 20
): Promise<{ results: Array<{ verse_key: string; text: string; translations: Translation[] }>; total: number }> {
  try {
    const params = new URLSearchParams({
      q: query,
      size: perPage.toString(),
      page: page.toString(),
      language: "id",
    });

    const response = await fetch(`${API_BASE}/search?${params}`);
    if (!response.ok) throw new Error("Failed to search");
    const data = await response.json();
    return {
      results: data.search?.results || [],
      total: data.search?.total_results || 0,
    };
  } catch (error) {
    console.error("Error searching:", error);
    return { results: [], total: 0 };
  }
}

// Get a specific verse by key (e.g., "2:255" for Ayatul Kursi)
export async function getVerseByKey(verseKey: string): Promise<Verse | null> {
  try {
    const params = new URLSearchParams({
      translations: INDONESIAN_TRANSLATION_ID.toString(),
      language: "id",
      fields: "text_uthmani",
    });

    const response = await fetch(`${API_BASE}/verses/by_key/${verseKey}?${params}`);
    if (!response.ok) throw new Error("Failed to fetch verse");
    const data = await response.json();
    return data.verse;
  } catch (error) {
    console.error("Error fetching verse:", error);
    return null;
  }
}

// Utility to format surah number with leading zeros
export function formatSurahNumber(num: number): string {
  return num.toString().padStart(3, "0");
}

// Get revelation type in Indonesian
export function getRevelationType(place: string): string {
  return place === "makkah" ? "Makkiyah" : "Madaniyah";
}
