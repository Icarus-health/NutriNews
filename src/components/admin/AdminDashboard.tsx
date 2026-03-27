'use client';

import { useState } from 'react';
import type { NewsCard } from '@/types/database';

interface Props {
  drafts: NewsCard[];
}

export default function AdminDashboard({ drafts }: Props) {
  const [tab, setTab] = useState<'drafts' | 'create' | 'auto'>('drafts');
  const [autoRunning, setAutoRunning] = useState(false);

  async function runAutoAgent() {
    setAutoRunning(true);
    const res = await fetch('/api/news/auto', { method: 'POST' });
    const data = await res.json();
    alert(data.message);
    setAutoRunning(false);
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Admin</h1>
      <div className="flex gap-2 mb-4">
        {(['drafts', 'create', 'auto'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              tab === t ? 'bg-forest-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {t === 'drafts' ? `Entwürfe (${drafts.length})` : t === 'create' ? 'Erstellen' : '🤖 Auto'}
          </button>
        ))}
      </div>

      {tab === 'drafts' && (
        <div className="space-y-2">
          {drafts.length === 0 && <p className="text-slate-400 text-sm">Keine Entwürfe vorhanden.</p>}
          {drafts.map((d) => (
            <div key={d.id} className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="font-semibold text-sm text-slate-800">{d.headline}</p>
              <p className="text-xs text-slate-400 mt-1">{d.category_main} · {d.evidence_level}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'create' && (
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-slate-400 text-sm">Manuelle NewsCard-Erstellung – kommt als nächstes!</p>
        </div>
      )}

      {tab === 'auto' && (
        <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
          <p className="text-sm text-slate-600 mb-4">KI holt automatisch aktuelle Ernährungsnews, bewertet die Evidenz und erstellt fertige Karten.</p>
          <button
            onClick={runAutoAgent}
            disabled={autoRunning}
            className="bg-forest-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-800 disabled:opacity-60 transition-colors"
          >
            {autoRunning ? '⏳ Läuft...' : '🤖 Jetzt 5 News automatisch holen'}
          </button>
        </div>
      )}
    </div>
  );
}
