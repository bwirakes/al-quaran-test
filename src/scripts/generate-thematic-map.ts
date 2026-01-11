/**
 * Thematic Map Generator
 * 
 * This script uses Google Gemini to analyze the Quran and group surahs
 * into 10 thematic "islands" for the gamification journey system.
 * 
 * Usage: npx tsx src/scripts/generate-thematic-map.ts
 * 
 * Outputs: SQL insert statements and JSON data for seeding the database
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// Initialize Google AI
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Schema for the LLM output
const SurahGroupingSchema = z.object({
  surahs: z.array(
    z.object({
      surahId: z.number().min(1).max(114),
      surahName: z.string(),
      surahNameAr: z.string(),
      islandId: z.number().min(1).max(10),
      primaryTheme: z.string(),
      xpReward: z.number().min(10).max(500),
      seedReward: z.number().min(5).max(100),
      estimatedMinutes: z.number().min(1).max(120),
      completionCriteria: z.object({
        type: z.enum(["read_percent"]),
        value: z.number().min(50).max(100),
      }),
    })
  ),
});

// System prompt for the LLM
const SYSTEM_PROMPT = `You are an Islamic scholar with deep knowledge of Quranic themes and structure.
Your task is to analyze all 114 surahs of the Quran and assign each to one of 10 thematic islands.

THE 10 ISLANDS (use these exact IDs):
1. Fondasi Iman (Foundations of Faith) - Core beliefs, tawhid, basic Islamic principles. Start with Al-Fatihah.
2. Kisah Para Nabi (Prophetic Narratives) - Stories of prophets: Yusuf, Musa, Ibrahim, Isa, etc.
3. Hukum & Syariat (Laws & Governance) - Legal rulings, contracts, social laws, inheritance, criminal law.
4. Hari Akhir (The Afterlife) - Judgment Day, heaven, hell, resurrection, death.
5. Ibadah & Ketaatan (Worship & Devotion) - Prayer, fasting, hajj, zakat, remembrance of Allah.
6. Keluarga & Masyarakat (Family & Society) - Marriage, divorce, parenting, social etiquette.
7. Kesabaran & Ujian (Patience & Trials) - Tests of faith, jihad (struggle), perseverance, martyrdom.
8. Tanda-tanda Alam (Signs in Nature) - Creation, natural phenomena, scientific signs.
9. Dialog & Dakwah (Dialogue & Dawah) - Debates with disbelievers, invitation to Islam, argumentation.
10. Juz Amma (Short Surahs) - Surahs 78-114, commonly memorized, suitable for beginners.

IMPORTANT GUIDELINES:
- Surahs 78-114 should ALL go to island 10 (Juz Amma) as they are beginner-friendly
- Long surahs like Al-Baqarah (2) should have higher XP rewards (200-500)
- Short surahs should have lower XP rewards (10-50)
- Some surahs have multiple themes - assign to the DOMINANT theme
- XP should roughly correlate with surah length
- Seed reward should be 25-50% of XP reward
- Estimated minutes: ~2 minutes per page of Quran (vary by surah length)

SURAH LENGTH REFERENCE:
- Very Long (200+ verses): Al-Baqarah (286), An-Nisa (176), Al-A'raf (206), etc.
- Long (100-200 verses): Al-An'am (165), Al-Anfal (75), etc.
- Medium (50-100 verses): Many middle surahs
- Short (1-49 verses): Most surahs from 50 onwards
- Very Short (1-10 verses): Surahs 100-114

For each surah, provide:
1. surahId (1-114)
2. surahName (transliterated)
3. surahNameAr (Arabic)
4. islandId (1-10)
5. primaryTheme (brief description)
6. xpReward (10-500 based on length)
7. seedReward (5-100)
8. estimatedMinutes (1-120)
9. completionCriteria (always read_percent: 100 for surahs)`;

const USER_PROMPT = `Please analyze all 114 surahs of the Quran and assign each one to the appropriate thematic island.
Return the complete list of all 114 surahs with their assignments.

Remember:
- Surahs 78-114 go to Island 10 (Juz Amma)
- Al-Fatihah (1) goes to Island 1 (Foundations)
- Story-heavy surahs (like Yusuf, Qasas, Maryam) go to Island 2
- Legal surahs (like Nisa, Maidah) go to Island 3 or 6
- Eschatological surahs (like Waqiah, Rahman, Mulk) go to Island 4`;

interface GeneratedSurah {
  surahId: number;
  surahName: string;
  surahNameAr: string;
  islandId: number;
  primaryTheme: string;
  xpReward: number;
  seedReward: number;
  estimatedMinutes: number;
  completionCriteria: {
    type: "read_percent";
    value: number;
  };
}

// Generate SQL for nodes
function generateNodeSQL(surahs: GeneratedSurah[]): string {
  const lines: string[] = [
    "-- Generated Nodes for Journey Map",
    "-- Run this after schema.sql and seed-islands.sql",
    "",
    "INSERT INTO nodes (island_id, name, name_ar, type, content_refs, completion_criteria, description, xp_reward, seed_reward, order_index, estimated_minutes) VALUES",
  ];

  const values = surahs.map((surah, index) => {
    const contentRefs = JSON.stringify({ surah_id: surah.surahId });
    const completionCriteria = JSON.stringify(surah.completionCriteria);
    const description = `${surah.primaryTheme}`;
    const orderIndex = index + 1;

    return `(${surah.islandId}, '${surah.surahName.replace(/'/g, "''")}', '${surah.surahNameAr}', 'surah', '${contentRefs}'::jsonb, '${completionCriteria}'::jsonb, '${description.replace(/'/g, "''")}', ${surah.xpReward}, ${surah.seedReward}, ${orderIndex}, ${surah.estimatedMinutes})`;
  });

  lines.push(values.join(",\n"));
  lines.push(";");

  return lines.join("\n");
}

// Generate JSON output
function generateJSON(surahs: GeneratedSurah[]): string {
  const islandGroups: Record<number, GeneratedSurah[]> = {};
  
  for (const surah of surahs) {
    if (!islandGroups[surah.islandId]) {
      islandGroups[surah.islandId] = [];
    }
    islandGroups[surah.islandId].push(surah);
  }

  return JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      total_surahs: surahs.length,
      islands: islandGroups,
    },
    null,
    2
  );
}

// Validate the grouping
function validateGrouping(surahs: GeneratedSurah[]): string[] {
  const errors: string[] = [];
  const surahIds = new Set(surahs.map((s) => s.surahId));

  // Check we have all 114 surahs
  for (let i = 1; i <= 114; i++) {
    if (!surahIds.has(i)) {
      errors.push(`Missing surah ${i}`);
    }
  }

  // Check for duplicates
  if (surahIds.size !== surahs.length) {
    errors.push(`Duplicate surahs detected: expected ${surahIds.size} unique, got ${surahs.length}`);
  }

  // Check Juz Amma assignment
  for (let i = 78; i <= 114; i++) {
    const surah = surahs.find((s) => s.surahId === i);
    if (surah && surah.islandId !== 10) {
      errors.push(`Surah ${i} should be in Island 10 (Juz Amma), but is in Island ${surah.islandId}`);
    }
  }

  // Check Al-Fatihah
  const fatihah = surahs.find((s) => s.surahId === 1);
  if (fatihah && fatihah.islandId !== 1) {
    errors.push(`Al-Fatihah should be in Island 1, but is in Island ${fatihah.islandId}`);
  }

  return errors;
}

async function main() {
  console.log("🕌 Quran Thematic Map Generator");
  console.log("================================\n");

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("❌ Error: GOOGLE_GENERATIVE_AI_API_KEY not set");
    process.exit(1);
  }

  console.log("📖 Analyzing 114 Surahs with Gemini...\n");

  try {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: SurahGroupingSchema,
      system: SYSTEM_PROMPT,
      prompt: USER_PROMPT,
      temperature: 0.3, // Lower temperature for consistency
    });

    const surahs = object.surahs;

    console.log(`✅ Generated groupings for ${surahs.length} surahs\n`);

    // Validate
    const errors = validateGrouping(surahs);
    if (errors.length > 0) {
      console.warn("⚠️  Validation warnings:");
      errors.forEach((e) => console.warn(`   - ${e}`));
      console.log("");
    }

    // Statistics
    const islandCounts: Record<number, number> = {};
    for (const surah of surahs) {
      islandCounts[surah.islandId] = (islandCounts[surah.islandId] || 0) + 1;
    }

    console.log("📊 Island Distribution:");
    const islandNames = [
      "",
      "Fondasi Iman",
      "Kisah Para Nabi",
      "Hukum & Syariat",
      "Hari Akhir",
      "Ibadah & Ketaatan",
      "Keluarga & Masyarakat",
      "Kesabaran & Ujian",
      "Tanda-tanda Alam",
      "Dialog & Dakwah",
      "Juz Amma",
    ];
    for (let i = 1; i <= 10; i++) {
      console.log(`   ${i}. ${islandNames[i]}: ${islandCounts[i] || 0} surahs`);
    }
    console.log("");

    // Generate outputs
    const sqlOutput = generateNodeSQL(surahs);
    const jsonOutput = generateJSON(surahs);

    // Write SQL file
    const fs = await import("fs/promises");
    await fs.writeFile("src/db/seed-nodes.sql", sqlOutput);
    console.log("💾 SQL output written to: src/db/seed-nodes.sql");

    // Write JSON file
    await fs.writeFile("src/db/thematic-map.json", jsonOutput);
    console.log("💾 JSON output written to: src/db/thematic-map.json");

    // Sample output
    console.log("\n📝 Sample entries:");
    surahs.slice(0, 3).forEach((s) => {
      console.log(`   ${s.surahId}. ${s.surahName} → Island ${s.islandId} (${islandNames[s.islandId]})`);
    });
    console.log("   ...");

    console.log("\n✨ Generation complete!");
    console.log("\nNext steps:");
    console.log("1. Review src/db/thematic-map.json for accuracy");
    console.log("2. Run: psql $DATABASE_URL -f src/db/schema.sql");
    console.log("3. Run: psql $DATABASE_URL -f src/db/seed-islands.sql");
    console.log("4. Run: psql $DATABASE_URL -f src/db/seed-nodes.sql");
  } catch (error) {
    console.error("❌ Error generating map:", error);
    process.exit(1);
  }
}

// Export for testing
export { SYSTEM_PROMPT, SurahGroupingSchema, generateNodeSQL, validateGrouping };

// Run main
main();
