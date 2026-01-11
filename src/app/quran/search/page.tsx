"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { searchQuran } from "@/lib/quran-data";
import { SearchBar } from "@/components/quran/search-bar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<
    Array<{ verse_key: string; text: string; translations: Array<{ text: string }> }>
  >([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchQuran(query).then(({ results, total }) => {
        setResults(results);
        setTotal(total);
        setLoading(false);
      });
    }
  }, [query]);

  const cleanText = (text: string) => {
    return text.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"');
  };

  if (!query) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Masukkan kata kunci untuk mencari ayat dalam Al-Quran
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4 border-border/30 bg-card/30">
            <Skeleton className="h-5 w-16 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">
          Tidak ditemukan hasil untuk &quot;{query}&quot;
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Ditemukan {total} hasil untuk &quot;{query}&quot;
      </p>
      <div className="space-y-4">
        {results.map((result, index) => {
          const [surahNum] = result.verse_key.split(":");
          return (
            <Link key={index} href={`/quran/${surahNum}`}>
              <Card className="p-4 border-border/30 bg-card/30 hover:bg-card/50 transition-all cursor-pointer">
                <Badge
                  variant="outline"
                  className="mb-3 bg-primary/10 border-primary/30 text-primary"
                >
                  {result.verse_key}
                </Badge>
                {result.translations && result.translations[0] && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {cleanText(result.translations[0].text)}
                  </p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background islamic-pattern">
      <div className="min-h-screen bg-gradient-to-b from-background/95 via-background/90 to-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/quran">
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold gold-text">Pencarian</h1>
            </div>
            <SearchBar placeholder="Cari ayat dalam Al-Quran..." className="max-w-xl" />
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 max-w-3xl">
          <Suspense
            fallback={
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="p-4 border-border/30 bg-card/30">
                    <Skeleton className="h-5 w-16 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </Card>
                ))}
              </div>
            }
          >
            <SearchResults />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
