"use client";

import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  audioData?: string | null;
  audioUrl?: string | null;
  mimeType?: string | null;
  title: string;
  verseKey?: string;
  onEnded?: () => void;
}

export function AudioPlayer({ 
  audioData, 
  audioUrl: propAudioUrl,
  mimeType, 
  title, 
  verseKey,
  onEnded 
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);

  const audioSrc = propAudioUrl || (audioData && mimeType ? `data:${mimeType};base64,${audioData}` : null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsBuffering(false);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
      setIsLoading(false);
    };

    const handleError = () => {
      setError("Gagal memuat audio. Coba lagi nanti.");
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0 && audio.duration > 0) {
        const buffered = audio.buffered.end(audio.buffered.length - 1);
        setLoadProgress((buffered / audio.duration) * 100);
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("error", handleError);
    audio.addEventListener("progress", handleProgress);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("progress", handleProgress);
    };
  }, [onEnded]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    setError(null);

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Play error:", err);
        setError("Gagal memutar audio");
        setIsLoading(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      <audio ref={audioRef} src={audioSrc || undefined} preload="metadata" />

      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center border border-sky-200">
            <span className="text-5xl">🎙️</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">{title}</h3>
          {verseKey && (
            <p className="text-sm text-[#496580]">QS. {verseKey}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            {/* Buffer progress (lighter) */}
            <div 
              className="absolute h-full bg-slate-200 rounded-full transition-all"
              style={{ width: `${loadProgress}%` }}
            />
            {/* Playback progress */}
            <div 
              className="absolute h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              disabled={isLoading || isBuffering}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : "Loading..."}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          {/* Skip Back */}
          <button
            onClick={() => skipTime(-10)}
            disabled={isLoading || isBuffering || !duration}
            className="w-12 h-12 rounded-full bg-slate-100 border border-stone-200 hover:bg-slate-200 flex items-center justify-center transition-colors disabled:opacity-50"
            title="Mundur 10 detik"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            disabled={!audioSrc}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading || isBuffering ? (
              <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : isPlaying ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Skip Forward */}
          <button
            onClick={() => skipTime(10)}
            disabled={isLoading || isBuffering || !duration}
            className="w-12 h-12 rounded-full bg-slate-100 border border-stone-200 hover:bg-slate-200 flex items-center justify-center transition-colors disabled:opacity-50"
            title="Maju 10 detik"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>

        {/* Status & Info */}
        <div className="text-center mt-6">
          {(isLoading || isBuffering) && (
            <p className="text-xs text-sky-600 mb-2 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
              {isBuffering ? "Buffering audio..." : "Memuat audio..."}
            </p>
          )}
          <div className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {duration > 0 ? formatTime(duration) : "--:--"}
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-xs text-slate-500">AI Generated</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AudioPlayerSkeleton() {
  return (
    <div className="w-full">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 animate-pulse">
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-slate-100" />
          <div className="h-6 w-48 bg-slate-100 rounded mx-auto mb-2" />
          <div className="h-4 w-24 bg-slate-100 rounded mx-auto" />
        </div>
        <div className="h-2 bg-slate-100 rounded-full mb-8" />
        <div className="flex items-center justify-center gap-6">
          <div className="w-12 h-12 rounded-full bg-slate-100" />
          <div className="w-16 h-16 rounded-full bg-slate-100" />
          <div className="w-12 h-12 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
