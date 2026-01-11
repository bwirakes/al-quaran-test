"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore, type PodcastTopicId, type SavedPodcast } from "@/stores/user-store";
import { TopicSelector } from "@/components/podcast/topic-selector";
import { AudioPlayer, AudioPlayerSkeleton } from "@/components/podcast/audio-player";
import { useToast } from "@/components/ui/toast";
import type { QuranVerse } from "@/lib/podcast/script-generator";
import { Footer } from "@/components/layout/footer";

interface PodcastData {
  title: string;
  topic: string;
  verse: QuranVerse;
  script: string;
  estimatedDuration: number;
  generatedAt: string;
}

interface AudioData {
  audio: string | null;
  audioUrl?: string | null;
  mimeType: string | null;
  scriptOnly?: boolean;
  message?: string;
  generatedAt: string;
}

type ViewState = "loading" | "onboarding" | "dashboard" | "generating" | "playing" | "history" | "error";
type HistoryTab = "all" | "saved";

// Shared Header Component
function PageHeader() {
  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 border border-sky-200 rounded-lg flex items-center justify-center bg-sky-50">
                <span className="font-bold text-sm font-serif" style={{ color: '#496580' }}>ق</span>
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 font-serif">
                  Al-Quran Digital
                </h1>
                <p 
                  className="text-xs -mt-0.5"
                  lang="ar" 
                  dir="rtl"
                  style={{ fontFamily: '"Scheherazade New", serif', color: '#496580' }}
                >
                  القرآن الكريم
                </p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/quran" 
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
              >
                Daftar Surah
              </Link>
              <Link 
                href="/podcast" 
                className="px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: '#496580' }}
              >
                Podcast
              </Link>
              <Link 
                href="/chat" 
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
              >
                Asisten AI
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

// History Item Component
function HistoryItem({ 
  podcast, 
  onPlay, 
  onToggleSave, 
  onDelete 
}: { 
  podcast: SavedPodcast; 
  onPlay: () => void; 
  onToggleSave: () => void;
  onDelete: () => void;
}) {
  const date = new Date(podcast.createdAt);
  const formattedDate = date.toLocaleDateString("id-ID", { 
    day: "numeric", 
    month: "short", 
    year: "numeric" 
  });

  return (
    <div className="p-4 rounded-xl border border-stone-200 bg-white hover:border-sky-300 transition-colors group">
      <div className="flex items-start gap-4">
        <button
          onClick={onPlay}
          className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center group-hover:from-sky-200 group-hover:to-sky-300 transition-colors"
        >
          <svg className="w-5 h-5 text-sky-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm truncate">{podcast.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">QS. {podcast.verseKey} • {formattedDate}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-sky-50 text-[#496580] rounded text-xs font-medium">
              {podcast.topic.charAt(0).toUpperCase() + podcast.topic.slice(1)}
            </span>
            <span className="text-xs text-slate-400">
              {Math.round(podcast.duration)} menit
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSave}
            className={`p-2 rounded-lg transition-colors ${
              podcast.isSaved 
                ? "text-amber-500 hover:bg-amber-50" 
                : "text-slate-400 hover:text-amber-500 hover:bg-slate-50"
            }`}
            title={podcast.isSaved ? "Hapus dari tersimpan" : "Simpan"}
          >
            <svg className="w-5 h-5" fill={podcast.isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 transition-colors"
            title="Hapus"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PodcastPage() {
  const { 
    user, 
    updatePodcastTopics, 
    cachePodcast, 
    addPodcastToHistory,
    toggleSavePodcast,
    deletePodcastFromHistory,
    updatePodcastAudioUrl,
  } = useUserStore();
  
  const router = useRouter();
  const { addToast } = useToast();
  
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [showScript, setShowScript] = useState(false);
  const [showTopicEditor, setShowTopicEditor] = useState(false);
  const [historyTab, setHistoryTab] = useState<HistoryTab>("all");
  const [selectedHistoryPodcast, setSelectedHistoryPodcast] = useState<SavedPodcast | null>(null);
  const [currentPodcastId, setCurrentPodcastId] = useState<string | null>(null);
  const [isAudioProcessing, setIsAudioProcessing] = useState(false);
  const pollingRef = useRef<boolean>(false);

  useEffect(() => {
    if (user.isLoading) return;

    const prefs = user.podcastPreferences;
    
    if (!prefs || !prefs.hasCompletedOnboarding || prefs.selectedTopics.length === 0) {
      setViewState("onboarding");
      return;
    }

    // We no longer store full podcast data - just go to dashboard
    // Users can access today's podcast from history if they've generated one
    setViewState("dashboard");
  }, [user.isLoading, user.podcastPreferences]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      pollingRef.current = false;
    };
  }, []);

  // Show toast when navigating away while processing
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAudioProcessing) {
        addToast({
          type: "info",
          title: "Audio sedang diproses",
          description: "Kami akan memberi tahu saat podcast siap.",
          duration: 8000,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAudioProcessing, addToast]);

  const handleTopicsComplete = () => {
    setViewState("dashboard");
    setShowTopicEditor(false);
  };

  // Poll for audio completion (background TTS via QStash)
  const pollForAudio = async (jobId: string, podcastId: string) => {
    const maxAttempts = 60; // 5 minutes max (5s intervals)
    let attempts = 0;
    pollingRef.current = true;
    setIsAudioProcessing(true);

    const poll = async () => {
      if (!pollingRef.current) return; // Stop if component unmounted

      try {
        const res = await fetch(`/api/podcast/status/${jobId}`);
        if (!res.ok) {
          attempts++;
          if (attempts < maxAttempts) setTimeout(poll, 5000);
          return;
        }

        const job = await res.json();
        
        if (job.status === "completed" && job.audioUrl) {
          // Audio is ready!
          setAudioData({
            audio: null,
            audioUrl: job.audioUrl,
            mimeType: "audio/wav",
            scriptOnly: false,
            generatedAt: new Date().toISOString(),
          });

          // Update history with audio URL
          updatePodcastAudioUrl(podcastId, job.audioUrl);
          setGenerationStep("");
          setIsAudioProcessing(false);
          pollingRef.current = false;

          // Show toast notification
          addToast({
            type: "success",
            title: "🎙️ Podcast siap!",
            description: "Audio podcast Anda sudah selesai diproses.",
            action: {
              label: "Putar Sekarang",
              onClick: () => router.push("/podcast"),
            },
            duration: 15000,
          });
          return;
        }

        if (job.status === "failed") {
          console.warn("[Podcast] TTS job failed:", job.error);
          setGenerationStep("");
          setIsAudioProcessing(false);
          pollingRef.current = false;
          
          addToast({
            type: "error",
            title: "Gagal membuat audio",
            description: "Anda masih bisa membaca naskah podcast.",
          });
          return;
        }

        // Still processing - continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          console.warn("[Podcast] Audio generation timed out");
          setGenerationStep("");
          setIsAudioProcessing(false);
          pollingRef.current = false;
        }
      } catch (error) {
        console.error("[Podcast] Poll error:", error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        }
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 3000);
  };

  const generatePodcast = async () => {
    const topics = user.podcastPreferences?.selectedTopics ?? [];
    if (topics.length === 0) {
      setError("Silakan pilih topik terlebih dahulu");
      setViewState("error");
      return;
    }

    setViewState("generating");
    setError(null);
    setGenerationStep("Mencari ayat yang relevan...");

    try {
      const generateRes = await fetch("/api/podcast/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics }),
      });

      if (!generateRes.ok) throw new Error("Gagal membuat naskah podcast");

      const generateData = await generateRes.json();
      if (!generateData.success) throw new Error(generateData.error || "Gagal membuat naskah podcast");

      // Show script immediately - audio is generating in background
      setPodcastData(generateData.data);
      
      // Set initial audio state (script only while processing)
      setAudioData({
        audio: null,
        audioUrl: null,
        mimeType: "audio/wav",
        scriptOnly: true,
        message: "Audio sedang diproses...",
        generatedAt: new Date().toISOString(),
      });

      // Add to history immediately
      const podcastId = addPodcastToHistory({
        title: generateData.data.title,
        topic: generateData.data.topic,
        verseKey: generateData.data.verse.verseKey,
        audioUrl: null, // Will be updated when ready
        duration: generateData.data.estimatedDuration,
      });
      setCurrentPodcastId(podcastId);

      // Cache minimal metadata
      cachePodcast({
        title: generateData.data.title,
        verseKey: generateData.data.verse.verseKey,
        topic: generateData.data.topic,
        audioUrl: null,
      });

      setViewState("playing");

      // Poll for audio completion in background
      const jobId = generateData.data.jobId;
      if (jobId) {
        setGenerationStep("Audio sedang diproses...");
        pollForAudio(jobId, podcastId);
      }
    } catch (err) {
      console.error("Podcast generation error:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setViewState("error");
    }
  };

  const playFromHistory = (podcast: SavedPodcast) => {
    setSelectedHistoryPodcast(podcast);
    // History only stores minimal data - no script or verse details
    setPodcastData({
      title: podcast.title,
      topic: podcast.topic,
      verse: {
        verseKey: podcast.verseKey,
        arabic: "", // Not stored in history
        translation: "", // Not stored in history
      },
      script: "", // Not stored in history
      estimatedDuration: podcast.duration,
      generatedAt: podcast.createdAt,
    });
    setAudioData({
      audio: null,
      audioUrl: podcast.audioUrl,
      mimeType: "audio/wav",
      scriptOnly: !podcast.audioUrl,
      generatedAt: podcast.createdAt,
    });
    setCurrentPodcastId(podcast.id);
    setViewState("playing");
  };

  const history = user.podcastPreferences?.history || [];
  const filteredHistory = historyTab === "saved" 
    ? history.filter(p => p.isSaved) 
    : history;

  // Loading state
  if (viewState === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Memuat...</p>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding state
  if (viewState === "onboarding") {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader />
        <main className="pt-24 pb-12 px-4">
          <div className="max-w-3xl mx-auto">
            <TopicSelector
              selectedTopics={user.podcastPreferences?.selectedTopics ?? []}
              onTopicsChange={updatePodcastTopics}
              onComplete={handleTopicsComplete}
              isOnboarding={true}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Topic editor
  if (showTopicEditor) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader />
        <main className="pt-24 pb-12 px-4">
          <div className="max-w-3xl mx-auto">
            <TopicSelector
              selectedTopics={user.podcastPreferences?.selectedTopics ?? []}
              onTopicsChange={updatePodcastTopics}
              onComplete={handleTopicsComplete}
              isOnboarding={false}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // History view
  if (viewState === "history") {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader />
        <main className="pt-24 pb-12 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center border border-sky-200">
                <span className="text-4xl">📚</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Riwayat Podcast</h1>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Dengarkan kembali podcast sebelumnya
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-xl border border-stone-200 bg-white">
              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setHistoryTab("all")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    historyTab === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Semua ({history.length})
                </button>
                <button
                  onClick={() => setHistoryTab("saved")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    historyTab === "saved"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <svg className="w-4 h-4" fill={historyTab === "saved" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Tersimpan ({history.filter(p => p.isSaved).length})
                </button>
              </div>

              <button
                onClick={() => setViewState("dashboard")}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-stone-200 hover:bg-slate-50 rounded-lg transition-colors"
              >
                ← Kembali
              </button>
            </div>

            {/* History List */}
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-stone-200 bg-white">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                  <span className="text-3xl">{historyTab === "saved" ? "⭐" : "🎙️"}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  {historyTab === "saved" ? "Belum ada podcast tersimpan" : "Belum ada riwayat"}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  {historyTab === "saved" 
                    ? "Simpan podcast favorit Anda untuk didengarkan nanti" 
                    : "Mulai buat podcast harian pertama Anda"
                  }
                </p>
                <button
                  onClick={() => setViewState("dashboard")}
                  className="px-6 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-medium rounded-lg transition-colors"
                >
                  {historyTab === "saved" ? "Lihat Semua Podcast" : "Buat Podcast Baru"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((podcast) => (
                  <HistoryItem
                    key={podcast.id}
                    podcast={podcast}
                    onPlay={() => playFromHistory(podcast)}
                    onToggleSave={() => toggleSavePodcast(podcast.id)}
                    onDelete={() => deletePodcastFromHistory(podcast.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Dashboard state
  if (viewState === "dashboard") {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader />
        <main className="pt-24 pb-12 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center border border-sky-200">
                <span className="text-4xl">🎙️</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Podcast Harian</h1>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Renungan Al-Quran yang dipersonalisasi untuk kehidupan sehari-hari Anda.
              </p>
            </div>

            {/* Main Action Card */}
            <div className="p-6 rounded-2xl border border-stone-200 bg-white mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-slate-900">Topik Anda</h2>
                  <p className="text-xs text-slate-500">Konten akan disesuaikan dengan topik ini</p>
                </div>
                <button
                  onClick={() => setShowTopicEditor(true)}
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                  Ubah
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {(user.podcastPreferences?.selectedTopics ?? []).map((topicId) => (
                  <span
                    key={topicId}
                    className="px-3 py-1.5 bg-sky-50 text-[#496580] rounded-md text-sm font-medium"
                  >
                    {topicId.charAt(0).toUpperCase() + topicId.slice(1)}
                  </span>
                ))}
              </div>

              <button
                onClick={generatePodcast}
                className="w-full px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Buat Podcast Hari Ini
              </button>

              <p className="text-xs text-slate-400 text-center mt-3">
                Durasi ± 5-7 menit • Powered by AI
              </p>
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Podcast Terbaru</h2>
                  <button
                    onClick={() => setViewState("history")}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Lihat Semua →
                  </button>
                </div>
                <div className="space-y-3">
                  {history.slice(0, 3).map((podcast) => (
                    <HistoryItem
                      key={podcast.id}
                      podcast={podcast}
                      onPlay={() => playFromHistory(podcast)}
                      onToggleSave={() => toggleSavePodcast(podcast.id)}
                      onDelete={() => deletePodcastFromHistory(podcast.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-stone-200 bg-white">
                <div className="w-10 h-10 rounded-md flex items-center justify-center mb-4 bg-sky-50">
                  <span className="text-xl">📖</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Berbasis Al-Quran</h3>
                <p className="text-sm text-slate-600">Setiap episode mengambil hikmah dari ayat-ayat Al-Quran yang relevan.</p>
              </div>
              <div className="p-5 rounded-xl border border-stone-200 bg-white">
                <div className="w-10 h-10 rounded-md flex items-center justify-center mb-4 bg-sky-50">
                  <span className="text-xl">🎧</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Suara AI Natural</h3>
                <p className="text-sm text-slate-600">Narasi hangat dan menenangkan menggunakan teknologi Gemini TTS.</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Generating state
  if (viewState === "generating") {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader />
        <main className="pt-24 pb-12 px-4 flex items-center justify-center min-h-[70vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center border border-sky-200">
              <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Menyiapkan Renungan</h2>
            <p className="text-slate-600 mb-4">{generationStep}</p>
            <div className="w-full max-w-xs mx-auto h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '70%' }} />
            </div>
            <p className="text-xs text-slate-400 mt-6">
              Sebentar lagi selesai... ⏳
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (viewState === "error") {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader />
        <main className="pt-24 pb-12 px-4 flex items-center justify-center min-h-[70vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <span className="text-4xl">😔</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Terjadi Kesalahan</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={generatePodcast}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
              >
                Coba Lagi
              </button>
              <Link
                href="/"
                className="px-6 py-2.5 border border-stone-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Kembali
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Playing state
  if (viewState === "playing" && podcastData && audioData) {
    const hasAudio = (audioData.audio || audioData.audioUrl) && !audioData.scriptOnly;
    const isSaved = currentPodcastId ? history.find(p => p.id === currentPodcastId)?.isSaved : false;
    
    return (
      <div className="min-h-screen bg-white">
        <PageHeader />

        <main className="pt-24 pb-12 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Audio Player or Processing/Script-Only View */}
            {hasAudio ? (
              <AudioPlayer
                audioData={audioData.audio}
                audioUrl={audioData.audioUrl}
                mimeType={audioData.mimeType}
                title={podcastData.title}
                verseKey={podcastData.verse.verseKey}
              />
            ) : isAudioProcessing ? (
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center border border-sky-200">
                  <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{podcastData.title}</h3>
                <p className="text-sm text-sky-700 mb-2">Audio sedang diproses...</p>
                <p className="text-xs text-slate-500 mb-4">
                  Biasanya 1-2 menit. Anda bisa membaca naskah dulu atau jelajahi aplikasi.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-sky-600">
                  <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                  <span>Kami akan memberi tahu saat selesai</span>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center border border-amber-200">
                  <span className="text-4xl">📖</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{podcastData.title}</h3>
                <p className="text-sm text-amber-700 mb-4">Mode Baca - Audio tidak tersedia</p>
                <p className="text-xs text-slate-500">{audioData.message}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 mt-6">
              {currentPodcastId && (
                <button
                  onClick={() => toggleSavePodcast(currentPodcastId)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                    isSaved
                      ? "bg-amber-100 text-amber-700 border border-amber-300"
                      : "bg-slate-100 text-slate-600 border border-stone-200 hover:bg-slate-200"
                  }`}
                >
                  <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {isSaved ? "Tersimpan" : "Simpan"}
                </button>
              )}
              {/* Only show script button if we have script data */}
              {podcastData.script && (
                <button
                  onClick={() => setShowScript(!showScript)}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-slate-100 text-slate-600 border border-stone-200 hover:bg-slate-200 transition-colors"
                >
                  {showScript ? "Sembunyikan Naskah" : "Lihat Naskah"}
                </button>
              )}
            </div>

            {/* Verse Card - only show if we have verse data */}
            {podcastData.verse.arabic && (
              <div className="mt-8 bg-sky-50 border border-sky-200 rounded-xl p-6">
                <p className="text-[#496580] text-sm font-medium mb-3">
                  QS. {podcastData.verse.verseKey}
                </p>
                <p 
                  className="text-2xl text-slate-900 mb-4 leading-relaxed text-right"
                  dir="rtl"
                  lang="ar"
                  style={{ fontFamily: '"Scheherazade New", serif' }}
                >
                  {podcastData.verse.arabic}
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {podcastData.verse.translation}
                </p>
              </div>
            )}

            {/* Minimal info card when playing from history */}
            {!podcastData.verse.arabic && (
              <div className="mt-8 bg-slate-50 border border-stone-200 rounded-xl p-6 text-center">
                <p className="text-[#496580] text-sm font-medium">
                  QS. {podcastData.verse.verseKey}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Memutar dari riwayat
                </p>
              </div>
            )}

            {/* Script Panel - only show if we have script data */}
            {podcastData.script && (showScript || !hasAudio) && (
              <div className="mt-6 bg-slate-50 border border-stone-200 rounded-xl p-6 max-h-[32rem] overflow-y-auto">
                <h4 className="text-sm font-semibold text-[#496580] mb-4">
                  {hasAudio ? "Naskah Podcast" : "Renungan Hari Ini"}
                </h4>
                <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {podcastData.script}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => {
                  setPodcastData(null);
                  setAudioData(null);
                  setSelectedHistoryPodcast(null);
                  setCurrentPodcastId(null);
                  setViewState("dashboard");
                }}
                className="px-6 py-2.5 border border-stone-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Buat Baru
              </button>
              <button
                onClick={() => {
                  setPodcastData(null);
                  setAudioData(null);
                  setSelectedHistoryPodcast(null);
                  setViewState("history");
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
              >
                Lihat Riwayat
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-white">
      <PageHeader />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <AudioPlayerSkeleton />
        </div>
      </main>
    </div>
  );
}
