'use client';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="text-6xl mb-4">📡</div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Keine Verbindung</h1>
      <p className="text-sm text-slate-500 max-w-xs">
        Du bist gerade offline. Sobald du wieder verbunden bist, kannst du Nutri News wie gewohnt nutzen.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 bg-forest-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-800 transition-colors"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
