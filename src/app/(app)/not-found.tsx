import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <span className="text-2xl">🔍</span>
      </div>
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
        Seite nicht gefunden
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
        Die gewünschte Seite existiert nicht oder wurde verschoben.
      </p>
      <a
        href="/"
        className="flex items-center gap-2 bg-forest-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-800 transition-colors"
      >
        <Home size={14} />
        Zur Startseite
      </a>
    </div>
  );
}
