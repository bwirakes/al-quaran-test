"use client";

import { useEffect, useState, useCallback } from "react";
import { MapPin, RefreshCw, Sun, Moon, Sunrise, Sunset } from "lucide-react";

// Prayer names in Indonesian
const PRAYER_NAMES: Record<string, string> = {
  Fajr: "Subuh",
  Sunrise: "Syuruq",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya",
};

// Icons for each prayer
const PRAYER_ICONS: Record<string, typeof Sun> = {
  Fajr: Moon,
  Sunrise: Sunrise,
  Dhuhr: Sun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
};

// Hijri month names
const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Sya'ban",
  "Ramadhan",
  "Syawal",
  "Dzulqa'dah",
  "Dzulhijjah",
];

// Day names in Indonesian
const DAY_NAMES = [
  "Ahad",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jum'at",
  "Sabtu",
];

const STORAGE_KEY = "quran_app_prayer_times";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

// Royal Blue accent color
const ACCENT_COLOR = "#496580";

interface PrayerTimesData {
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  date: {
    hijri: {
      day: string;
      month: {
        number: number;
        en: string;
      };
      year: string;
    };
  };
}

interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface CachedData {
  prayerTimes: PrayerTimesData;
  location: LocationData;
  cachedAt: number;
  cachedDate: string; // Store the date to invalidate on day change
}

// Get today's date string for cache invalidation
const getTodayDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

// Check if cache is valid
const isCacheValid = (cached: CachedData | null): cached is CachedData => {
  if (!cached) return false;
  
  const now = Date.now();
  const isExpired = now - cached.cachedAt > CACHE_DURATION_MS;
  const isDifferentDay = cached.cachedDate !== getTodayDateString();
  
  return !isExpired && !isDifferentDay;
};

// Load cached data from localStorage
const loadCachedData = (): CachedData | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as CachedData;
  } catch {
    return null;
  }
};

