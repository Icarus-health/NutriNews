'use client';
import type { Share } from '@/types/database';
import { Mail, MailOpen } from 'lucide-react';

export default function InboxPage({ shares }: { shares: Share[] }) {
  if (shares.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <MailOpen size={48} strokeWidth={1.2} className="mb-4 text-slate-300" />
        <p className="text-sm font-medium">Keine Nachrichten</p>
        <p className="text-xs mt-1 text-slate-300">Hier erscheinen Artikel, die dir Kolleg:innen schicken.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-4">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Posteingang</h1>
      <p className="text-xs text-slate-400 mb-4">{shares.length} {shares.length === 1 ? 'Nachricht' : 'Nachrichten'}</p>

      <div className="space-y-3">
        {shares.map(share => (
          <div
            key={share.id}
            className={`bg-white rounded-2xl border p-4 shadow-sm ${
              !share.read ? 'border-forest-200 bg-forest-50' : 'border-slate-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${
                !share.read ? 'text-forest-600' : 'text-slate-300'
              }`}>
                {share.read ? <MailOpen size={18} strokeWidth={1.8}/> : <Mail size={18} strokeWidth={1.8}/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-1">
                  Von <span className="font-medium text-slate-700">{share.sender?.full_name ?? share.sender?.email ?? 'Unbekannt'}</span>
                  {' · '}
                  {new Date(share.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                </p>
                {share.news_card && (
                  <p className="text-sm font-semibold text-slate-900 leading-snug">{share.news_card.headline}</p>
                )}
                {share.message && (
                  <p className="text-xs text-slate-500 mt-1 italic">&ldquo;{share.message}&rdquo;</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
