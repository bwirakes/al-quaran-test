import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

// Surah names for OG image generation
const SURAH_NAMES: Record<number, { arabic: string; simple: string; meaning: string }> = {
  1: { arabic: "الفاتحة", simple: "Al-Fatihah", meaning: "Pembukaan" },
  2: { arabic: "البقرة", simple: "Al-Baqarah", meaning: "Sapi Betina" },
  3: { arabic: "آل عمران", simple: "Ali 'Imran", meaning: "Keluarga Imran" },
  4: { arabic: "النساء", simple: "An-Nisa", meaning: "Wanita" },
  5: { arabic: "المائدة", simple: "Al-Ma'idah", meaning: "Jamuan" },
  6: { arabic: "الأنعام", simple: "Al-An'am", meaning: "Binatang Ternak" },
  7: { arabic: "الأعراف", simple: "Al-A'raf", meaning: "Tempat Tertinggi" },
  12: { arabic: "يوسف", simple: "Yusuf", meaning: "Yusuf" },
  17: { arabic: "الإسراء", simple: "Al-Isra", meaning: "Perjalanan Malam" },
  18: { arabic: "الكهف", simple: "Al-Kahf", meaning: "Penghuni Gua" },
  19: { arabic: "مريم", simple: "Maryam", meaning: "Maryam" },
  36: { arabic: "يس", simple: "Yasin", meaning: "Yasin" },
  55: { arabic: "الرحمن", simple: "Ar-Rahman", meaning: "Yang Maha Pemurah" },
  56: { arabic: "الواقعة", simple: "Al-Waqi'ah", meaning: "Hari Kiamat" },
  67: { arabic: "الملك", simple: "Al-Mulk", meaning: "Kerajaan" },
  78: { arabic: "النبأ", simple: "An-Naba", meaning: "Berita Besar" },
  112: { arabic: "الإخلاص", simple: "Al-Ikhlas", meaning: "Ikhlas" },
  113: { arabic: "الفلق", simple: "Al-Falaq", meaning: "Waktu Subuh" },
  114: { arabic: "الناس", simple: "An-Nas", meaning: "Manusia" },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const surah = searchParams.get("surah");
  const verse = searchParams.get("verse");

  const surahNum = surah ? parseInt(surah, 10) : null;
  const verseNum = verse ? parseInt(verse, 10) : null;

  // Get surah info (fallback for unknown surahs)
  const surahInfo = surahNum && SURAH_NAMES[surahNum]
    ? SURAH_NAMES[surahNum]
    : { arabic: "القرآن الكريم", simple: "Al-Quran", meaning: "The Holy Quran" };

  let title = "Al-Quran Digital Indonesia";
  let subtitle = "Baca Al-Quran Online dengan Terjemahan Indonesia";

  if (surahNum && verseNum) {
    title = `Surah ${surahInfo.simple} Ayat ${verseNum}`;
    subtitle = `${surahInfo.meaning} - Ayat ${verseNum}`;
  } else if (surahNum) {
    title = `Surah ${surahInfo.simple}`;
    subtitle = surahInfo.meaning;
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative Islamic Pattern Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.5,
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Arabic Text */}
          <div
            style={{
              fontSize: surahNum ? "80px" : "100px",
              color: "#FFDBBB",
              marginBottom: "20px",
              fontFamily: "serif",
              textShadow: "0 4px 20px rgba(255, 219, 187, 0.3)",
            }}
          >
            {surahInfo.arabic}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: "12px",
              background: "linear-gradient(90deg, #BADDFF, #BAFFF5)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "28px",
              color: "#94a3b8",
              marginBottom: "40px",
            }}
          >
            {subtitle}
          </div>

          {/* Decorative Line */}
          <div
            style={{
              width: "200px",
              height: "4px",
              background: "linear-gradient(90deg, transparent, #BADDFF, #BAFFF5, transparent)",
              borderRadius: "2px",
              marginBottom: "40px",
            }}
          />

          {/* Brand */}
          <div
            style={{
              fontSize: "24px",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ color: "#BADDFF" }}>📖</span>
            Al-Quran Digital Indonesia
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
