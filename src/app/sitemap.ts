import type { MetadataRoute } from "next";

// Verse counts for each surah (1-114)
const VERSE_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
  111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
  54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
  49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
  44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
  26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
  6, 3, 5, 4, 5, 6,
];

// Surah names for priority calculation
const POPULAR_SURAHS = [1, 2, 3, 4, 18, 36, 55, 56, 67, 78, 112, 113, 114];
const POPULAR_VERSES = [
  "2/255", // Ayatul Kursi
  "2/286",
  "1/1",
  "1/2",
  "1/3",
  "1/4",
  "1/5",
  "1/6",
  "1/7",
  "112/1",
  "112/2",
  "112/3",
  "112/4",
  "36/1",
];

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://quran.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Homepage
  sitemapEntries.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  });

  // Main Quran page (index of all surahs)
  sitemapEntries.push({
    url: `${BASE_URL}/quran`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.95,
  });

  // Search page
  sitemapEntries.push({
    url: `${BASE_URL}/quran/search`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  });

  // Chat page
  sitemapEntries.push({
    url: `${BASE_URL}/chat`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  });

  // All 114 Surahs
  for (let surahNumber = 1; surahNumber <= 114; surahNumber++) {
    const isPopular = POPULAR_SURAHS.includes(surahNumber);
    const priority = isPopular ? 0.9 : 0.8;

    sitemapEntries.push({
      url: `${BASE_URL}/quran/${surahNumber}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority,
    });

    // All verses for this surah
    const verseCount = VERSE_COUNTS[surahNumber - 1];
    for (let verseNumber = 1; verseNumber <= verseCount; verseNumber++) {
      const verseKey = `${surahNumber}/${verseNumber}`;
      const isPopularVerse = POPULAR_VERSES.includes(verseKey);
      const versePriority = isPopularVerse ? 0.85 : 0.7;

      sitemapEntries.push({
        url: `${BASE_URL}/quran/${surahNumber}/${verseNumber}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: versePriority,
      });
    }
  }

  return sitemapEntries;
}
