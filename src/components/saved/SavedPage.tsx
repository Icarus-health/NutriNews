'use client';

export default function SavedPage({ bookmarks, collections }: { bookmarks: unknown[]; collections: unknown[] }) {
  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Gespeichert</h1>
      <p className="text-slate-400 text-sm">Lesezeichen ({bookmarks.length}) & Sammlungen ({collections.length})</p>
      {/* TODO: volle Implementierung */}
    </div>
  );
}
