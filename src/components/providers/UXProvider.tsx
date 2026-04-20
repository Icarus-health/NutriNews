'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';

type TextSize = 'small' | 'medium' | 'large';
type Theme = 'light' | 'dark' | 'system';

interface DarkSchedule {
  enabled: boolean;
  fromHour: number; // 0-23
  toHour: number;   // 0-23
}

interface ReadHistoryEntry {
  cardId: string;
  headline: string;
  category: string;
  timestamp: number;
}

interface UXSettings {
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
  darkSchedule: DarkSchedule;
  setDarkSchedule: (s: DarkSchedule) => void;
  textSize: TextSize;
  setTextSize: (s: TextSize) => void;
  readHistory: ReadHistoryEntry[];
  markAsRead: (cardId: string, headline: string, category: string) => void;
  weeklyStats: { count: number; topCategories: string[] };
  searchHistory: string[];
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
  readLaterQueue: string[];
  toggleReadLater: (cardId: string) => void;
  isInReadLater: (cardId: string) => boolean;
  streak: { days: number; lastReadDate: string | null };
  isNewCard: (publishedAt: string | null) => boolean;
  hiddenCards: string[];
  hideCard: (cardId: string) => void;
  isHidden: (cardId: string) => boolean;
}

const UXContext = createContext<UXSettings | null>(null);

export function useUX(): UXSettings {
  const ctx = useContext(UXContext);
  if (!ctx) throw new Error('useUX must be used within UXProvider');
  return ctx;
}

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function setStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded */ }
}

function isDarkBySchedule(hour: number, s: DarkSchedule): boolean {
  if (!s.enabled) return false;
  // Overnight schedule (e.g. 20-7): active when hour >= 20 OR hour < 7
  if (s.fromHour > s.toHour) return hour >= s.fromHour || hour < s.toHour;
  return hour >= s.fromHour && hour < s.toHour;
}

