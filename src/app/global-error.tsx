'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl mb-4">🔧</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Etwas ist schiefgelaufen</h1>
          <p className="text-sm text-slate-500 max-w-xs mb-6">
            Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
          </p>
          <button
            onClick={reset}
            className="bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
