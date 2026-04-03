'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════
// UX Settings: Dark Mode, Textgröße, Lesehistorie, Suchhistorie,
// Später-Lesen-Queue — alles in localStorage persistiert
// ═══════════════════════════════════════════════════════════════

type TextSize = 'small' | 'medium' | 'large';
type Theme = 'light' | 'dark' | 'system';

interface ReadHistoryEntry {
  cardId: string;
  headline: string;
  category: string;
  timestamp: number;
}

interface UXSettings {
  // Theme
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
  // Text size
  textSize: TextSize;
  setTextSize: (s: TextSize) => void;
  // Read history
  readHistory: ReadHistoryEntry[];
  markAsRead: (cardId: string, headline: string, category: string) => void;
  weeklyStats: { count: number; topCategories: string[] };
  // Search history
  searchHistory: string[];
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
  // Read later queue
  readLaterQueue: string[];
  toggleReadLater: (cardId: string) => void;
  isInReadLater: (cardId: string) => boolean;
  // Streak
  streak: { days: number; lastReadDate: string | null };
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

export default function UXProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [textSize, setTextSizeState] = useState<TextSize>('medium');
  const [readHistory, setReadHistory] = useState<ReadHistoryEntry[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [readLaterQueue, setReadLaterQueue] = useState<string[]>([]);
  const [streakData, setStreakData] = useState<{ days: number; lastReadDate: string | null }>({ days: 0, lastReadDate: null });
  const [systemDark, setSystemDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    setThemeState(getStored('nn-theme', 'light'));
    setTextSizeState(getStored('nn-text-size', 'medium'));
    setReadHistory(getStored('nn-read-history', []));
    setSearchHistory(getStored('nn-search-history', []));
    setReadLaterQueue(getStored('nn-read-later', []));
    setStreakData(getStored('nn-streak', { days: 0, lastReadDate: null }));

    // System dark preference
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    setMounted(true);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && systemDark);

  // Apply dark class to HTML element
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark, mounted]);

  // Apply text size CSS variable
  useEffect(() => {
    if (!mounted) return;
    const sizes = { small: '0.9', medium: '1', large: '1.15' };
    document.documentElement.style.setProperty('--text-scale', sizes[textSize]);
  }, [textSize, mounted]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    setStored('nn-theme', t);
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
    // Update streak
    setStreakData(prev => {
      const today = new Date().toISOString().split('T')[0];
      if (prev.lastReadDate === today) return prev; // Already counted today
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

  // Weekly stats
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

  return (
    <UXContext.Provider value={{
      theme, setTheme, isDark,
      textSize, setTextSize,
      readHistory, markAsRead, weeklyStats,
      searchHistory, addSearchQuery, clearSearchHistory,
      readLaterQueue, toggleReadLater, isInReadLater,
      streak: streakData,
    }}>
      {children}
    </UXContext.Provider>
  );
}
