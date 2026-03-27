'use client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function InboxPage({ shares }: { shares: any[] }) {
  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Posteingang</h1>
      <p className="text-slate-400 text-sm">{shares.length} erhaltene Artikel</p>
    </div>
  );
}
