"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = "Cari surah atau ayat...",
  onSearch,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/quran/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  }, [query, onSearch, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className={`relative flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" strokeWidth={1.5} />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-10 pl-10 pr-10 border border-zinc-200 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
      <button
        onClick={handleSearch}
        className="h-10 px-4 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
      >
        Cari
      </button>
    </div>
  );
}
