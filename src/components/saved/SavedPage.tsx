'use client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SavedPage({ bookmarks, collections }: { bookmarks: any[]; collections: any[] }) {
  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Gespeichert</h1>
      <p className="text-slate-400 text-sm">Lesezeichen ({bookmarks.length}) & Sammlungen ({collections.length})</p>
    </div>
  );
}
