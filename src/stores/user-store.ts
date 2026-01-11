"use client";

/**
 * User Store
 * 
 * Client-side state management for user gamification data.
 * Uses localStorage for persistence until proper auth is implemented.
 */

import { useEffect, useState, useCallback } from "react";
import type { Resources, UserStreaks } from "@/lib/gamification/types";

// Demo user ID for development
const DEMO_USER_ID = "demo-user-001";

// Available podcast topics
export const PODCAST_TOPICS = [
  { id: "akhlak", label: "Akhlak", description: "Budi pekerti & moral", icon: "💎" },
  { id: "ibadah", label: "Ibadah", description: "Panduan ibadah", icon: "🕌" },
  { id: "keluarga", label: "Keluarga", description: "Kehidupan keluarga", icon: "👨‍👩‍👧‍👦" },
  { id: "pekerjaan", label: "Pekerjaan", description: "Karir & rezeki", icon: "💼" },
  { id: "kesehatan", label: "Kesehatan", description: "Jasmani & rohani", icon: "🌿" },
  { id: "sabar", label: "Sabar", description: "Kesabaran & keteguhan", icon: "🏔️" },
  { id: "syukur", label: "Syukur", description: "Rasa syukur", icon: "🤲" },
  { id: "taubat", label: "Taubat", description: "Tobat & ampunan", icon: "✨" },
] as const;

export type PodcastTopicId = typeof PODCAST_TOPICS[number]["id"];

// Saved podcast entry - minimal data to avoid localStorage quota issues
export interface SavedPodcast {
  id: string;
  title: string;
  topic: string;
  verseKey: string;
  audioUrl: string | null;
  duration: number;
  createdAt: string;
  isSaved: boolean;
}

export interface PodcastPreferences {
  selectedTopics: PodcastTopicId[];
  hasCompletedOnboarding: boolean;
  lastGeneratedDate: string | null;
  // Only store URL reference, not full data
  cachedPodcast: {
    date: string;
    audioUrl: string | null;
    title: string;
    verseKey: string;
    topic: string;
  } | null;
  history: SavedPodcast[]; // Keep last 10 podcasts
}

