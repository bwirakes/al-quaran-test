"use client";

import { useState } from "react";
import { PODCAST_TOPICS, type PodcastTopicId } from "@/stores/user-store";

interface TopicSelectorProps {
  selectedTopics: PodcastTopicId[];
  onTopicsChange: (topics: PodcastTopicId[]) => void;
  onComplete: () => void;
  isOnboarding?: boolean;
}

export function TopicSelector({ 
  selectedTopics, 
  onTopicsChange, 
  onComplete,
  isOnboarding = false 
}: TopicSelectorProps) {
  const [localSelection, setLocalSelection] = useState<PodcastTopicId[]>(selectedTopics);

  const toggleTopic = (topicId: PodcastTopicId) => {
    setLocalSelection((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((t) => t !== topicId);
      }
      return [...prev, topicId];
    });
  };

  const handleConfirm = () => {
    onTopicsChange(localSelection);
    onComplete();
  };

  return (
    <div className="w-full">
      {isOnboarding && (
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center border border-sky-200">
            <span className="text-4xl">🎙️</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Podcast Harian Islami
          </h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Pilih topik yang ingin Anda dengarkan setiap hari.
            Kami akan menyiapkan renungan Al-Quran yang relevan untuk Anda.
          </p>
        </div>
      )}

      {!isOnboarding && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Ubah Topik</h2>
          <p className="text-sm text-slate-500">Pilih topik untuk podcast harian Anda</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {PODCAST_TOPICS.map((topic) => {
          const isSelected = localSelection.includes(topic.id);
          return (
            <button
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className={`
                group relative p-4 rounded-xl border transition-all duration-200 text-left
                ${isSelected 
                  ? "border-sky-300 bg-sky-50" 
                  : "border-stone-200 bg-white hover:border-sky-300 hover:bg-sky-50"
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="w-10 h-10 rounded-md flex items-center justify-center mb-3 bg-sky-50 group-hover:bg-sky-100 transition-colors">
                <span className="text-xl">{topic.icon}</span>
              </div>
              <div className="font-semibold text-slate-900 text-sm mb-0.5">{topic.label}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{topic.description}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleConfirm}
          disabled={localSelection.length === 0}
          className={`
            w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white
            transition-all duration-200
            ${localSelection.length > 0
              ? "bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700"
              : "bg-slate-300 cursor-not-allowed"
            }
          `}
        >
          {localSelection.length === 0 
            ? "Pilih minimal 1 topik" 
            : isOnboarding 
              ? `Mulai dengan ${localSelection.length} topik`
              : `Simpan ${localSelection.length} topik`
          }
        </button>
        
        {!isOnboarding && (
          <button
            onClick={onComplete}
            className="px-6 py-3 text-sm text-slate-500 hover:text-slate-700 font-medium"
          >
            Batal
          </button>
        )}
      </div>

      {isOnboarding && localSelection.length > 0 && (
        <p className="text-center text-xs text-slate-400 mt-4">
          Anda dapat mengubah topik kapan saja
        </p>
      )}
    </div>
  );
}
