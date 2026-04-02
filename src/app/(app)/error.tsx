'use client';

import { RefreshCw, Home } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
        Etwas ist schiefgelaufen
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
        Die Seite konnte nicht geladen werden. Bitte versuche es erneut oder gehe zur Startseite.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-forest-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-800 transition-colors"
        >
          <RefreshCw size={14} />
          Erneut versuchen
        </button>
        <a
          href="/"
          className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Home size={14} />
          Startseite
        </a>
      </div>
    </div>
  );
}