export interface UserState {
  id: string;
  name: string;
  email: string;
  level: number;
  totalXp: number;
  inventory: Resources;
  streak: {
    current: number;
    longest: number;
    lastActive: string | null;
  };
  podcastPreferences: PodcastPreferences;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_STATE: UserState = {
  id: DEMO_USER_ID,
  name: "Pelajar Quran",
  email: "demo@example.com",
  level: 1,
  totalXp: 0,
  inventory: {
    seeds: 50,
    water: 30,
    sunlight: 10,
  },
  streak: {
    current: 0,
    longest: 0,
    lastActive: null,
  },
  podcastPreferences: {
    selectedTopics: [],
    hasCompletedOnboarding: false,
    lastGeneratedDate: null,
    cachedPodcast: null,
    history: [],
  },
  isLoading: true,
  error: null,
};

// Custom hook for user state
export function useUserStore() {
  const [user, setUser] = useState<UserState>(DEFAULT_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("quran-app-user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const merged: UserState = {
          ...DEFAULT_STATE,
          ...parsed,
          inventory: { ...DEFAULT_STATE.inventory, ...parsed.inventory },
          streak: { ...DEFAULT_STATE.streak, ...parsed.streak },
          podcastPreferences: { 
            ...DEFAULT_STATE.podcastPreferences, 
            ...parsed.podcastPreferences,
            history: parsed.podcastPreferences?.history || [],
          },
          isLoading: false,
          error: null,
        };
        setUser(merged);
      } catch {
        setUser({ ...DEFAULT_STATE, isLoading: false });
      }
    } else {
      localStorage.setItem("quran-app-user", JSON.stringify(DEFAULT_STATE));
      setUser({ ...DEFAULT_STATE, isLoading: false });
    }
  }, []);

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (!user.isLoading) {
      localStorage.setItem("quran-app-user", JSON.stringify(user));
    }
  }, [user]);

  // Update inventory
  const updateInventory = useCallback((changes: Partial<Resources>) => {
    setUser((prev) => ({
      ...prev,
      inventory: {
        seeds: prev.inventory.seeds + (changes.seeds || 0),
        water: prev.inventory.water + (changes.water || 0),
        sunlight: prev.inventory.sunlight + (changes.sunlight || 0),
      },
    }));
  }, []);

  // Add XP and update level
  const addXp = useCallback((amount: number) => {
    setUser((prev) => {
      const newXp = prev.totalXp + amount;
      const newLevel = Math.floor(Math.sqrt(newXp) / 10) + 1;
      return {
        ...prev,
        totalXp: newXp,
        level: newLevel,
      };
    });
  }, []);

  // Update streak
  const updateStreak = useCallback((newStreak: number) => {
    setUser((prev) => ({
      ...prev,
      streak: {
        current: newStreak,
        longest: Math.max(prev.streak.longest, newStreak),
        lastActive: new Date().toISOString().split("T")[0],
      },
    }));
  }, []);

  // Reset user (for testing)
  const resetUser = useCallback(() => {
    localStorage.removeItem("quran-app-user");
    setUser({ ...DEFAULT_STATE, isLoading: false });
  }, []);

  // Update podcast topics
  const updatePodcastTopics = useCallback((topics: PodcastTopicId[]) => {
    setUser((prev) => ({
      ...prev,
      podcastPreferences: {
        ...prev.podcastPreferences,
        selectedTopics: topics,
        hasCompletedOnboarding: true,
      },
    }));
  }, []);

  // Cache generated podcast - only store minimal metadata
  const cachePodcast = useCallback((metadata: { title: string; verseKey: string; topic: string; audioUrl: string | null }) => {
    const today = new Date().toISOString().split("T")[0];
    setUser((prev) => ({
      ...prev,
      podcastPreferences: {
        ...prev.podcastPreferences,
        lastGeneratedDate: today,
        cachedPodcast: {
          date: today,
          ...metadata,
        },
      },
    }));
  }, []);

  // Clear cached podcast
  const clearCachedPodcast = useCallback(() => {
    setUser((prev) => ({
      ...prev,
      podcastPreferences: {
        ...prev.podcastPreferences,
        cachedPodcast: null,
      },
    }));
  }, []);

  // Add podcast to history - keep only last 10 to save localStorage space
  const addPodcastToHistory = useCallback((podcast: Omit<SavedPodcast, "id" | "createdAt" | "isSaved">) => {
    const newPodcast: SavedPodcast = {
      ...podcast,
      id: `podcast-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isSaved: false,
    };
    
    setUser((prev) => ({
      ...prev,
      podcastPreferences: {
        ...prev.podcastPreferences,
        history: [newPodcast, ...prev.podcastPreferences.history].slice(0, 10), // Keep last 10
      },
    }));
    
    return newPodcast.id;
  }, []);

  // Toggle save status for a podcast
  const toggleSavePodcast = useCallback((podcastId: string) => {
    setUser((prev) => ({
      ...prev,
      podcastPreferences: {
        ...prev.podcastPreferences,
        history: prev.podcastPreferences.history.map((p) =>
          p.id === podcastId ? { ...p, isSaved: !p.isSaved } : p
        ),
      },
    }));
  }, []);

  // Delete podcast from history
  const deletePodcastFromHistory = useCallback((podcastId: string) => {
    setUser((prev) => ({
      ...prev,
      podcastPreferences: {
        ...prev.podcastPreferences,
        history: prev.podcastPreferences.history.filter((p) => p.id !== podcastId),
      },
    }));
  }, []);

  // Get saved podcasts only
  const getSavedPodcasts = useCallback(() => {
    return user.podcastPreferences.history.filter((p) => p.isSaved);
  }, [user.podcastPreferences.history]);

  return {
    user,
    updateInventory,
    addXp,
    updateStreak,
    resetUser,
    updatePodcastTopics,
    cachePodcast,
    clearCachedPodcast,
    addPodcastToHistory,
    toggleSavePodcast,
    deletePodcastFromHistory,
    getSavedPodcasts,
  };
}
