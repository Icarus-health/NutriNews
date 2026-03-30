'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

const CONSENT_KEY = 'nn-cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-2 max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-900/10 dark:shadow-black/30 border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Datenschutzhinweis
            </p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
              NutriNews verwendet ausschließlich technisch notwendige Cookies für die Anmeldung.
              Wir setzen keine Tracking- oder Werbe-Cookies ein. Einstellungen wie Dark Mode und
              Lesehistorie werden nur lokal in Ihrem Browser gespeichert.{' '}
              <Link href="/datenschutz" className="text-forest-600 dark:text-forest-400 underline">
                Mehr erfahren
              </Link>
            </p>
          </div>
          <button
            onClick={accept}
            aria-label="Schließen"
            className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <X size={13} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <button
          onClick={accept}
          className="mt-3 w-full bg-forest-700 text-white rounded-xl py-2 text-[13px] font-semibold hover:bg-forest-800 transition-colors"
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}
