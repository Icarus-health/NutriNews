'use client';
import type { Share } from '@/types/database';

export default function InboxPage({ shares }: { shares: Share[] }) {
  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Posteingang</h1>
      <p className="text-slate-400 text-sm">{shares.length} erhaltene Artikel</p>
    </div>
  );
}