export default function UXProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [darkSchedule, setDarkScheduleState] = useState<DarkSchedule>({ enabled: false, fromHour: 20, toHour: 7 });
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [textSize, setTextSizeState] = useState<TextSize>('medium');
  const [readHistory, setReadHistory] = useState<ReadHistoryEntry[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [readLaterQueue, setReadLaterQueue] = useState<string[]>([]);
  const [streakData, setStreakData] = useState<{ days: number; lastReadDate: string | null }>({ days: 0, lastReadDate: null });
  const [hiddenCards, setHiddenCards] = useState<string[]>([]);
  const [systemDark, setSystemDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastVisitTime, setLastVisitTime] = useState<number>(0);

  useEffect(() => {
    setThemeState(getStored('nn-theme', 'light'));
    setDarkScheduleState(getStored('nn-dark-schedule', { enabled: false, fromHour: 20, toHour: 7 }));
    setTextSizeState(getStored('nn-text-size', 'medium'));
    setReadHistory(getStored('nn-read-history', []));
    setSearchHistory(getStored('nn-search-history', []));
    setReadLaterQueue(getStored('nn-read-later', []));
    setStreakData(getStored('nn-streak', { days: 0, lastReadDate: null }));
    setHiddenCards(getStored('nn-hidden-cards', []));

    const stored = localStorage.getItem('nn-last-visit-end');
    setLastVisitTime(stored ? parseInt(stored, 10) : Date.now() - 24 * 60 * 60 * 1000);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    setMounted(true);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Update current hour every minute for dark schedule
  useEffect(() => {
    const interval = setInterval(() => setCurrentHour(new Date().getHours()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Save visit end time when user leaves
  useEffect(() => {
    const save = () => localStorage.setItem('nn-last-visit-end', Date.now().toString());
    window.addEventListener('pagehide', save);
    window.addEventListener('beforeunload', save);
    return () => {
      window.removeEventListener('pagehide', save);
      window.removeEventListener('beforeunload', save);
    };
  }, []);

  const isDark = theme === 'dark'
    || (theme === 'system' && systemDark)
    || isDarkBySchedule(currentHour, darkSchedule);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const sizes = { small: '0.9', medium: '1', large: '1.15' };
    document.documentElement.style.setProperty('--text-scale', sizes[textSize]);
  }, [textSize, mounted]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    setStored('nn-theme', t);
  }, []);

  const setDarkSchedule = useCallback((s: DarkSchedule) => {
    setDarkScheduleState(s);
    setStored('nn-dark-schedule', s);
  }, []);

  const setTextSize = useCallback((s: TextSize) => {
    setTextSizeState(s);
    setStored('nn-text-size', s);
  }, []);

  const markAsRead = useCallback((cardId: string, headline: string, category: string) => {
    setReadHistory(prev => {
      if (prev.some(e => e.cardId === cardId)) return prev;
      const next = [{ cardId, headline, category, timestamp: Date.now() }, ...prev].slice(0, 200);
      setStored('nn-read-history', next);
      return next;
    });
    setStreakData(prev => {
      const today = new Date().toISOString().split('T')[0];
      if (prev.lastReadDate === today) return prev;
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const newDays = prev.lastReadDate === yesterday ? prev.days + 1 : 1;
      const next = { days: newDays, lastReadDate: today };
      setStored('nn-streak', next);
      return next;
    });
  }, []);

  const addSearchQuery = useCallback((query: string) => {
    if (!query.trim()) return;
    setSearchHistory(prev => {
      const next = [query.trim(), ...prev.filter(q => q !== query.trim())].slice(0, 5);
      setStored('nn-search-history', next);
      return next;
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    setStored('nn-search-history', []);
  }, []);

  const toggleReadLater = useCallback((cardId: string) => {
    setReadLaterQueue(prev => {
      const next = prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId];
      setStored('nn-read-later', next);
      return next;
    });
  }, []);

  const readLaterSet = useMemo(() => new Set(readLaterQueue), [readLaterQueue]);
  const isInReadLater = useCallback((cardId: string) => readLaterSet.has(cardId), [readLaterSet]);

  const hideCard = useCallback((cardId: string) => {
    setHiddenCards(prev => {
      if (prev.includes(cardId)) return prev;
      const next = [cardId, ...prev].slice(0, 500);
      setStored('nn-hidden-cards', next);
      return next;
    });
  }, []);

  const hiddenSet = useMemo(() => new Set(hiddenCards), [hiddenCards]);
  const isHidden = useCallback((cardId: string) => hiddenSet.has(cardId), [hiddenSet]);

  const isNewCard = useCallback((publishedAt: string | null) => {
    if (!publishedAt || lastVisitTime === 0) return false;
    return new Date(publishedAt).getTime() > lastVisitTime;
  }, [lastVisitTime]);

  const weeklyStats = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = readHistory.filter(e => e.timestamp >= oneWeekAgo);
    const catCounts: Record<string, number> = {};
    thisWeek.forEach(e => { catCounts[e.category] = (catCounts[e.category] ?? 0) + 1; });
    const topCategories = Object.entries(catCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);
    return { count: thisWeek.length, topCategories };
  }, [readHistory]);

  const ctxValue = useMemo(() => ({
    theme, setTheme, isDark,
    darkSchedule, setDarkSchedule,
    textSize, setTextSize,
    readHistory, markAsRead, weeklyStats,
    searchHistory, addSearchQuery, clearSearchHistory,
    readLaterQueue, toggleReadLater, isInReadLater,
    streak: streakData,
    isNewCard,
    hiddenCards, hideCard, isHidden,
  }), [
    theme, isDark, darkSchedule, textSize,
    readHistory, weeklyStats,
    searchHistory,
    readLaterQueue, isInReadLater,
    streakData, isNewCard,
    hiddenCards, isHidden,
    setTheme, setDarkSchedule, setTextSize,
    markAsRead, addSearchQuery, clearSearchHistory,
    toggleReadLater, hideCard,
  ]);

  return (
    <UXContext.Provider value={ctxValue}>
      {children}
    </UXContext.Provider>
  );
}