// Save data to localStorage
const saveCachedData = (prayerTimes: PrayerTimesData, location: LocationData) => {
  if (typeof window === "undefined") return;
  
  try {
    const data: CachedData = {
      prayerTimes,
      location,
      cachedAt: Date.now(),
      cachedDate: getTodayDateString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail if localStorage is not available
  }
};

export function PrayerTimesSection() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get city name from coordinates
  const getCityFromCoords = useCallback(async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      return (
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        "Unknown Location"
      );
    } catch {
      return "Unknown Location";
    }
  }, []);

  // Fetch prayer times from Aladhan API
  const fetchPrayerTimes = useCallback(async (lat: number, lon: number): Promise<PrayerTimesData | null> => {
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=20`
      );
      const data = await response.json();
      if (data.code === 200) {
        return data.data;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  // Initialize data - check cache first, then fetch if needed
  useEffect(() => {
    const initializeData = async () => {
      // Try to load from cache first
      const cached = loadCachedData();
      
      if (isCacheValid(cached)) {
        // Use cached data
        setPrayerTimes(cached.prayerTimes);
        setLocation(cached.location);
        setLoading(false);
        return;
      }

      // No valid cache, fetch fresh data
      setLoading(true);

      if (!navigator.geolocation) {
        // Default to Jakarta
        const defaultLat = -6.2088;
        const defaultLon = 106.8456;
        const locationData: LocationData = {
          city: "Jakarta",
          country: "Indonesia",
          latitude: defaultLat,
          longitude: defaultLon,
        };
        const times = await fetchPrayerTimes(defaultLat, defaultLon);
        if (times) {
          setPrayerTimes(times);
          setLocation(locationData);
          saveCachedData(times, locationData);
        }
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const city = await getCityFromCoords(latitude, longitude);
          const locationData: LocationData = {
            city,
            country: "Indonesia",
            latitude,
            longitude,
          };
          const times = await fetchPrayerTimes(latitude, longitude);
          if (times) {
            setPrayerTimes(times);
            setLocation(locationData);
            saveCachedData(times, locationData);
          }
          setLoading(false);
        },
        async () => {
          // Default to Jakarta if geolocation fails
          const defaultLat = -6.2088;
          const defaultLon = 106.8456;
          const locationData: LocationData = {
            city: "Jakarta",
            country: "Indonesia",
            latitude: defaultLat,
            longitude: defaultLon,
          };
          const times = await fetchPrayerTimes(defaultLat, defaultLon);
          if (times) {
            setPrayerTimes(times);
            setLocation(locationData);
            saveCachedData(times, locationData);
          }
          setLoading(false);
        }
      );
    };

    initializeData();
  }, [fetchPrayerTimes, getCityFromCoords]);

  // Parse time string to Date object
  const parseTimeString = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Get current and next prayer
  const getCurrentAndNextPrayer = (): {
    current: string;
    next: string;
    nextTime: string;
    timeUntilNext: string;
  } => {
    if (!prayerTimes)
      return {
        current: "Fajr",
        next: "Dhuhr",
        nextTime: "00:00",
        timeUntilNext: "--:--",
      };

    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const now = currentTime;

    for (let i = 0; i < prayers.length; i++) {
      const prayerName = prayers[i];
      const prayerTime = parseTimeString(
        prayerTimes.timings[prayerName as keyof typeof prayerTimes.timings]
      );

      if (now < prayerTime) {
        const prevPrayer = i === 0 ? "Isha" : prayers[i - 1];
        const diff = prayerTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const timeUntil =
          hours > 0 ? `${hours}j ${minutes}m` : `${minutes} menit`;

        return {
          current: prevPrayer,
          next: prayerName,
          nextTime:
            prayerTimes.timings[prayerName as keyof typeof prayerTimes.timings],
          timeUntilNext: timeUntil,
        };
      }
    }

    // After Isha, next is Fajr tomorrow
    return {
      current: "Isha",
      next: "Fajr",
      nextTime: prayerTimes.timings.Fajr,
      timeUntilNext: "Besok",
    };
  };

  const { next: nextPrayer, nextTime, timeUntilNext } = getCurrentAndNextPrayer();

  // Get Hijri date string
  const getHijriDate = (): string => {
    if (!prayerTimes) return "";
    const { hijri } = prayerTimes.date;
    const dayIndex = currentTime.getDay();
    const dayName = DAY_NAMES[dayIndex];
    const monthName = HIJRI_MONTHS[hijri.month.number - 1] || hijri.month.en;
    return `${dayName}, ${hijri.day} ${monthName} ${hijri.year} H`;
  };

  // Get prayer times list for display
  const getPrayersList = () => {
    if (!prayerTimes) return [];
    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    return prayers.map((prayer) => ({
      name: prayer,
      displayName: PRAYER_NAMES[prayer],
      time: prayerTimes.timings[prayer as keyof typeof prayerTimes.timings].split(" ")[0],
      isNext: prayer === nextPrayer,
      isPast: parseTimeString(prayerTimes.timings[prayer as keyof typeof prayerTimes.timings]) < currentTime,
      Icon: PRAYER_ICONS[prayer],
    }));
  };

  if (loading) {
    return (
      <div className="border border-stone-200 rounded-xl p-6 bg-white">
        <div className="flex items-center justify-center gap-3 py-8">
          <RefreshCw className="w-5 h-5 animate-spin" style={{ color: ACCENT_COLOR }} />
          <p className="text-slate-500 text-sm">Mengambil jadwal sholat...</p>
        </div>
      </div>
    );
  }

  if (!prayerTimes || !location) {
    return null;
  }

  const NextIcon = PRAYER_ICONS[nextPrayer];

  return (
    <div className="space-y-4">
      {/* Header with date and location */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-widest">
          Waktu Sholat
        </p>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <MapPin className="w-3 h-3" />
          <span>{location.city}</span>
        </div>
      </div>

      {/* Next Prayer Highlight - Royal Blue accent */}
      <div className="border border-stone-200 rounded-xl p-5 bg-sky-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              <NextIcon className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Sholat berikutnya</p>
              <p className="text-xl font-semibold text-slate-900">
                {PRAYER_NAMES[nextPrayer]}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              {nextTime.split(" ")[0]}
            </p>
            <p className="text-xs text-slate-500">
              dalam {timeUntilNext}
            </p>
          </div>
        </div>
      </div>

      {/* All Prayer Times Grid - Royal Blue accent */}
      <div className="grid grid-cols-5 gap-2">
        {getPrayersList().map((prayer) => (
          <div
            key={prayer.name}
            className={`
              p-3 rounded-lg text-center transition-all border
              ${prayer.isNext 
                ? 'border-transparent' 
                : prayer.isPast 
                  ? 'bg-white border-stone-100 opacity-50' 
                  : 'bg-white border-stone-200 hover:border-sky-300'}
            `}
            style={prayer.isNext ? { backgroundColor: ACCENT_COLOR } : undefined}
          >
            <prayer.Icon 
              className={`w-4 h-4 mx-auto mb-1.5 ${prayer.isNext ? 'text-white' : 'text-slate-400'}`} 
              strokeWidth={1.5} 
            />
            <p className={`text-xs mb-0.5 ${prayer.isNext ? 'text-sky-100' : 'text-slate-500'}`}>
              {prayer.displayName}
            </p>
            <p className={`text-sm font-semibold tabular-nums ${prayer.isNext ? 'text-white' : 'text-slate-900'}`}>
              {prayer.time}
            </p>
          </div>
        ))}
      </div>

      {/* Hijri Date */}
      <p className="text-center text-xs text-slate-400">
        {getHijriDate()}
      </p>
    </div>
  );
}
