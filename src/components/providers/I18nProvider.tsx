'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isLocale, type Locale } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/messages';
import { updateLanguage } from '@/lib/actions/user';

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Hydrate from localStorage after mount (avoids SSR/client mismatch).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(stored)) setLocaleState(stored);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { document.documentElement.lang = locale; } catch { /* ignore */ }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(LOCALE_STORAGE_KEY, l); } catch { /* ignore */ }
    // Best-effort sync to the user's profile (no-op when logged out).
    updateLanguage(l).catch(() => { /* non-blocking */ });
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
